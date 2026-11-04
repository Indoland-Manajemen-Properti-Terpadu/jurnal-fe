export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

/** The rows of one page, with the page clamped into range (a filter can shrink the list). */
export const paginate = <T>(rows: T[], page: number, pageSize: number) => {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return { page: current, pageCount, rows: rows.slice(start, start + pageSize) };
};
