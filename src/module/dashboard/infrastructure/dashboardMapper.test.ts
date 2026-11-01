import { describe, expect, it } from 'vitest';
import { mapBalanceSheet, mapSale, toMoney, toNumber } from './dashboardMapper';

describe('dashboardMapper', () => {
  it('treats non-numbers as 0', () => {
    expect(toNumber('12')).toBe(0);
    expect(toNumber(Number.NaN)).toBe(0);
    expect(toNumber(7)).toBe(7);
  });

  it('keeps whole rupiah and rounds amounts half up to the cent', () => {
    expect(toMoney(150_000_000)).toBe(150_000_000);
    expect(toMoney(1500.505)).toBe(1500.51);
    expect(toMoney(-1.005)).toBe(-1.01);
  });

  it('maps a sale with fallbacks and uppercases the status', () => {
    expect(mapSale({ _id: 'z', status: 'unpaid', total: 1500.5, remainingAmount: 0.125 })).toEqual({
      id: 'z',
      transactionNumber: '—',
      customerName: '—',
      transactionDate: null,
      dueDate: null,
      status: 'UNPAID',
      finalAmount: 1500.5,
      paidAmount: 0,
      remainingAmount: 0.13,
    });
  });

  it('maps a balance sheet and defaults missing parts', () => {
    const bs = mapBalanceSheet(
      {
        assets: {
          currentAssets: [{ accountName: 'Bank', categoryId: 'KB', balance: 10.005 }, null],
          totalCurrentAssets: 10.01,
        },
        totalAssets: 10.01,
      },
      '2026-10-16'
    );
    expect(bs.endDate).toBe('2026-10-16');
    expect(bs.currentAssets[0]).toMatchObject({ accountName: 'Bank', balance: 10.01 });
    expect(bs.currentAssets[1]).toMatchObject({ accountName: '—', balance: 0 });
    expect(bs.liabilities).toEqual([]);
    expect(bs.totalEquity).toBe(0);
  });
});

describe('mapSale net sales', () => {
  it('is the subtotal minus the discount, and absent when the API sends no subtotal', () => {
    expect(
      mapSale({ id: 'a', finalAmount: 1110, subtotal: 1000, discountAmount: 0 }).netSales
    ).toBe(1000);
    expect(
      mapSale({ id: 'b', finalAmount: 990, subtotal: 1000, discountAmount: 100 }).netSales
    ).toBe(900);
    expect(mapSale({ id: 'c', finalAmount: 500 }).netSales).toBeUndefined();
  });
});
