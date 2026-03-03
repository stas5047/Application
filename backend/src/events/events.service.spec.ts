import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { Event, EventVisibility } from './entities/event.entity';
import { User } from '../users/entities/user.entity';

type MockRelationQueryBuilder = {
  of: jest.Mock;
  add: jest.Mock;
  remove: jest.Mock;
};

type MockQueryBuilder = {
  leftJoinAndSelect: jest.Mock;
  loadRelationCountAndMap: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  orderBy: jest.Mock;
  select: jest.Mock;
  relation: jest.Mock;
  getMany: jest.Mock;
};

const makeRelationQb = (): MockRelationQueryBuilder => ({
  of: jest.fn().mockReturnThis(),
  add: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
});

const makeQueryBuilder = (getManyResult: Event[] = []): MockQueryBuilder => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  loadRelationCountAndMap: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  relation: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(getManyResult),
});

const buildUser = (id: string, email: string): User =>
  ({ id, email }) as unknown as User;

const buildEvent = (overrides: Partial<Event> = {}): Event =>
  ({
    id: 'event-uuid',
    title: 'Test Event',
    description: null,
    dateTime: new Date(Date.now() + 86400000),
    location: 'Berlin',
    capacity: null,
    visibility: EventVisibility.PUBLIC,
    organizerId: 'organizer-uuid',
    organizer: buildUser('organizer-uuid', 'org@example.com'),
    participants: [],
    createdAt: new Date(),
    ...overrides,
  }) as Event;

