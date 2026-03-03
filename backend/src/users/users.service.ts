import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { MyEventResponseDto } from './dto/my-event-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      passwordHash,
      refreshTokenHash: null,
    });
    return this.userRepository.save(user);
  }

  async updateRefreshTokenHash(
    userId: string,
    hash: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }

  async getMyEvents(userId: string): Promise<MyEventResponseDto[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin(
        'event.participants',
        'participant',
        'participant.id = :userId',
        { userId },
      )
      .select([
        'event.id',
        'event.title',
        'event.dateTime',
        'event.location',
        'event.organizerId',
      ])
      .orderBy('event.dateTime', 'ASC')
      .getMany();

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      role: event.organizerId === userId ? 'organizer' : 'participant',
    }));
  }
}
