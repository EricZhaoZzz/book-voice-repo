import { apiClient } from "@/lib/api/client";
import type { Textbook, Unit, Lesson, PaginationInfo } from "@/types/api";

export interface TextbookListResponse {
  data: Textbook[];
  pagination: PaginationInfo;
}

export interface TextbookListParams {
  grade?: string;
  page?: number;
  limit?: number;
}

export const textbooksApi = {
  getTextbooks: (params: TextbookListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.grade) searchParams.set("grade", params.grade);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    return apiClient.get<TextbookListResponse>(`/api/v1/textbooks${query ? `?${query}` : ""}`);
  },

  getTextbookById: (id: string) => apiClient.get<Textbook>(`/api/v1/textbooks/${id}`),

  getTextbookUnits: (id: string) => apiClient.get<Unit[]>(`/api/v1/textbooks/${id}/units`),
};

export const unitsApi = {
  getUnitById: (id: string) => apiClient.get<Unit>(`/api/v1/units/${id}`),

  getUnitLessons: (id: string) => apiClient.get<Lesson[]>(`/api/v1/units/${id}/lessons`),
};

export const lessonsApi = {
  getLessonById: (id: string) => apiClient.get<Lesson>(`/api/v1/lessons/${id}`),

  getLessonByQrToken: (token: string) => apiClient.get<Lesson>(`/api/v1/lessons/qr/${token}`),
};
