import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { Event, EventVisibility } from '../events/entities/event.entity';
import { Tag } from '../tags/entities/tag.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const eventRepo = AppDataSource.getRepository(Event);
  const tagRepo = AppDataSource.getRepository(Tag);

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
    {
      title: 'TypeScript Fundamentals',
      description: 'A hands-on intro to TypeScript — types, interfaces, generics.',
      dateTime: new Date('2026-03-10T10:00:00Z'),
      location: 'Online (Zoom)',
      capacity: 30,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'Docker for Developers',
      description: 'Containerize your apps from zero to production.',
      dateTime: new Date('2026-03-15T14:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 20,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    {
      title: 'UX Design Sprint',
      description: 'A 3-hour design sprint — from problem to prototype.',
      dateTime: new Date('2026-03-22T11:00:00Z'),
      location: 'Creative Space, Lviv',
      capacity: 15,
      visibility: EventVisibility.PUBLIC,
      organizer: carol,
    },
    {
      title: 'Private Team Retrospective',
      description: 'Q1 retrospective for the core team only.',
      dateTime: new Date('2026-03-28T16:00:00Z'),
      location: 'Office, Kyiv',
      capacity: 10,
      visibility: EventVisibility.PRIVATE,
      organizer: dan,
    },
    {
      title: 'NestJS Deep Dive',
      description: 'Advanced NestJS patterns: guards, interceptors, custom decorators.',
      dateTime: new Date('2026-04-05T18:00:00Z'),
      location: 'Innovation Center, Kyiv',
      capacity: 50,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'React Performance Workshop',
      description: 'Memoization, lazy loading, and profiling React apps.',
      dateTime: new Date('2026-04-12T10:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 40,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'Startup Networking Evening',
      description: 'Connect with founders and investors over drinks.',
      dateTime: new Date('2026-04-20T19:00:00Z'),
      location: 'Startup Campus, Kyiv',
      capacity: null,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'PostgreSQL & TypeORM Masterclass',
      description: 'Migrations, relations, query optimization with TypeORM.',
      dateTime: new Date('2026-04-27T14:00:00Z'),
      location: 'Online (Google Meet)',
      capacity: 60,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    {
      title: 'Workshop at Full Capacity',
      description: 'Hands-on workshop — limited to 3 seats, all taken.',
      dateTime: new Date('2026-05-08T10:00:00Z'),
      location: 'Coworking Space, Kyiv',
      capacity: 3,
      visibility: EventVisibility.PUBLIC,
      organizer: carol,
    },
    {
      title: 'CI/CD Pipelines with GitHub Actions',
      description: 'Build, test, and deploy automatically using GitHub Actions.',
      dateTime: new Date('2026-05-18T10:00:00Z'),
      location: 'Online (Zoom)',
      capacity: 100,
      visibility: EventVisibility.PUBLIC,
      organizer: dan,
    },
    {
      title: 'Product Demo Day',
      description: 'Teams present their Q2 builds. Open to all.',
      dateTime: new Date('2026-05-28T15:00:00Z'),
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

  // --- Tags ---
  const tagNames = [
    'tech', 'art', 'business', 'music', 'sports',
    'health', 'education', 'networking', 'design', 'devops',
  ];

  const savedTags: Record<string, Tag> = {};
  for (const name of tagNames) {
    let tag = await tagRepo.findOneBy({ name });
    if (!tag) {
      tag = tagRepo.create({ name });
      tag = await tagRepo.save(tag);
      console.log(`Created tag: ${tag.name}`);
    } else {
      console.log(`Tag already exists: ${tag.name}`);
    }
    savedTags[name] = tag;
  }

  const [
    evTypescript,   // 0  organizer: alice (Mar 10)
    evDocker,       // 1  organizer: bob   (Mar 15)
    evUx,           // 2  organizer: carol (Mar 22)
    evRetro,        // 3  organizer: dan   (Mar 28, private)
    evNest,         // 4  organizer: alice (Apr 5)
    evReact,        // 5  organizer: alice (Apr 12)
    evNetworking,   // 6  organizer: eve   (Apr 20, unlimited)
    evPg,           // 7  organizer: bob   (Apr 27)
    evFull,         // 8  organizer: carol (May 8, full 3/3)
    evCicd,         // 9  organizer: dan   (May 18)
    evDemo,         // 10 organizer: eve   (May 28)
  ] = savedEvents;

  // --- Participants ---
  // Format: [event, [...users to add]] — organizer is always first to mirror EventsService.create() behaviour
  const participations: [Event, User[]][] = [
    [evTypescript,  [alice, bob, carol, dan, eve]],   // alice = organizer (5/30)
    [evDocker,      [bob, alice, carol, dan]],         // bob   = organizer (4/20)
    [evUx,          [carol, alice, bob, dan, eve]],   // carol = organizer (5/15)
    [evRetro,       [dan, alice, carol]],              // dan   = organizer (3/10, private)
    [evNest,        [alice, bob, carol, dan, eve]],   // alice = organizer (5/50)
    [evReact,       [alice, bob, carol, eve]],         // alice = organizer (4/40)
    [evNetworking,  [eve, alice, bob, carol, dan]],   // eve   = organizer (5/unlimited)
    [evPg,          [bob, alice, carol, eve]],         // bob   = organizer (4/60)
    [evFull,        [carol, alice, bob]],              // carol = organizer (3/3, FULL)
    [evCicd,        [dan, alice, bob, eve]],           // dan   = organizer (4/100)
    [evDemo,        [eve, alice, bob, carol, dan]],   // eve   = organizer (5/200)
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

  // --- Tag Assignments ---
  const tagAssignments: [Event, string[]][] = [
    [evTypescript,  ['tech', 'education']],
    [evDocker,      ['tech', 'devops']],
    [evUx,          ['design', 'art']],
    [evRetro,       ['business']],
    [evNest,        ['tech', 'education']],
    [evReact,       ['tech']],
    [evNetworking,  ['networking', 'business']],
    [evPg,          ['tech', 'education']],
    [evFull,        ['education']],
    [evCicd,        ['tech', 'devops']],
    [evDemo,        ['business', 'networking']],
  ];

  for (const [event, names] of tagAssignments) {
    const freshEvent = await eventRepo.findOne({
      where: { id: event.id },
      relations: ['tags'],
    });
    if (!freshEvent) continue;

    let changed = false;
    for (const name of names) {
      const tag = savedTags[name];
      if (!tag) continue;
      if (freshEvent.tags.some((t) => t.id === tag.id)) continue;
      freshEvent.tags.push(tag);
      changed = true;
    }

    if (changed) {
      await eventRepo.save(freshEvent);
      console.log(`Updated tags for: ${freshEvent.title}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seeding complete.');
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});