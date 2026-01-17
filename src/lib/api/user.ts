import { apiClient } from "@/lib/api/client";
import type { Favorite, PlayHistory } from "@/types/api";
import type {
  FavoriteWithLesson,
  PlayHistoryWithLesson,
  LearningStatsResult,
} from "@/services/user.service";

export const userApi = {
  getFavorites: () => apiClient.get<FavoriteWithLesson[]>("/api/v1/user/favorites"),

  addFavorite: (lessonId: string) =>
    apiClient.post<Favorite>("/api/v1/user/favorites", { lessonId }),

  removeFavorite: (lessonId: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/user/favorites/${lessonId}`),

  getPlayHistory: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    return apiClient.get<PlayHistoryWithLesson[]>(`/api/v1/user/history${query}`);
  },

  updatePlayHistory: (lessonId: string, position: number) =>
    apiClient.post<PlayHistory>("/api/v1/user/history", { lessonId, position }),

  getLearningStats: () => apiClient.get<LearningStatsResult>("/api/v1/user/stats"),
};
