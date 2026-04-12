import type { ApiResponse, ApiMeta, ApiError } from '@ymshots/types';

export function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return { data, ...(meta ? { meta } : {}) };
}

export function paginated<T>(data: T[], page: number, limit: number, total: number): ApiResponse<T[]> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  };
}

export function error(code: string, message: string, details?: Record<string, unknown>): { error: ApiError } {
  return { error: { code, message, ...(details ? { details } : {}) } };
}
