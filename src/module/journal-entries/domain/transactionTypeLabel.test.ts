import { transactionTypeLabel } from './transactionTypeLabel';

describe('transactionTypeLabel', () => {
  it('uses the translation when there is one', () => {
    expect(transactionTypeLabel('TRANSFER_MONEY', () => 'Transfer Uang')).toBe('Transfer Uang');
  });

  it('writes a plain label for a type nobody has translated, never the raw translation key', () => {
    expect(transactionTypeLabel('DEFAULT', () => undefined)).toBe('Default');
    expect(transactionTypeLabel('PURCHASE_BILL', () => undefined)).toBe('Purchase Bill');
  });

  it('has nothing to say for no type', () => {
    expect(transactionTypeLabel('', () => undefined)).toBe('');
  });
});
