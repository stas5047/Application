import apiClient from '@/lib/axios';

export const assistantService = {
  ask: (question: string): Promise<{ answer: string }> =>
    apiClient.post<{ answer: string }>('/assistant/ask', { question }).then((r) => r.data),
};
