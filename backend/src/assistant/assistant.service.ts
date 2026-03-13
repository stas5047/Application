import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventVisibility } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChoice {
  message: {
    content: string;
  };
}

interface GroqChatResponse {
  choices: GroqChoice[];
}

@Injectable()
export class AssistantService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    private readonly configService: ConfigService,
  ) {}

  async ask(userId: string, question: string): Promise<string> {
    const [userEventsRaw, publicEventsRaw] = await Promise.all([
      this.eventRepo.find({
        where: { participants: { id: userId } },
        relations: { organizer: true, participants: true, tags: true },
        order: { dateTime: 'ASC' },
      }),
      this.eventRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.tags', 'tag')
        .leftJoinAndSelect('event.participants', 'participant')
        .where('event.visibility = :visibility', {
          visibility: EventVisibility.PUBLIC,
        })
        .orderBy('event.dateTime', 'ASC')
        .take(50)
        .getMany(),
    ]);

    const userEvents = userEventsRaw.map((event) => ({
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      tags: event.tags.map((t) => t.name),
      participantCount: event.participants.length,
      participants: event.participants.map((p) => p.username),
      role: event.organizerId === userId ? 'organizer' : 'participant',
    }));

    const publicEvents = publicEventsRaw.map((event) => ({
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      tags: event.tags.map((t) => t.name),
      participantCount: event.participants.length,
      participants: event.participants.slice(0, 10).map((p) => p.username),
    }));

    const today = new Date().toISOString().split('T')[0];

    const context = JSON.stringify({ userEvents, publicEvents, currentDate: today });

    const systemPrompt =
      `You are a helpful assistant for an event management app. ` +
      `Answer questions about events using ONLY the provided data. ` +
      `Never create, edit, or delete data. ` +
      `If you cannot answer, respond: 'Sorry, I didn't understand that. Please try rephrasing your question.' ` +
      `For public events, participant lists are limited to the first 10 attendees. ` +
      `Current date: ${today}`;

    const messages: GroqMessage[] = [
      { role: 'system', content: `${systemPrompt}\n\nEvent data:\n${context}` },
      { role: 'user', content: question },
    ];

    try {
      const apiKey = this.configService.get<string>('GROQ_API_KEY') ?? '';
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages,
            temperature: 0.3,
            max_tokens: 800,
          }),
        },
      );

      if (!response.ok) {
        return "Sorry, I didn't understand that. Please try rephrasing your question.";
      }

      const data = (await response.json()) as GroqChatResponse;
      return data.choices[0]?.message?.content ?? "Sorry, I didn't understand that. Please try rephrasing your question.";
    } catch {
      return "Sorry, I didn't understand that. Please try rephrasing your question.";
    }
  }
}
