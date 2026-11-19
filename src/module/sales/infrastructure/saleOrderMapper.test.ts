import { describe, expect, it } from 'vitest';
import { mapDocPage } from './saleDocMapper';
import type { SaleOrderDto } from './saleOrderDto';
import { mapOrderDto, mapOrderSummary } from './saleOrderMapper';
import { buildOrderBody } from './saleOrderPayloads';
import { emptyOrderForm } from '../domain/saleOrderForm';

// Shaped like the live answer of 2026-11-19 (customer, product and tax shortened).
const confirmed: SaleOrderDto = {
  id: 'o-1',
  transactionNumber: 'SO-2026-00001',
  transactionDate: '2026-11-19T00:00:00.000Z',
  targetDate: '2026-12-20T00:00:00.000Z',
  customer: { id: 'c-1', displayName: 'QA Kontak Tes' },
  quote: 'q-1',
  sale: null,
  deliveryAddress: '',
  items: [
    {
      _id: 'l-1',
      product: { id: 'p-1', name: 'P' },
      quantity: 2,
      unitPrice: 1000000,
      amount: 2000000,
    },
  ],
  total: 1998000,
  status: 'CONFIRMED',
  confirmedAt: '2026-11-19T08:05:22.071Z',
};

describe('mapOrderDto', () => {
  it('maps the document and the links to its quote and invoice', () => {
    const order = mapOrderDto(confirmed);
    expect(order.transactionNumber).toBe('SO-2026-00001');
    expect(order.status).toBe('CONFIRMED');
    expect(order.quote).toBe('q-1');
    expect(order.sale).toBeNull();
    expect(order.targetDate).toBe('2026-12-20T00:00:00.000Z');
    expect(order.total).toBe(1998000);
    expect(order.confirmedAt).toBe('2026-11-19T08:05:22.071Z');
  });

  it('falls back to a draft for an unknown status and reads a linked invoice as an id', () => {
    expect(mapOrderDto({ status: 'nonsense' }).status).toBe('DRAFT');
    expect(mapOrderDto({ status: 'COMPLETED', sale: { id: 's-1' } }).sale).toBe('s-1');
  });

  it('keeps an order without a target date', () => {
    expect(mapOrderDto({ targetDate: null }).targetDate).toBeNull();
  });
});

describe('order list', () => {
  it('reads results, paging and the three figures above the table', () => {
    const page = mapDocPage(
      {
        results: [confirmed],
        page: 1,
        limit: 5,
        totalPages: 1,
        totalResults: 1,
        summary: {
          awaiting: { amount: 0, count: 0 },
          ready: { amount: 1998000, count: 1 },
          invoiced: { amount: 0, count: 0 },
          counts: { running: 1, finished: 0, cancelled: 0 },
        },
      },
      mapOrderDto,
      mapOrderSummary,
      { page: 1, limit: 10 }
    );
    expect(page.items).toHaveLength(1);
    expect(page.summary.ready).toEqual({ amount: 1998000, count: 1 });
    expect(page.summary.counts.running).toBe(1);
  });
});

describe('buildOrderBody', () => {
  const values = {
    ...emptyOrderForm('2026-11-19'),
    customer: 'c-1',
    items: [
      {
        productId: 'p-1',
        description: 'Jasa',
        unit: '',
        quantity: 2,
        unitPrice: 1000.005,
        taxId: 't-1',
      },
    ],
  };

  it('sends the target date and rounds money to the cent', () => {
    const body = buildOrderBody(values, 'create');
    expect(body.targetDate).toBe('2026-12-19');
    expect(body).not.toHaveProperty('paymentTerm');
    expect(body.items[0].unitPrice).toBe(1000.01);
  });

  it('sends a null target date when none is given and an empty term on update', () => {
    const body = buildOrderBody({ ...values, targetDate: '' }, 'update');
    expect(body.targetDate).toBeNull();
    expect(body).toHaveProperty('paymentTerm', '');
  });
});
