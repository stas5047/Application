import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { UsersService } from '../users/users.service';
import { RecommendationResponseDto } from './dto/recommendation-response.dto';

interface CacheEntry {
  data: RecommendationResponseDto[];
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_LIMIT = 8;
const COLD_START_LIMIT = 10;
const JACCARD_THRESHOLD = 0.25;

@Injectable()
export class RecommendationsService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly usersService: UsersService,
  ) {}

  private computeJaccard(userTagSet: Set<string>, eventTags: string[]): number {
    if (userTagSet.size === 0 || eventTags.length === 0) return 0;
    const intersection = eventTags.filter((t) => userTagSet.has(t)).length;
    const union = new Set([...userTagSet, ...eventTags]).size;
    return intersection / union;
  }

  private getCached(userId: string): RecommendationResponseDto[] | null {
    const entry = this.cache.get(userId);
    if (entry && Date.now() < entry.expiresAt) return entry.data;
    this.cache.delete(userId);
    return null;
  }

  private setCached(userId: string, data: RecommendationResponseDto[]): void {
    this.cache.set(userId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  async getPersonalizedRecommendations(
    userId: string,
    limit = DEFAULT_LIMIT,
  ): Promise<RecommendationResponseDto[]> {
    const cached = this.getCached(userId);
    if (cached) return cached;

    const attendedTags = await this.usersService.getAttendedTags(userId);
    const isColdStart = attendedTags.length === 0;

    const raw = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.tags', 'tag')
      .loadRelationCountAndMap('event.participantCount', 'event.participants')
      .where('event.visibility = :v', { v: 'public' })
      .andWhere('event.organizerId != :userId', { userId })
      .andWhere(
        (qb) =>
          'event.id NOT IN ' +
          qb
            .subQuery()
            .select('ep.event_id')
            .from('event_participants', 'ep')
            .where('ep.user_id = :userId', { userId })
            .getQuery(),
      )
      .getMany();

    const candidates = raw as (Event & { participantCount: number })[];

    let scored: {
      event: Event & { participantCount: number };
      score: number;
    }[];

    if (isColdStart) {
      const sorted = [...candidates].sort((a, b) => {
        const countDiff = b.participantCount - a.participantCount;
        if (countDiff !== 0) return countDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      scored = sorted
        .slice(0, COLD_START_LIMIT)
        .map((event) => ({ event, score: 0 }));
    } else {
      const userTagSet = new Set(attendedTags);
      scored = candidates
        .map((event) => ({
          event,
          score: this.computeJaccard(
            userTagSet,
            event.tags.map((t) => t.name),
          ),
        }))
        .filter(({ score }) => score >= JACCARD_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    const result: RecommendationResponseDto[] = scored.map(
      ({ event, score }) =>
        ({
          id: event.id,
          title: event.title,
          description: event.description ?? null,
          dateTime: event.dateTime,
          location: event.location,
          capacity: event.capacity ?? null,
          visibility: event.visibility,
          organizerId: event.organizerId,
          createdAt: event.createdAt,
          organizer: {
            id: event.organizer.id,
            username: event.organizer.username,
          },
          participantCount: event.participantCount,
          isJoined: false,
          tags: event.tags.map((t) => ({ id: t.id, name: t.name })),
          matchScore: score,
        }) as RecommendationResponseDto,
    );

    this.setCached(userId, result);
    return result;
  }
}
