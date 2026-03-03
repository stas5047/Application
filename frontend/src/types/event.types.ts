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

export interface EventSummaryResponse {
  id: string;
  title: string;
  description: string | null;
  dateTime: string;
  location: string;
  capacity: number | null;
  visibility: EventVisibility;
  organizerId: string;
  organizer: EventOrganizer;
  participantCount: number;
  isJoined: boolean;
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
