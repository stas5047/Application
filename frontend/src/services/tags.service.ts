import apiClient from '@/lib/axios';
import type { TagResponse } from '@/types/tag.types';

export const tagsService = {
  getAll: () =>
    apiClient.get<TagResponse[]>('/tags').then((r) => r.data),
};
