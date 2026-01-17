import type {
  ApiSuccessResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
} from "@/lib/api/response";
import { supabase } from "@/lib/supabase/client";

type ApiResponse<T> = ApiSuccessResponse<T> | ApiPaginatedResponse<T> | ApiErrorResponse;

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl =
      typeof window !== "undefined"
        ? ""
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    } else {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = (await response.json()) as ApiResponse<T>;

    if ("error" in data) {
      if (data.error.code === "TOKEN_EXPIRED") {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          throw new Error("RETRY_REQUEST");
        }
      }
      throw new ApiError(data.error.code, data.error.message, response.status);
    }

    if ("pagination" in data) {
      return data as T;
    }

    return data.data as T;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as ApiSuccessResponse<{ accessToken: string }>;
      if ("data" in data && data.data.accessToken) {
        this.setAccessToken(data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const authHeaders = await this.getAuthHeaders();

    const config: RequestInit = {
      method,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
      credentials: "include",
      signal: options.signal,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "RETRY_REQUEST") {
        const response = await fetch(url, {
          ...config,
          headers: {
            ...(config.headers as Record<string, string>),
            Authorization: `Bearer ${this.accessToken}`,
          },
        });
        return await this.handleResponse<T>(response);
      }
      throw error;
    }
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", path, body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options);
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = new ApiClient();

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
