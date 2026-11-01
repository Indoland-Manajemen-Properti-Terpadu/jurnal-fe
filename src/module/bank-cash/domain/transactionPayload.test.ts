import {
  balanceAfter,
  buildReceivePayload,
  buildSentPayload,
  buildTransferPayload,
  sumLineAmounts,
} from './transactionPayload';

const items = (...amounts: number[]) =>
  amounts.map((amount, index) => ({
    id: String(index),
    accountId: `a${index}`,
    description: '',
    amount,
  }));

describe('sumLineAmounts', () => {
  it('adds decimals without float drift', () => {
    expect(sumLineAmounts(items(0.1, 0.2))).toBe(0.3);
  });

  it('rounds each amount half up to the cent before adding', () => {
    expect(sumLineAmounts(items(1.005, 1.005))).toBe(2.02);
  });

  it('counts empty, NaN and infinite amounts as 0', () => {
    expect(sumLineAmounts(items(Number.NaN, Number.POSITIVE_INFINITY, 5))).toBe(5);
    expect(sumLineAmounts([])).toBe(0);
  });
});

describe('buildReceivePayload', () => {
  const base = {
    transactionDate: '2026-01-31',
    depositToAccountId: 'cash',
    depositAccountName: 'Kas Kecil',
    payerName: '',
    notes: '',
  };

  it('debits the cash account with the exact sum of the credit lines', () => {
    const payload = buildReceivePayload({ ...base, items: items(0.1, 0.2) });

    expect(payload.transactionDetail[0]).toMatchObject({ account: 'cash', debit: 0.3 });
    expect(payload.transactionDetail.slice(1).map((line) => line.credit)).toEqual([0.1, 0.2]);
  });

  it('rounds a typed amount with three decimals once, on both sides', () => {
    const payload = buildReceivePayload({ ...base, items: items(1500.505) });

    expect(payload.transactionDetail[0].debit).toBe(1500.51);
    expect(payload.transactionDetail[1].credit).toBe(1500.51);
  });

  it('uses the current default notes and descriptions', () => {
    const payload = buildReceivePayload({ ...base, payerName: 'PT Maju', items: items(100) });

    expect(payload.notes).toBe('Penerimaan kas masuk ke Kas Kecil dari PT Maju');
    expect(payload.transactionDetail[0].description).toBe('Penerimaan kas masuk dari PT Maju');
    expect(payload.transactionDetail[1].description).toBe('Penerimaan kas - PT Maju');
  });

  it('prefers typed notes and falls back to Kas/Bank when the account is unknown', () => {
    const typed = buildReceivePayload({ ...base, notes: '  Setoran  ', items: items(100) });
    const unknown = buildReceivePayload({
      ...base,
      depositAccountName: undefined,
      items: items(100),
    });

    expect(typed.notes).toBe('Setoran');
    expect(unknown.notes).toBe('Penerimaan kas masuk ke Kas/Bank');
  });
});

describe('buildSentPayload', () => {
  const base = {
    transactionDate: '2026-01-31',
    payFromAccountId: 'cash',
    payFromAccountName: 'Kas Kecil',
    recipientName: 'Toko A',
    notes: '',
  };

  it('debits the expense lines and credits the cash account last with the exact total', () => {
    const payload = buildSentPayload({ ...base, items: items(0.1, 0.2) });

    expect(payload.transactionDetail.slice(0, 2).map((line) => line.debit)).toEqual([0.1, 0.2]);
    expect(payload.transactionDetail[2]).toMatchObject({ account: 'cash', credit: 0.3 });
    expect(payload.notes).toBe('Pengeluaran kas dari Kas Kecil untuk Toko A');
  });
});

describe('buildTransferPayload', () => {
  it('debits the destination and credits the source with the same rounded amount', () => {
    const payload = buildTransferPayload({
      transactionDate: '2026-01-31',
      fromAccountId: 'bank',
      fromAccountName: 'Bank BCA',
      fromAccountNumber: '123',
      toAccountId: 'cash',
      toAccountName: 'Kas',
      toAccountNumber: '1-1000',
      amount: 250.505,
      notes: '',
    });

    expect(payload.transactionDetail).toEqual([
      { account: 'cash', description: 'Transfer masuk dari Bank BCA (123)', debit: 250.51 },
      { account: 'bank', description: 'Transfer keluar ke Kas (1-1000)', credit: 250.51 },
    ]);
    expect(payload.notes).toBe('Transfer dana dari Bank BCA ke Kas');
  });
});

describe('balanceAfter', () => {
  it('subtracts in cents and goes negative on overdraft', () => {
    expect(balanceAfter(0.3, 0.1)).toBe(0.2);
    expect(balanceAfter(100, 150)).toBe(-50);
  });
});
