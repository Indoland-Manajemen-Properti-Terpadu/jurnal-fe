import { groupCategoryOptions } from './categoryOptions';

const cats = [
  { id: 'kb', categoryID: 'KB', name: 'Kas & Bank' },
  { id: 'pen', categoryID: 'PEN', name: 'Pendapatan' },
  { categoryID: 'EKU', name: 'No id is skipped' },
  { id: 'x', categoryID: 'EKU' },
];

describe('groupCategoryOptions', () => {
  it('splits balance sheet (1-3) from profit and loss (4-8) and skips categories without id', () => {
    const groups = groupCategoryOptions(cats, 'id');
    expect(groups).toEqual([
      {
        group: 'Kelompok Akun Neraca (1-XXXX – 3-XXXX)',
        items: [
          { value: 'kb', label: '1-XXXX · Kas & Bank' },
          { value: 'x', label: '3-XXXX · Unnamed category' },
        ],
      },
      {
        group: 'Kelompok Akun Laba Rugi (4-XXXX – 8-XXXX)',
        items: [{ value: 'pen', label: '4-XXXX · Pendapatan' }],
      },
    ]);
  });

  it('translates the group titles and drops empty groups', () => {
    expect(groupCategoryOptions([cats[0]], 'en')).toEqual([
      {
        group: 'Balance Sheet Accounts (1-XXXX – 3-XXXX)',
        items: [{ value: 'kb', label: '1-XXXX · Kas & Bank' }],
      },
    ]);
    expect(groupCategoryOptions([], 'en')).toEqual([]);
  });
});
