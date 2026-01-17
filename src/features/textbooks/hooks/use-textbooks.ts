import { useQuery } from "@tanstack/react-query";
import { textbooksApi, unitsApi, lessonsApi } from "@/lib/api/textbooks";
import type { TextbookListParams } from "@/lib/api/textbooks";

export const textbookKeys = {
  all: ["textbooks"] as const,
  lists: () => [...textbookKeys.all, "list"] as const,
  list: (params: TextbookListParams) => [...textbookKeys.lists(), params] as const,
  details: () => [...textbookKeys.all, "detail"] as const,
  detail: (id: string) => [...textbookKeys.details(), id] as const,
  units: (id: string) => [...textbookKeys.detail(id), "units"] as const,
};

export const unitKeys = {
  all: ["units"] as const,
  details: () => [...unitKeys.all, "detail"] as const,
  detail: (id: string) => [...unitKeys.details(), id] as const,
  lessons: (id: string) => [...unitKeys.detail(id), "lessons"] as const,
};

export const lessonKeys = {
  all: ["lessons"] as const,
  details: () => [...lessonKeys.all, "detail"] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  qr: (token: string) => [...lessonKeys.all, "qr", token] as const,
};

export function useTextbooks(params: TextbookListParams = {}) {
  return useQuery({
    queryKey: textbookKeys.list(params),
    queryFn: () => textbooksApi.getTextbooks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTextbook(id: string) {
  return useQuery({
    queryKey: textbookKeys.detail(id),
    queryFn: () => textbooksApi.getTextbookById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTextbookUnits(textbookId: string) {
  return useQuery({
    queryKey: textbookKeys.units(textbookId),
    queryFn: () => textbooksApi.getTextbookUnits(textbookId),
    enabled: !!textbookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: unitKeys.detail(id),
    queryFn: () => unitsApi.getUnitById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUnitLessons(unitId: string) {
  return useQuery({
    queryKey: unitKeys.lessons(unitId),
    queryFn: () => unitsApi.getUnitLessons(unitId),
    enabled: !!unitId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: () => lessonsApi.getLessonById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLessonByQrToken(token: string) {
  return useQuery({
    queryKey: lessonKeys.qr(token),
    queryFn: () => lessonsApi.getLessonByQrToken(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
