import type { TagResponse } from './tag.types';

export type EventVisibility = 'public' | 'private';
export type EventRole = 'organizer' | 'participant';

export interface EventOrganizer {
  id: string;
  username: string;
}

export interface EventParticipant {
  id: string;
  username: string;
}

export interface EventForCta {
  id: string;
  capacity: number | null;
  participantCount: number;
  isJoined: boolean;
  organizerId: string;
}

export interface EventSummaryResponse extends EventForCta {
  title: string;
  description: string | null;
  dateTime: string;
  location: string;
  visibility: EventVisibility;
  organizer: EventOrganizer;
  tags: TagResponse[];
  createdAt: string;
}

export interface EventDetailResponse extends EventSummaryResponse {
  participants: EventParticipant[];
}

export interface CreateEventRequest {
  title: string;
  description?: string | null;
  dateTime: string;
  location: string;
  capacity?: number | null;
  visibility?: EventVisibility;
  tagNames?: string[];
}

export type UpdateEventRequest = Partial<CreateEventRequest>;
