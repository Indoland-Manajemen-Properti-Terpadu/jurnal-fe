import { describe, expect, it } from 'vitest';
import { toAccountRule } from './opnameAccountsApi';

describe('toAccountRule', () => {
  it('keeps the account of a reason and its choices', () => {
    const rule = toAccountRule({
      reason: 'rusak',
      label: 'Rusak',
      directions: ['loss'],
      accountId: 'a1',
      options: [{ id: 'a1', accountNumber: '6-60006', name: 'Beban Kerusakan Persediaan' }],
    });

    expect(rule).toMatchObject({ reason: 'rusak', accountId: 'a1', directions: ['loss'] });
    expect(rule.options).toHaveLength(1);
  });

  it('leaves the account empty when none is chosen yet', () => {
    expect(toAccountRule({ reason: 'hilang', accountId: null }).accountId).toBeNull();
  });
});
