export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}
