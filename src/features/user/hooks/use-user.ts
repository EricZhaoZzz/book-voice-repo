import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";

export const userKeys = {
  all: ["user"] as const,
  favorites: () => [...userKeys.all, "favorites"] as const,
  history: (limit?: number) => [...userKeys.all, "history", limit] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

export function useFavorites() {
  return useQuery({
    queryKey: userKeys.favorites(),
    queryFn: () => userApi.getFavorites(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => userApi.addFavorite(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.favorites() });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => userApi.removeFavorite(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.favorites() });
    },
  });
}

export function usePlayHistory(limit?: number) {
  return useQuery({
    queryKey: userKeys.history(limit),
    queryFn: () => userApi.getPlayHistory(limit),
    staleTime: 0, // Always fresh
  });
}

export function useUpdatePlayHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, position }: { lessonId: string; position: number }) =>
      userApi.updatePlayHistory(lessonId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.history() });
    },
  });
}

export function useLearningStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userApi.getLearningStats(),
    staleTime: 60 * 1000, // 1 minute
  });
}
