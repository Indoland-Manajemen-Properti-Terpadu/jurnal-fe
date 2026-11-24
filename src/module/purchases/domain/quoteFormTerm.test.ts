import type { PaymentTermOption } from '@/module/purchases/domain/purchaseCommon';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import {
  emptyQuoteForm,
  percentTotal,
  resizePercents,
  toQuoteInput,
  withTermDefaults,
  type QuoteFormValues,
} from '@/module/purchases/domain/quoteForm';

const items: RequestItem[] = [
  {
    id: 'i1',
    kind: 'GOODS',
    product: null,
    description: 'Kertas',
    specification: '',
    quantity: 6,
    unit: { id: 'u1', name: 'rim' },
  },
];

const term = (overrides: Partial<PaymentTermOption> = {}): PaymentTermOption => ({
  id: 't1',
  name: 'Net 30',
  days: 30,
  advanceType: 'none',
  billingSplit: 'single',
  hasDueTerm: true,
  hasRetention: false,
  defaultAdvancePercent: null,
  defaultInstallments: null,
  defaultPeriods: null,
  periodUnit: 'monthly',
  defaultDueDays: 30,
  defaultRetentionPercent: null,
  defaultMaintenanceMonths: null,
  paymentLabel: '',
  billingLabel: '',
  dueLabel: '',
  isActive: true,
  ...overrides,
});

const valid = (): QuoteFormValues => {
  const form = withTermDefaults(emptyQuoteForm(items), term());
  form.vendorId = 'v1';
  form.number = 'QT-001';
  form.validUntil = '2026-12-07';
  form.leadDays = 7;
  form.lines[0].unitPrice = 900000;
  form.lines[0].specification = 'Putih 80 gsm';
  return form;
};

describe('a recurring term and its period unit', () => {
  const berkala = term({
    id: 't3',
    name: 'Berkala',
    billingSplit: 'recurring',
    defaultPeriods: 12,
    periodUnit: 'monthly',
  });

  it('starts on the unit of the master term and the default number of periods', () => {
    const form = withTermDefaults(valid(), berkala);
    expect(form.periods).toBe(12);
    expect(form.periodUnit).toBe('monthly');
  });

  it('sends the chosen unit with the periods', () => {
    const form = withTermDefaults(valid(), berkala);
    form.periodUnit = 'quarterly';
    form.periods = 4;

    expect(toQuoteInput(form, berkala).termOverrides).toMatchObject({
      periods: 4,
      periodUnit: 'quarterly',
    });
  });

  it('has no unit for a term that does not recur', () => {
    const form = withTermDefaults(valid(), term());
    expect(form.periodUnit).toBe('');
    expect(toQuoteInput(form, term()).termOverrides).not.toHaveProperty('periodUnit');
  });
});

describe('custom installment percents', () => {
  it('keeps what was typed when the number of installments changes', () => {
    expect(resizePercents([40, 60], 3)).toEqual([40, 60, '']);
    expect(resizePercents([10, 20, 30, 40], 2)).toEqual([10, 20]);
  });

  it('adds up what is typed, counting a blank slot as 0, without float noise', () => {
    expect(percentTotal([9.5, 19, 28.5, 38, 5])).toBe(100);
    expect(percentTotal([33.33, 33.33, ''])).toBe(66.66);
    expect(percentTotal([])).toBe(0);
  });
});
