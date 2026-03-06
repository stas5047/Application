import { create } from 'zustand';
import { eventsService } from '@/services/events.service';
import type { MyEventResponse } from '@/types/api.types';
import type {
  CreateEventRequest,
  EventDetailResponse,
  EventSummaryResponse,
  UpdateEventRequest,
} from '@/types/event.types';

interface EventsState {
  events: EventSummaryResponse[];
  myEvents: MyEventResponse[];
  fetchEvents: () => Promise<void>;
  fetchMyEvents: () => Promise<void>;
  createEvent: (data: CreateEventRequest) => Promise<EventDetailResponse>;
  updateEvent: (id: string, data: UpdateEventRequest) => Promise<EventDetailResponse>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (id: string) => Promise<EventDetailResponse>;
  leaveEvent: (id: string) => Promise<EventDetailResponse>;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  myEvents: [],

  fetchEvents: async () => {
    const events = await eventsService.getAll();
    set({ events });
  },

  fetchMyEvents: async () => {
    const myEvents = await eventsService.getMyEvents();
    set({ myEvents });
  },

  createEvent: async (data: CreateEventRequest) => {
    const event = await eventsService.create(data);
    set((state) => ({ events: [...state.events, event] }));
    return event;
  },

  updateEvent: async (id: string, data: UpdateEventRequest) => {
    const updated = await eventsService.update(id, data);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  deleteEvent: async (id: string) => {
    await eventsService.delete(id);
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },

  joinEvent: async (id: string) => {
    const updated = await eventsService.join(id);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },

  leaveEvent: async (id: string) => {
    const updated = await eventsService.leave(id);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }));
    return updated;
  },
}));
