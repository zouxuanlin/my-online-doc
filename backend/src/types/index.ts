export interface JwtPayload {
  userId: string;
  email: string;
}

export interface ApiResponse<T = any> {
  code: string;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
}
