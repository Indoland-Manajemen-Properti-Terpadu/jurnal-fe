import { describe, expect, it } from 'vitest';
import { mapDocPage } from './saleDocMapper';
import { mapReturnDto, mapReturnSummary } from './saleReturnMapper';
import {
  buildApplyBody,
  buildRefundBody,
  buildReturnCreateBody,
  buildReturnUpdateBody,
} from './saleReturnPayloads';
import { emptyReturnForm, returnAll } from '../domain/saleReturnForm';
import type { Sale } from '../domain/sale';

// Shaped like the live answer of 2026-11-19 (customer and product shortened).
const issued = {
  id: 'r-1',
  transactionNumber: 'RTR-2026-00001',
  transactionDate: '2026-11-19T00:00:00.000Z',
  customer: { id: 'c-1', displayName: 'AAPT INDOMARCO PRISMATAMA 1' },
  sale: 's-1',
  saleNumber: 'FQ/011232130',
  reason: 'Salah tagih',
  settlement: 'CUSTOMER_CREDIT',
  items: [
    {
      _id: 'l-1',
      saleItem: 'i-1',
      product: { id: 'p', name: 'Claude' },
      quantity: 1,
      amount: 45000,
      taxAmount: 4851,
      withholdingAmount: 35294.12,
    },
  ],
  net: 44100,
  finalAmount: 13656.88,
  appliedToInvoice: 0,
  creditUsed: 1000,
  creditRemaining: 12656.88,
  refundAmount: 0,
  status: 'POSTED',
  displayStatus: 'ISSUED',
  applications: [
    {
      _id: 'a-1',
      sale: 's-2',
      saleNumber: 'PRO/INV/092026/040447',
      amount: 1000,
      appliedAt: '2026-11-19T00:00:00.000Z',
      voided: false,
    },
  ],
};

describe('mapReturnDto', () => {
  it('maps the document, its credit and its applications', () => {
    const ret = mapReturnDto(issued);
    expect(ret.status).toBe('POSTED');
    expect(ret.displayStatus).toBe('ISSUED');
    expect(ret.settlement).toBe('CUSTOMER_CREDIT');
    expect(ret.finalAmount).toBe(13656.88);
    expect(ret.creditRemaining).toBe(12656.88);
    expect(ret.items[0]).toMatchObject({
      saleItem: 'i-1',
      quantity: 1,
      withholdingAmount: 35294.12,
    });
    expect(ret.applications[0]).toEqual({
      id: 'a-1',
      sale: 's-2',
      saleNumber: 'PRO/INV/092026/040447',
      amount: 1000,
      appliedAt: '2026-11-19T00:00:00.000Z',
      voided: false,
    });
  });

  it('falls back to a draft and to taking the amount off the invoice', () => {
    const ret = mapReturnDto({ status: 'nonsense', settlement: 'x' });
    expect(ret.status).toBe('DRAFT');
    expect(ret.displayStatus).toBe('DRAFT');
    expect(ret.settlement).toBe('REDUCE_INVOICE');
  });

  it('shows an issued return when the server sends no display status', () => {
    expect(mapReturnDto({ status: 'POSTED' }).displayStatus).toBe('ISSUED');
  });
});

describe('return list', () => {
  it('reads results and the three figures above the table', () => {
    const page = mapDocPage(
      {
        results: [issued],
        totalResults: 1,
        summary: {
          thisMonth: { amount: 13656.88, count: 1 },
          credit: { amount: 13656.88, count: 1 },
          waiting: { amount: 0, count: 0 },
          counts: { draft: 0, issued: 1, completed: 0, cancelled: 0 },
        },
      },
      mapReturnDto,
      mapReturnSummary,
      { page: 1, limit: 10 }
    );
    expect(page.summary.credit).toEqual({ amount: 13656.88, count: 1 });
    expect(page.summary.counts.issued).toBe(1);
  });
});

describe('return payloads', () => {
  const sale = {
    id: 's-1',
    items: [
      { _id: 'i-1', quantity: 5, unitPrice: 10 },
      { _id: 'i-2', quantity: 1, unitPrice: 5 },
    ],
  } as unknown as Sale;
  const values = { ...emptyReturnForm(sale, '2026-11-19'), memo: 'x' };
  const withQty = {
    ...values,
    lines: values.lines.map((l, i) => ({ ...l, returnQty: i === 0 ? 2 : 0 })),
  };

  it('sends only the lines that take something back', () => {
    expect(buildReturnCreateBody(withQty).items).toEqual([{ saleItem: 'i-1', quantity: 2 }]);
    expect(
      buildReturnCreateBody(
        returnAll(values.lines) && { ...values, lines: returnAll(values.lines) }
      ).items
    ).toHaveLength(2);
  });

  it('sends the invoice on create but never on an edit', () => {
    expect(buildReturnCreateBody(withQty)).toHaveProperty('sale', 's-1');
    expect(buildReturnUpdateBody(withQty)).not.toHaveProperty('sale');
  });

  it('rounds the credit applied to the cent and leaves an empty refund memo out', () => {
    expect(buildApplyBody({ sale: 's-2', amount: 100.005, appliedAt: '2026-11-21' })).toEqual({
      sale: 's-2',
      amount: 100.01,
      appliedAt: '2026-11-21',
    });
    expect(
      buildRefundBody({ depositAccount: 'a-1', refundDate: '2026-11-22', memo: '  ' })
    ).not.toHaveProperty('memo');
    expect(
      buildRefundBody({ depositAccount: 'a-1', refundDate: '2026-11-22', memo: ' ok ' }).memo
    ).toBe('ok');
  });
});

describe('mapReturnDto activities', () => {
  it('reads the history the server sends, with who did it and what moved', () => {
    const ret = mapReturnDto({
      activities: [
        { type: 'CREATED', label: 'Dibuat', at: '2026-11-19T08:00:00.000Z', by: { name: 'Edi' } },
        {
          type: 'CREDIT_APPLIED',
          label: 'Kredit dipakai',
          at: '2026-11-19T00:00:00.000Z',
          amount: 1000,
          saleNumber: 'INV-1',
          voided: true,
        },
      ],
    });
    expect(ret.activities).toEqual([
      {
        type: 'CREATED',
        label: 'Dibuat',
        at: '2026-11-19T08:00:00.000Z',
        by: 'Edi',
        amount: null,
        saleNumber: '',
        voided: false,
      },
      {
        type: 'CREDIT_APPLIED',
        label: 'Kredit dipakai',
        at: '2026-11-19T00:00:00.000Z',
        by: '',
        amount: 1000,
        saleNumber: 'INV-1',
        voided: true,
      },
    ]);
  });

  it('has no history when the server sends none', () => {
    expect(mapReturnDto({}).activities).toEqual([]);
  });
});

describe('mapReturnDto journal', () => {
  it('keeps the id of the journal an issued return posted', () => {
    expect(mapReturnDto({ ...issued, journalTransaction: 'j-9' }).journalId).toBe('j-9');
  });

  it('reads an embedded journal and tolerates a return with none', () => {
    expect(mapReturnDto({ ...issued, journalTransaction: { id: 'j-8' } }).journalId).toBe('j-8');
    expect(mapReturnDto(issued).journalId).toBeNull();
  });
});
