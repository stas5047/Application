import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { Event, EventVisibility } from '../events/entities/event.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const eventRepo = AppDataSource.getRepository(Event);

  // --- Users ---
  const usersData = [
    { email: 'user1@example.com', password: 'password1' },
    { email: 'user2@example.com', password: 'password2' },
  ];

  const savedUsers: User[] = [];
  for (const userData of usersData) {
    let user = await userRepo.findOneBy({ email: userData.email });
    if (!user) {
      user = userRepo.create({
        email: userData.email,
        passwordHash: await bcrypt.hash(userData.password, 10),
        refreshTokenHash: null,
      });
      user = await userRepo.save(user);
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
    savedUsers.push(user);
  }

  const [user1, user2] = savedUsers;

  // --- Events ---
  const eventsData = [
    {
      title: 'Tech Meetup: NestJS Deep Dive',
      description:
        'An in-depth exploration of NestJS architecture and best practices.',
      dateTime: new Date('2026-04-15T18:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 50,
      visibility: EventVisibility.PUBLIC,
      organizer: user1,
    },
    {
      title: 'Frontend Workshop: React Performance',
      description: 'Learn advanced React performance optimization techniques.',
      dateTime: new Date('2026-05-10T10:00:00Z'),
      location: 'Innovation Center, Kyiv',
      capacity: 100,
      visibility: EventVisibility.PUBLIC,
      organizer: user1,
    },
    {
      title: 'Startup Networking Evening',
      description: 'Connect with startup founders and investors.',
      dateTime: new Date('2026-06-20T19:00:00Z'),
      location: 'Startup Campus, Kyiv',
      capacity: null,
      visibility: EventVisibility.PUBLIC,
      organizer: user2,
    },
  ];

  const savedEvents: Event[] = [];
  for (const eventData of eventsData) {
    let event = await eventRepo.findOne({
      where: {
        title: eventData.title,
        organizer: { id: eventData.organizer.id },
      },
      relations: ['participants'],
    });
    if (!event) {
      event = eventRepo.create({
        ...eventData,
        participants: [],
      });
      event = await eventRepo.save(event);
      console.log(`Created event: ${event.title}`);
    } else {
      console.log(`Event already exists: ${event.title}`);
    }
    savedEvents.push(event);
  }

  // --- Participants: user1 joins event3 ---
  const event3 = await eventRepo.findOne({
    where: { id: savedEvents[2].id },
    relations: ['participants'],
  });

  if (event3 && !event3.participants.some((p) => p.id === user1.id)) {
    event3.participants.push(user1);
    await eventRepo.save(event3);
    console.log(`user1 joined: ${event3.title}`);
  } else {
    console.log(`user1 already joined event3 or event3 not found`);
  }

  await AppDataSource.destroy();
  console.log('Seeding complete.');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
