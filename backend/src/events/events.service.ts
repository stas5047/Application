import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventVisibility } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  EventDetailResponseDto,
  EventSummaryResponseDto,
} from './dto/event-response.dto';
import { TagsService } from '../tags/tags.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    private readonly tagsService: TagsService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  private assertFutureDate(dateTime: string): void {
    if (new Date(dateTime) <= new Date())
      throw new BadRequestException('dateTime must be in the future');
  }

  private async findEventOrFail(id: string): Promise<Event> {
    const event = await this.repo.findOneBy({ id });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  private async findWithParticipantsOrFail(id: string): Promise<Event> {
    const event = await this.repo.findOne({
      where: { id },
      relations: { participants: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findAllPublic(userId?: string): Promise<EventSummaryResponseDto[]> {
    const events = (await this.repo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.tags', 'tag')
      .loadRelationCountAndMap('event.participantCount', 'event.participants')
      .where('event.visibility = :visibility', {
        visibility: EventVisibility.PUBLIC,
      })
      .orderBy('event.dateTime', 'ASC')
      .getMany()) as (Event & { participantCount: number })[];

    let joinedSet = new Set<string>();
    if (userId) {
      const joined = await this.repo
        .createQueryBuilder('event')
        .innerJoin('event.participants', 'p', 'p.id = :userId', { userId })
        .select('event.id')
        .getMany();
      joinedSet = new Set(joined.map((e) => e.id));
    }

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      capacity: event.capacity,
      visibility: event.visibility,
      organizerId: event.organizerId,
      organizer: { id: event.organizer.id, username: event.organizer.username },
      participantCount: event.participantCount,
      isJoined: userId ? joinedSet.has(event.id) : false,
      tags: event.tags.map((t) => ({ id: t.id, name: t.name })),
      createdAt: event.createdAt,
    }));
  }

  async findOne(id: string, userId?: string): Promise<EventDetailResponseDto> {
    const event = await this.repo.findOne({
      where: { id },
      relations: { organizer: true, participants: true, tags: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    const isJoined = userId
      ? event.participants.some((p) => p.id === userId)
      : false;
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      capacity: event.capacity,
      visibility: event.visibility,
      organizerId: event.organizerId,
      organizer: { id: event.organizer.id, username: event.organizer.username },
      participantCount: event.participants.length,
      isJoined,
      tags: event.tags.map((t) => ({ id: t.id, name: t.name })),
      createdAt: event.createdAt,
      participants: event.participants.map((p) => ({
        id: p.id,
        username: p.username,
      })),
    };
  }

  async create(
    dto: CreateEventDto,
    organizerId: string,
  ): Promise<EventDetailResponseDto> {
    this.assertFutureDate(dto.dateTime);
    const entity = this.repo.create({
      title: dto.title,
      description: dto.description ?? null,
      dateTime: new Date(dto.dateTime),
      location: dto.location,
      capacity: dto.capacity ?? null,
      visibility: dto.visibility ?? EventVisibility.PUBLIC,
      organizerId,
    });
    const saved = await this.repo.save(entity);
    if (dto.tagNames && dto.tagNames.length > 0) {
      saved.tags = await this.tagsService.findOrCreateByNames(dto.tagNames);
      await this.repo.save(saved);
    }
    await this.repo
      .createQueryBuilder()
      .relation(Event, 'participants')
      .of(saved.id)
      .add(organizerId);
    return this.findOne(saved.id, organizerId);
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
  ): Promise<EventDetailResponseDto> {
    const event = await this.repo.findOne({
      where: { id },
      relations: { tags: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId)
      throw new ForbiddenException('Only the organizer can modify this event');
    if (dto.dateTime) this.assertFutureDate(dto.dateTime);

    const { tagNames, ...scalarFields } = dto;

    Object.assign(event, {
      ...scalarFields,
      dateTime: dto.dateTime ? new Date(dto.dateTime) : event.dateTime,
    });

    if (tagNames !== undefined) {
      event.tags = await this.tagsService.findOrCreateByNames(tagNames);
    }

    await this.repo.save(event);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findEventOrFail(id);
    if (event.organizerId !== userId)
      throw new ForbiddenException('Only the organizer can modify this event');
    await this.repo.remove(event);
  }

  async join(id: string, userId: string): Promise<EventDetailResponseDto> {
    const event = await this.findWithParticipantsOrFail(id);
    if (event.participants.some((p) => p.id === userId))
      throw new ConflictException('You have already joined this event');
    if (event.capacity !== null && event.participants.length >= event.capacity)
      throw new ConflictException('Event is at full capacity');
    await this.repo
      .createQueryBuilder()
      .relation(Event, 'participants')
      .of(id)
      .add(userId);
    this.recommendationsService.invalidateCache(userId);
    return this.findOne(id, userId);
  }

  async leave(id: string, userId: string): Promise<EventDetailResponseDto> {
    const event = await this.findWithParticipantsOrFail(id);
    if (event.organizerId === userId)
      throw new BadRequestException('Organizer cannot leave their own event');
    if (!event.participants.some((p) => p.id === userId))
      throw new ConflictException('You are not a participant of this event');
    await this.repo
      .createQueryBuilder()
      .relation(Event, 'participants')
      .of(id)
      .remove(userId);
    this.recommendationsService.invalidateCache(userId);
    return this.findOne(id, userId);
  }
}
