export class ApiResponseDto<T> {
  data: T;
  meta?: Record<string, unknown>;
  errors: null;

  constructor(data: T, meta?: Record<string, unknown>) {
    this.data = data;
    this.meta = meta;
    this.errors = null;
  }

  static success<T>(data: T, meta?: Record<string, unknown>): ApiResponseDto<T> {
    return new ApiResponseDto(data, meta);
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  errors: null;

  constructor(
    data: T[],
    total: number,
    page: number,
    perPage: number,
  ) {
    this.data = data;
    this.meta = {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasMore: page * perPage < total,
    };
    this.errors = null;
  }
}
