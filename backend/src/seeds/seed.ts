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
    { email: 'alice@example.com',  username: 'alice_dev',   password: 'password1' }, // tech, education
    { email: 'bob@example.com',    username: 'bob_builds',  password: 'password2' }, // tech, devops
    { email: 'carol@example.com',  username: 'carol_ux',    password: 'password3' }, // design, art
    { email: 'dan@example.com',    username: 'dan_ops',     password: 'password4' }, // health, sports
    { email: 'eve@example.com',    username: 'eve_startup', password: 'password5' }, // business, music, networking
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
    // ── PAST (before Mar 12) ──────────────────────────────────────────────────
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
      dateTime: new Date('2026-03-08T14:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 20,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    {
      title: 'UX Design Sprint',
      description: 'A 3-hour design sprint — from problem to prototype.',
      dateTime: new Date('2026-03-05T11:00:00Z'),
      location: 'Creative Space, Lviv',
      capacity: 15,
      visibility: EventVisibility.PUBLIC,
      organizer: carol,
    },
    {
      title: 'Jazz Night at Maidan',
      description: 'Live jazz from three local bands on an open-air stage.',
      dateTime: new Date('2026-03-03T19:00:00Z'),
      location: 'Maidan, Kyiv',
      capacity: null,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'Morning Run Club',
      description: '5 km group run through Holosiivskyi Park followed by stretching.',
      dateTime: new Date('2026-03-01T08:00:00Z'),
      location: 'Holosiivskyi Park, Kyiv',
      capacity: 40,
      visibility: EventVisibility.PUBLIC,
      organizer: dan,
    },

    // ── FUTURE (after Mar 18) ─────────────────────────────────────────────────
    {
      title: 'NestJS Deep Dive',
      description: 'Advanced NestJS patterns: guards, interceptors, custom decorators.',
      dateTime: new Date('2026-03-20T18:00:00Z'),
      location: 'Innovation Center, Kyiv',
      capacity: 50,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'Brand Identity Workshop',
      description: 'Build a visual identity from scratch — logo, palette, typography.',
      dateTime: new Date('2026-03-22T11:00:00Z'),
      location: 'Creative Space, Lviv',
      capacity: 20,
      visibility: EventVisibility.PUBLIC,
      organizer: carol,
    },
    {
      title: 'Startup Pitch Night',
      description: 'Present your idea to investors and mentors in a 5-minute pitch format.',
      dateTime: new Date('2026-03-25T19:00:00Z'),
      location: 'Startup Campus, Kyiv',
      capacity: 60,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'Yoga & Mindfulness Morning',
      description: 'Outdoor yoga flow followed by a 20-minute guided meditation session.',
      dateTime: new Date('2026-03-28T08:30:00Z'),
      location: 'Botanical Garden, Kyiv',
      capacity: 25,
      visibility: EventVisibility.PUBLIC,
      organizer: dan,
    },
    {
      title: 'React Performance Workshop',
      description: 'Memoization, lazy loading, and profiling React apps.',
      dateTime: new Date('2026-04-02T10:00:00Z'),
      location: 'Tech Hub, Kyiv',
      capacity: 40,
      visibility: EventVisibility.PUBLIC,
      organizer: alice,
    },
    {
      title: 'Electronic Music Production Masterclass',
      description: 'From DAW basics to sound design and mixing in Ableton Live.',
      dateTime: new Date('2026-04-05T14:00:00Z'),
      location: 'Sound Studio, Kyiv',
      capacity: 15,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'Illustration for Product Designers',
      description: 'Techniques for creating custom icons and hero illustrations for UI.',
      dateTime: new Date('2026-04-10T12:00:00Z'),
      location: 'Online (Figma)',
      capacity: 30,
      visibility: EventVisibility.PUBLIC,
      organizer: carol,
    },
    {
      title: 'PostgreSQL & TypeORM Masterclass',
      description: 'Migrations, relations, query optimization with TypeORM.',
      dateTime: new Date('2026-04-15T14:00:00Z'),
      location: 'Online (Google Meet)',
      capacity: 60,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    {
      title: 'Investor Relations Bootcamp',
      description: 'How to talk to VCs: decks, due diligence, and term sheets explained.',
      dateTime: new Date('2026-04-18T10:00:00Z'),
      location: 'Business Hub, Kyiv',
      capacity: 35,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'Trail Running & Nutrition',
      description: 'Technique clinic on trail running followed by a workshop on race-day nutrition.',
      dateTime: new Date('2026-04-22T09:00:00Z'),
      location: 'Syrets Park, Kyiv',
      capacity: 30,
      visibility: EventVisibility.PUBLIC,
      organizer: dan,
    },
    {
      title: 'CI/CD Pipelines with GitHub Actions',
      description: 'Build, test, and deploy automatically using GitHub Actions.',
      dateTime: new Date('2026-04-27T10:00:00Z'),
      location: 'Online (Zoom)',
      capacity: 100,
      visibility: EventVisibility.PUBLIC,
      organizer: bob,
    },
    {
      title: 'Open Mic Night',
      description: 'Acoustic performances — singers, poets, stand-up comedians all welcome.',
      dateTime: new Date('2026-05-03T19:00:00Z'),
      location: 'Culture Hub, Kyiv',
      capacity: null,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
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
      title: 'Product Demo Day',
      description: 'Teams present their Q2 builds. Open to all.',
      dateTime: new Date('2026-05-15T15:00:00Z'),
      location: 'Main Stage, Kyiv',
      capacity: 200,
      visibility: EventVisibility.PUBLIC,
      organizer: eve,
    },
    {
      title: 'Private Team Retrospective',
      description: 'Q2 retrospective for the core team only.',
      dateTime: new Date('2026-05-20T16:00:00Z'),
      location: 'Office, Kyiv',
      capacity: 10,
      visibility: EventVisibility.PRIVATE,
      organizer: bob,
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
    evTypescript,   // 0  past    alice
    evDocker,       // 1  past    bob
    evUx,           // 2  past    carol
    evJazz,         // 3  past    eve
    evRun,          // 4  past    dan
    evNest,         // 5  future  alice
    evBrand,        // 6  future  carol
    evPitch,        // 7  future  eve
    evYoga,         // 8  future  dan
    evReact,        // 9  future  alice
    evElectronic,   // 10 future  eve
    evIllustration, // 11 future  carol
    evPg,           // 12 future  bob
    evInvestor,     // 13 future  eve
    evTrail,        // 14 future  dan
    evCicd,         // 15 future  bob
    evOpenMic,      // 16 future  eve
    evFull,         // 17 future  carol
    evDemo,         // 18 future  eve
    evRetro,        // 19 future  bob (private)
  ] = savedEvents;

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

  // --- Tag Assignments ---
  const tagAssignments: [Event, string[]][] = [
    [evTypescript,   ['tech', 'education']],
    [evDocker,       ['tech', 'devops', 'education']],
    [evUx,           ['design', 'art', 'education']],
    [evJazz,         ['music', 'art']],
    [evRun,          ['sports', 'health']],
    [evNest,         ['tech', 'education', 'devops']],
    [evBrand,        ['design', 'art', 'business']],
    [evPitch,        ['business', 'networking', 'education']],
    [evYoga,         ['health', 'sports']],
    [evReact,        ['tech', 'education']],
    [evElectronic,   ['music', 'art', 'education']],
    [evIllustration, ['design', 'art', 'education']],
    [evPg,           ['tech', 'devops', 'education']],
    [evInvestor,     ['business', 'networking', 'education']],
    [evTrail,        ['sports', 'health', 'education']],
    [evCicd,         ['tech', 'devops']],
    [evOpenMic,      ['music', 'art', 'networking']],
    [evFull,         ['education', 'design']],
    [evDemo,         ['business', 'networking', 'tech']],
    [evRetro,        ['business']],
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

  // --- Participants ---
  // User profiles:
  //   alice   → tech, education         (joins tech/education events)
  //   bob     → tech, devops            (joins devops/tech events)
  //   carol   → design, art             (joins design/art events)
  //   dan     → health, sports          (joins health/sports events)
  //   eve     → business, music         (joins business/music/networking events)
  const participations: [Event, User[]][] = [
    // past
    [evTypescript,   [alice, bob, carol, dan, eve]],
    [evDocker,       [bob, alice, dan]],
    [evUx,           [carol, alice, eve]],
    [evJazz,         [eve, carol, dan]],
    [evRun,          [dan, bob, eve]],
    // future — tech / devops
    [evNest,         [alice, bob, carol]],
    [evReact,        [alice, bob, dan]],
    [evPg,           [bob, alice, eve]],
    [evCicd,         [bob, dan]],
    // future — design / art
    [evBrand,        [carol, alice, eve]],
    [evIllustration, [carol, alice]],
    [evFull,         [carol, alice, bob]],       // full 3/3
    // future — business / networking
    [evPitch,        [eve, carol, bob]],
    [evInvestor,     [eve, alice, dan]],
    [evDemo,         [eve, alice, bob, carol, dan]],
    // future — music / art
    [evElectronic,   [eve, carol, alice]],
    [evOpenMic,      [eve, carol, dan]],
    // future — health / sports
    [evYoga,         [dan, carol, alice]],
    [evTrail,        [dan, bob, eve]],
    // private
    [evRetro,        [bob, alice, carol]],
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