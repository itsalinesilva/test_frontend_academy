/**
 * API Contracts - Common Response & Request Schemas
 * Authoritative API structure based on doc 05 and 34
 */

export interface ApiResponse<TData = unknown> {
  success: true;
  data: TData;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export type ApiResult<TData = unknown> = ApiResponse<TData> | ApiErrorResponse;

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}
