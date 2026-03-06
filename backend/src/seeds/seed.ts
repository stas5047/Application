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
    { email: 'alice@example.com',   username: 'alice_dev',    password: 'password1' },
    { email: 'bob@example.com',     username: 'bob_builds',   password: 'password2' },
    { email: 'carol@example.com',   username: 'carol_ux',     password: 'password3' },
    { email: 'dan@example.com',     username: 'dan_ops',      password: 'password4' },
    { email: 'eve@example.com',     username: 'eve_startup',  password: 'password5' },
  ];

  const savedUsers: User[] = [];
  for (const userData of usersData) {
    let user = await userRepo.findOneBy({ email: userData.email });
    if (!user) {
      user = userRepo.create({
        email: userData.email,
        username: userData.username,
        passwordHash: await bcrypt.hash(userData.password, 10),
        refreshTokenHash: null,
      });
      user = await userRepo.save(user);
      console.log(`Created user: ${user.username}`);
    } else {
      console.log(`User already exists: ${user.username}`);
    }
    savedUsers.push(user);
  }

  const [alice, bob, carol, dan, eve] = savedUsers;

  // --- Events ---
  const eventsData = [
    // Past events (for calendar history testing)
    {
      title: 'TypeScript Fundamentals',
      description: 'A hands-on intro to TypeScript — types, interfaces, generics.',
      dateTime: new Date('2026-01-20T10:00:00Z'),
      location: 'Online (Zoom)',
      capacity: 30,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'Docker for Developers',
      description: 'Containerize your apps from zero to production.',
      dateTime: new Date('2026-02-14T14:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 20,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    // Current month events
    {
      title: 'NestJS Deep Dive',
      description: 'Advanced NestJS patterns: guards, interceptors, custom decorators.',
      dateTime: new Date('2026-03-10T18:00:00Z'),
      location: 'Innovation Center, Kyiv',
      capacity: 50,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'UX Design Sprint',
      description: 'A 3-hour design sprint — from problem to prototype.',
      dateTime: new Date('2026-03-18T11:00:00Z'),
      location: 'Creative Space, Lviv',
      capacity: 15,
      visibility: EventVisibility.PUBLIC,
      organizer: carol,
    },
    {
      title: 'Private Team Retrospective',
      description: 'Q1 retrospective for the core team only.',
      dateTime: new Date('2026-03-25T16:00:00Z'),
      location: 'Office, Kyiv',
      capacity: 10,
      visibility: EventVisibility.PRIVATE,
      organizer: dan,
    },
    // Future events
    {
      title: 'React Performance Workshop',
      description: 'Memoization, lazy loading, and profiling React apps.',
      dateTime: new Date('2026-04-05T10:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 40,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'Startup Networking Evening',
      description: 'Connect with founders and investors over drinks.',
      dateTime: new Date('2026-04-15T19:00:00Z'),
      location: 'Startup Campus, Kyiv',
      capacity: null,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'PostgreSQL & TypeORM Masterclass',
      description: 'Migrations, relations, query optimization with TypeORM.',
      dateTime: new Date('2026-04-22T14:00:00Z'),
      location: 'Online (Google Meet)',
      capacity: 60,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    {
      title: 'CI/CD Pipelines with GitHub Actions',
      description: 'Build, test, and deploy automatically using GitHub Actions.',
      dateTime: new Date('2026-05-10T10:00:00Z'),
      location: 'Online (Zoom)',
      capacity: 100,
      visibility: EventVisibility.PUBLIC,
      organizer: dan,
    },
    {
      title: 'Product Demo Day',
      description: 'Teams present their Q2 builds. Open to all.',
      dateTime: new Date('2026-06-01T15:00:00Z'),
      location: 'Main Stage, Kyiv',
      capacity: 200,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
  ];

  const savedEvents: Event[] = [];
  for (const eventData of eventsData) {
    let event = await eventRepo.findOne({
      where: { title: eventData.title, organizer: { id: eventData.organizer.id } },
      relations: ['participants'],
    });
    if (!event) {
      event = eventRepo.create({ ...eventData, participants: [] });
      event = await eventRepo.save(event);
      console.log(`Created event: ${event.title}`);
    } else {
      console.log(`Event already exists: ${event.title}`);
    }
    savedEvents.push(event);
  }

  const [
    evTypescript,   // 0 — past,    organizer: alice
    evDocker,       // 1 — past,    organizer: bob
    evNest,         // 2 — current, organizer: alice
    evUx,           // 3 — current, organizer: carol
    evRetro,        // 4 — current, organizer: dan  (private)
    evReact,        // 5 — future,  organizer: alice
    evNetworking,   // 6 — future,  organizer: eve  (unlimited capacity)
    evPg,           // 7 — future,  organizer: bob
    evCicd,         // 8 — future,  organizer: dan
    evDemo,         // 9 — future,  organizer: eve
  ] = savedEvents;

  // --- Participants ---
  // Format: [event, [...users to add]]
  const participations: [Event, User[]][] = [
    [evTypescript,  [bob, carol, dan, eve]],          // past, full-ish (4/30)
    [evDocker,      [alice, carol, dan]],              // past (3/20)
    [evNest,        [bob, carol, dan, eve]],           // current (4/50)
    [evUx,          [alice, bob, dan, eve]],              // current (4/15)
    [evRetro,       [alice, carol]],                   // private (3/10 incl. organizer)
    [evReact,       [bob, carol, eve]],                // future (3/40)
    [evNetworking,  [alice, bob, carol, dan]],         // future, unlimited
    [evPg,          [alice, carol, eve]],              // future (3/60)
    [evCicd,        [alice, bob, eve]],                // future (3/100)
    [evDemo,        [alice, bob, carol, dan]],         // future (4/200)
  ];

  for (const [event, users] of participations) {
    const freshEvent = await eventRepo.findOne({
      where: { id: event.id },
      relations: ['participants'],
    });
    if (!freshEvent) continue;

    let changed = false;
    for (const user of users) {
      if (!user?.id || freshEvent.participants.some((p) => p.id === user.id)) continue;
      // skip dummy placeholders (used only for capacity fill visual)
      try {
        const realUser = await userRepo.findOneBy({ id: user.id });
        if (!realUser) continue;
        freshEvent.participants.push(realUser);
        changed = true;
      } catch {
        continue;
      }
    }

    if (changed) {
      await eventRepo.save(freshEvent);
      console.log(`Updated participants for: ${freshEvent.title}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seeding complete.');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});