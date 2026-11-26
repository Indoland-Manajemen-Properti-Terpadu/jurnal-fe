/** Paginated document list; each endpoint may include its own summary. */
export interface ListDto<T, Summary = never> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  summary?: Summary;
  precision?: number;
}
