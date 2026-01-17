import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/api";

export interface LoginResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface MeResponse {
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/api/v1/auth/login", { email, password }),

  register: (email: string, password: string, username: string) =>
    apiClient.post<RegisterResponse>("/api/v1/auth/register", {
      email,
      password,
      username,
    }),

  logout: () => apiClient.post<{ message: string }>("/api/v1/auth/logout"),

  wechatLogin: (code: string) => apiClient.post<LoginResponse>("/api/v1/auth/wechat", { code }),

  refresh: () => apiClient.post<RefreshResponse>("/api/v1/auth/refresh"),

  me: () => apiClient.get<MeResponse>("/api/v1/auth/me"),
};
