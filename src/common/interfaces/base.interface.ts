export interface BaseEntity {
  id: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface QueryOptions {
  where?: Record<string, any>;
  include?: Record<string, any>;
  orderBy?: Record<string, any>;
  skip?: number;
  take?: number;
}

export interface SoftDeleteOptions {
  softDelete?: boolean;
}