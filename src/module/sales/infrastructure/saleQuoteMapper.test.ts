import { describe, expect, it } from 'vitest';
import { mapDocPage } from './saleDocMapper';
import type { SaleQuoteDto } from './saleQuoteDto';
import { mapQuoteDto, mapQuoteSummary } from './saleQuoteMapper';
import { buildQuoteBody, buildSendBody } from './saleQuotePayloads';
import { emptyQuoteForm } from '../domain/saleQuoteForm';

// Shaped like the live answer of 2026-11-19 (customer, product and tax shortened).
const accepted: SaleQuoteDto = {
  id: 'q-1',
  transactionNumber: 'PNW-2026-00001',
  transactionDate: '2026-11-19T00:00:00.000Z',
  validUntil: '2026-12-10T00:00:00.000Z',
  customer: { id: 'c-1', displayName: 'QA Kontak Tes', emails: ['qa@example.com'] },
  paymentTerm: null,
  unitTower: '',
  customerRefNumber: 'FE-TEST-001',
  isPriceIncludeTax: false,
  items: [
    {
      _id: 'l-1',
      product: { id: 'p-1', name: 'PERGANTIAN TEE DRAT' },
      description: 'Uji FE alur penjualan',
      quantity: 2,
      unitPrice: 1000000,
      tax: { id: 't-1', name: 'PPN 11%', rate: 11 },
      taxAmount: 198000,
      amount: 2000000,
      discountAmount: 200000,
    },
  ],
  subtotal: 2000000,
  discountType: 'percentage',
  discountValue: 10,
  discountAmount: 200000,
  taxAmount: 198000,
  total: 1998000,
  status: 'ACCEPTED',
  displayStatus: 'ACCEPTED',
  order: 'o-1',
  attachments: [],
  emails: [],
};

describe('mapQuoteDto', () => {
  it('maps the document, its lines and the order link', () => {
    const quote = mapQuoteDto(accepted);
    expect(quote.transactionNumber).toBe('PNW-2026-00001');
    expect(quote.customer).toEqual({
      id: 'c-1',
      displayName: 'QA Kontak Tes',
      emails: ['qa@example.com'],
    });
    expect(quote.status).toBe('ACCEPTED');
    expect(quote.displayStatus).toBe('ACCEPTED');
    expect(quote.order).toBe('o-1');
    expect(quote.total).toBe(1998000);
    expect(quote.items[0]).toMatchObject({
      id: 'l-1',
      quantity: 2,
      unitPrice: 1000000,
      tax: { id: 't-1', rate: 11 },
      discountAmount: 200000,
    });
  });

  it('shows EXPIRED when the server says so and falls back to the stored status', () => {
    expect(mapQuoteDto({ status: 'SENT', displayStatus: 'EXPIRED' }).displayStatus).toBe('EXPIRED');
    expect(mapQuoteDto({ status: 'SENT' }).displayStatus).toBe('SENT');
    expect(mapQuoteDto({ status: 'nonsense' }).status).toBe('DRAFT');
  });

  it('has no order when the API sends none', () => {
    expect(mapQuoteDto({ status: 'DRAFT', order: null }).order).toBeNull();
  });
});

describe('quote list and summary', () => {
  it('reads results, paging and the summary of a list answer', () => {
    const page = mapDocPage(
      {
        results: [accepted],
        page: 1,
        limit: 5,
        totalPages: 1,
        totalResults: 1,
        summary: {
          awaiting: { amount: 0, count: 0 },
          accepted: { amount: 1998000, count: 1 },
          counts: { running: 0, accepted: 1, finished: 0 },
          conversionRate: 1,
        },
        precision: 2,
      },
      mapQuoteDto,
      mapQuoteSummary,
      { page: 1, limit: 10 }
    );
    expect(page.items).toHaveLength(1);
    expect(page.pagination).toEqual({ total: 1, page: 1, limit: 5, totalPages: 1 });
    expect(page.summary.accepted).toEqual({ amount: 1998000, count: 1 });
    expect(page.summary.conversionRate).toBe(1);
  });

  it('keeps a null conversion rate and zero counts for an empty list', () => {
    const page = mapDocPage(
      { results: [], summary: { conversionRate: null } },
      mapQuoteDto,
      mapQuoteSummary,
      { page: 2, limit: 10 }
    );
    expect(page.pagination.page).toBe(2);
    expect(page.summary.conversionRate).toBeNull();
    expect(page.summary.counts).toEqual({ running: 0, accepted: 0, finished: 0 });
  });
});

describe('quote payloads', () => {
  const values = {
    ...emptyQuoteForm('2026-11-19'),
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
      { productId: 'p-2', description: '', unit: '', quantity: 1, unitPrice: 500, taxId: '' },
    ],
  };

  it('builds a create body with money to the cent and no empty optional fields', () => {
    const body = buildQuoteBody(values, 'create');
    expect(body.customer).toBe('c-1');
    expect(body.validUntil).toBe('2026-12-03');
    expect(body).not.toHaveProperty('transactionNumber');
    expect(body).not.toHaveProperty('paymentTerm');
    expect(body.items[0]).toEqual({
      product: 'p-1',
      description: 'Jasa',
      quantity: 2,
      unitPrice: 1000.01,
      tax: 't-1',
    });
    expect(body.items[1]).not.toHaveProperty('tax');
  });

  it('sends an empty payment term on update so the term is cleared', () => {
    expect(buildQuoteBody(values, 'update')).toHaveProperty('paymentTerm', '');
  });

  it('rounds a nominal discount and leaves a percentage as typed', () => {
    expect(
      buildQuoteBody({ ...values, discountType: 'nominal', discountValue: 10.005 }, 'create')
        .discountValue
    ).toBe(10.01);
    expect(
      buildQuoteBody({ ...values, discountType: 'percentage', discountValue: 12.5 }, 'create')
        .discountValue
    ).toBe(12.5);
  });

  it('sends addresses and a trimmed message, or an empty body to only mark as sent', () => {
    expect(buildSendBody({ emails: ['a@b.id'], message: ' halo ' })).toEqual({
      emails: ['a@b.id'],
      message: 'halo',
    });
    expect(buildSendBody({ emails: ['a@b.id'], message: '  ' })).toEqual({ emails: ['a@b.id'] });
    expect(buildSendBody({ emails: [], message: 'ignored' })).toEqual({});
  });
});
