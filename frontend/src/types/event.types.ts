export type EventVisibility = 'public' | 'private';
export type EventRole = 'organizer' | 'participant';

export interface EventOrganizer {
  id: string;
  email: string;
}

export interface EventParticipant {
  id: string;
  email: string;
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
  createdAt: string;
}

export interface EventDetailResponse extends EventSummaryResponse {
  participants: EventParticipant[];
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  capacity?: number;
  visibility?: EventVisibility;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;
