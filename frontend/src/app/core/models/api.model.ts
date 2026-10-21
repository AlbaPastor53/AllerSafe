export interface ApiResponse<T> { success?: boolean; data: T; }
export interface ApiErrorBody { success?: false; error: { code: string; message: string; details?: unknown }; }
