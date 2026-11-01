import { buildAccountOptions } from './accountOptions';

describe('buildAccountOptions', () => {
  it('labels an account with its number and name', () => {
    expect(buildAccountOptions([{ id: 'a', accountNumber: '1-1000', name: 'Kas' }])).toEqual([
      { value: 'a', label: '1-1000 - Kas' },
    ]);
  });

  it('leaves out the number when the account has none', () => {
    expect(buildAccountOptions([{ id: 'a', name: 'Kas' }])).toEqual([{ value: 'a', label: 'Kas' }]);
  });

  it('appends the suffix the caller derives from the account', () => {
    const options = buildAccountOptions(
      [{ id: 'a', accountNumber: '1-1000', name: 'Kas', type: 'Aset' }],
      (account) => ` (${account.type})`
    );

    expect(options[0].label).toBe('1-1000 - Kas (Aset)');
  });

  it('keeps the first of duplicate ids and skips entries without an id', () => {
    const options = buildAccountOptions([
      { id: 'a', name: 'Kas' },
      { id: 'a', name: 'Kas lagi' },
      { name: 'Tanpa id' },
      null,
    ]);

    expect(options).toEqual([{ value: 'a', label: 'Kas' }]);
  });
});
