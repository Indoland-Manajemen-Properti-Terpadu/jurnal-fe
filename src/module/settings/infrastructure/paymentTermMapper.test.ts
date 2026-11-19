import { toPaymentTerm, toPaymentTermPage } from './paymentTermMapper';

const dto = {
  id: 't1',
  name: 'Net 30',
  appliesTo: 'both',
  description: '',
  usageExample: '',
  advanceType: 'none',
  defaultAdvancePercent: null,
  billingSplit: 'single',
  defaultInstallments: null,
  advanceOutsideInstallments: false,
  periodUnit: null,
  defaultPeriods: null,
  hasDueTerm: true,
  defaultDueDays: 30,
  dueBasis: 'vendor_invoice_date',
  hasRetention: false,
  defaultRetentionPercent: null,
  defaultMaintenanceMonths: null,
  isActive: true,
  isDefault: true,
  summary: {
    paymentLabel: 'Tanpa uang muka',
    billingLabel: 'Sekali tagih',
    dueLabel: '30 hari dari faktur vendor',
  },
  usageCount: 4,
  usageBreakdown: { purchase: 3, sale: 1 },
  canDelete: false,
};

describe('toPaymentTerm', () => {
  it('keeps what the API sends', () => {
    expect(toPaymentTerm(dto)).toEqual(dto);
  });

  it('fills the usage and summary of an older answer so the screens can rely on them', () => {
    const older = {
      ...dto,
      summary: undefined,
      usageCount: undefined,
      usageBreakdown: undefined,
      canDelete: undefined,
      isActive: undefined,
    };

    expect(toPaymentTerm(older)).toMatchObject({
      summary: { paymentLabel: '', billingLabel: '', dueLabel: '' },
      usageCount: 0,
      usageBreakdown: { purchase: 0, sale: 0 },
      canDelete: false,
      isActive: true,
    });
  });

  it('turns missing texts into empty strings', () => {
    expect(toPaymentTerm({ ...dto, description: undefined, usageExample: null })).toMatchObject({
      description: '',
      usageExample: '',
    });
  });
});

describe('toPaymentTermPage', () => {
  it('reads the list and the pagination', () => {
    const page = toPaymentTermPage({
      data: [dto],
      pagination: { total: 51, page: 2, limit: 50, totalPages: 2 },
    });
    expect(page.items).toHaveLength(1);
    expect(page.pagination).toEqual({ total: 51, page: 2, limit: 50, totalPages: 2 });
  });

  it('accepts a plain array and counts it as one page', () => {
    expect(toPaymentTermPage([dto, dto])).toMatchObject({
      items: [{ id: 't1' }, { id: 't1' }],
      pagination: { total: 2, page: 1, totalPages: 1 },
    });
  });

  it('treats an empty or missing body as an empty list', () => {
    expect(toPaymentTermPage(undefined)).toMatchObject({
      items: [],
      pagination: { total: 0, page: 1, totalPages: 0 },
    });
  });
});
