import apiClient from '@/lib/axios';
import type { MyEventResponse } from '@/types/api.types';
import type {
  CreateEventRequest,
  EventDetailResponse,
  EventSummaryResponse,
  UpdateEventRequest,
} from '@/types/event.types';

export const eventsService = {
  getAll: () =>
    apiClient.get<EventSummaryResponse[]>('/events').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<EventDetailResponse>(`/events/${id}`).then((r) => r.data),

  create: (data: CreateEventRequest) =>
    apiClient.post<EventDetailResponse>('/events', data).then((r) => r.data),

  update: (id: string, data: UpdateEventRequest) =>
    apiClient.patch<EventDetailResponse>(`/events/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/events/${id}`).then((r) => r.data),

  join: (id: string) =>
    apiClient.post<EventDetailResponse>(`/events/${id}/join`).then((r) => r.data),

  leave: (id: string) =>
    apiClient.post<EventDetailResponse>(`/events/${id}/leave`).then((r) => r.data),

  getMyEvents: () =>
    apiClient.get<MyEventResponse[]>('/users/me/events').then((r) => r.data),
};
