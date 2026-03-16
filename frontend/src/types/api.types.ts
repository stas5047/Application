import type { EventRole, EventVisibility } from './event.types';
import type { TagResponse } from './tag.types';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

export interface MyEventResponse {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  role: EventRole;
  visibility: EventVisibility;
  tags: TagResponse[];
}
