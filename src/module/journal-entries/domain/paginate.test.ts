import { paginate } from './paginate';

const rows = Array.from({ length: 12 }, (_, i) => i + 1);

describe('paginate', () => {
  it('slices one page', () => {
    expect(paginate(rows, 2, 5)).toEqual({ page: 2, pageCount: 3, rows: [6, 7, 8, 9, 10] });
  });

  it('keeps the last short page', () => {
    expect(paginate(rows, 3, 5).rows).toEqual([11, 12]);
  });

  it('clamps a page that no longer exists after the list shrank', () => {
    expect(paginate(rows.slice(0, 3), 4, 5)).toEqual({ page: 1, pageCount: 1, rows: [1, 2, 3] });
  });

  it('has one empty page for an empty list', () => {
    expect(paginate([], 1, 25)).toEqual({ page: 1, pageCount: 1, rows: [] });
  });
});