describe('EventsService', () => {
  let service: EventsService;
  let relationQb: MockRelationQueryBuilder;
  let queryQb: MockQueryBuilder;

  const mockRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    relationQb = makeRelationQb();
    queryQb = makeQueryBuilder();

    mockRepo.createQueryBuilder.mockReturnValue({
      ...queryQb,
      relation: jest.fn().mockReturnValue(relationQb),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  // --- findOne ---

  it('findOne: throws NotFoundException when event does not exist', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne: throws NotFoundException for private event when user is not organizer or participant', async () => {
    const event = buildEvent({
      visibility: EventVisibility.PRIVATE,
      organizerId: 'organizer-uuid',
      participants: [buildUser('other-user', 'x@x.com')],
    });
    mockRepo.findOne.mockResolvedValue(event);
    await expect(
      service.findOne('event-uuid', 'stranger-uuid'),
    ).rejects.toThrow(NotFoundException);
  });

  // --- create ---

  it('create: throws BadRequestException for past dateTime', async () => {
    await expect(
      service.create(
        {
          title: 'Past Event',
          dateTime: new Date(Date.now() - 1000).toISOString(),
          location: 'Berlin',
        },
        'organizer-uuid',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('create: saves entity and adds organizer as participant', async () => {
    const savedEvent = buildEvent({ id: 'new-event-uuid' });
    mockRepo.create.mockReturnValue(savedEvent);
    mockRepo.save.mockResolvedValue(savedEvent);

    const fullEvent = buildEvent({
      id: 'new-event-uuid',
      organizer: buildUser('organizer-uuid', 'org@example.com'),
      participants: [buildUser('organizer-uuid', 'org@example.com')],
    });
    mockRepo.findOne.mockResolvedValue(fullEvent);

    const relQb = makeRelationQb();
    mockRepo.createQueryBuilder.mockReturnValue({
      relation: jest.fn().mockReturnValue(relQb),
    });

    await service.create(
      {
        title: 'Future Event',
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Berlin',
      },
      'organizer-uuid',
    );

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(relQb.add).toHaveBeenCalledWith('organizer-uuid');
  });

  // --- update ---

  it('update: throws ForbiddenException when user is not organizer', async () => {
    const event = buildEvent({ organizerId: 'organizer-uuid' });
    mockRepo.findOneBy.mockResolvedValue(event);
    await expect(
      service.update('event-uuid', { title: 'New Title' }, 'stranger-uuid'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('update: throws BadRequestException for past dateTime', async () => {
    const event = buildEvent({ organizerId: 'organizer-uuid' });
    mockRepo.findOneBy.mockResolvedValue(event);
    await expect(
      service.update(
        'event-uuid',
        { dateTime: new Date(Date.now() - 1000).toISOString() },
        'organizer-uuid',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // --- remove ---

  it('remove: throws ForbiddenException when user is not organizer', async () => {
    const event = buildEvent({ organizerId: 'organizer-uuid' });
    mockRepo.findOneBy.mockResolvedValue(event);
    await expect(service.remove('event-uuid', 'stranger-uuid')).rejects.toThrow(
      ForbiddenException,
    );
  });

  // --- join ---

  it('join: throws NotFoundException for private event when user is not organizer or participant', async () => {
    const event = buildEvent({
      visibility: EventVisibility.PRIVATE,
      organizerId: 'organizer-uuid',
      participants: [],
    });
    mockRepo.findOne.mockResolvedValue(event);
    await expect(service.join('event-uuid', 'stranger-uuid')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('join: throws ConflictException when user already joined', async () => {
    const event = buildEvent({
      participants: [buildUser('user-uuid', 'u@u.com')],
    });
    mockRepo.findOne.mockResolvedValue(event);
    await expect(service.join('event-uuid', 'user-uuid')).rejects.toThrow(
      ConflictException,
    );
  });

  it('join: throws ConflictException when event is at capacity', async () => {
    const event = buildEvent({
      capacity: 1,
      participants: [buildUser('other-user', 'o@o.com')],
    });
    mockRepo.findOne.mockResolvedValue(event);
    await expect(service.join('event-uuid', 'user-uuid')).rejects.toThrow(
      ConflictException,
    );
  });

  it('join: calls relation.add on success', async () => {
    const event = buildEvent({ capacity: null, participants: [] });
    const fullEvent = buildEvent({
      organizer: buildUser('organizer-uuid', 'org@example.com'),
      participants: [buildUser('user-uuid', 'u@u.com')],
    });

    mockRepo.findOne
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce(fullEvent);

    const relQb = makeRelationQb();
    mockRepo.createQueryBuilder.mockReturnValue({
      relation: jest.fn().mockReturnValue(relQb),
    });

    await service.join('event-uuid', 'user-uuid');
    expect(relQb.add).toHaveBeenCalledWith('user-uuid');
  });

  // --- leave ---

  it('leave: throws ConflictException when user is not a participant', async () => {
    const event = buildEvent({ participants: [] });
    mockRepo.findOne.mockResolvedValue(event);
    await expect(service.leave('event-uuid', 'user-uuid')).rejects.toThrow(
      ConflictException,
    );
  });

  it('leave: calls relation.remove on success', async () => {
    const event = buildEvent({
      participants: [buildUser('user-uuid', 'u@u.com')],
    });
    const fullEvent = buildEvent({
      organizer: buildUser('organizer-uuid', 'org@example.com'),
      participants: [],
    });

    mockRepo.findOne
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce(fullEvent);

    const relQb = makeRelationQb();
    mockRepo.createQueryBuilder.mockReturnValue({
      relation: jest.fn().mockReturnValue(relQb),
    });

    await service.leave('event-uuid', 'user-uuid');
    expect(relQb.remove).toHaveBeenCalledWith('user-uuid');
  });

  // --- findAllPublic ---

  it('findAllPublic: sets isJoined=false for all events when no userId', async () => {
    const events = [
      buildEvent({
        id: 'e1',
        organizer: buildUser('organizer-uuid', 'org@example.com'),
      }),
      buildEvent({
        id: 'e2',
        organizer: buildUser('organizer-uuid', 'org@example.com'),
      }),
    ];

    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      loadRelationCountAndMap: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(events),
    };

    mockRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findAllPublic();

    expect(result.every((r) => r.isJoined === false)).toBe(true);
  });
});
