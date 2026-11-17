export interface ApiResponse<T> { success?: boolean; data: T; }

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta?: PageMeta;
}

export interface ApiErrorBody { success?: false; error: { code: string; message: string; details?: unknown }; }
