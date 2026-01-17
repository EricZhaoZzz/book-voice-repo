import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function success<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status });
}

export function paginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
): NextResponse<ApiPaginatedResponse<T>> {
  return NextResponse.json({
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}

export function error(
  code: string,
  message: string,
  status: number
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const errors = {
  unauthorized: (message = "Unauthorized") => error("UNAUTHORIZED", message, 401),

  forbidden: (message = "Forbidden") => error("FORBIDDEN", message, 403),

  notFound: (message = "Not found") => error("NOT_FOUND", message, 404),

  badRequest: (message = "Bad request") => error("BAD_REQUEST", message, 400),

  conflict: (message = "Conflict") => error("CONFLICT", message, 409),

  validationError: (message = "Validation error") => error("VALIDATION_ERROR", message, 422),

  tokenExpired: (message = "Token expired") => error("TOKEN_EXPIRED", message, 401),

  tokenInvalid: (message = "Token invalid") => error("TOKEN_INVALID", message, 401),

  internal: (message = "Internal server error") => error("INTERNAL_ERROR", message, 500),
};
