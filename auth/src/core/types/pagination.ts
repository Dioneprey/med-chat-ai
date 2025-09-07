export interface PaginationProps<T> {
  pageIndex: number;
  pageSize?: number;
  filters?: T;
}

export interface PaginationResponse<T> {
  data: T[];
  pageIndex: number;
  totalCount: number;
  totalPages: number;
}
