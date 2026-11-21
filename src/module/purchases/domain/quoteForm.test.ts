import type { PaymentTermOption } from '@/module/purchases/domain/purchaseCommon';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import {
  emptyQuoteForm,
  hasQuoteErrors,
  linesSubtotalMinor,
  QUOTE_LIMITS,
  toQuoteInput,
  validateQuoteForm,
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
  defaultDueDays: 30,
  defaultRetentionPercent: null,
  defaultMaintenanceMonths: null,
  paymentLabel: '',
  billingLabel: '',
  dueLabel: '',
  isActive: true,
  ...overrides,
});

const project = term({
  id: 't2',
  name: 'Termin proyek',
  advanceType: 'partial',
  billingSplit: 'milestone',
  hasRetention: true,
  defaultAdvancePercent: 30,
  defaultInstallments: 4,
  defaultRetentionPercent: 5,
  defaultMaintenanceMonths: 6,
});

const valid = (): QuoteFormValues => {
  const form = withTermDefaults(emptyQuoteForm(items), term());
  form.vendorId = 'v1';
  form.leadDays = 7;
  form.lines[0].unitPrice = 900000;
  return form;
};

const check = (values: QuoteFormValues, option = term(), filesMissing = false) =>
  validateQuoteForm(values, option, { filesMissing });

describe('validateQuoteForm', () => {
  it('accepts a complete quote', () => {
    expect(hasQuoteErrors(check(valid()))).toBe(false);
  });

  it('needs the vendor, the delivery estimate, the term and a price above 0', () => {
    const form = emptyQuoteForm(items);
    const errors = check(form, undefined);

    expect(errors.fields).toMatchObject({
      vendorId: 'vendorRequired',
      leadDays: 'leadDaysInvalid',
      paymentTermId: 'termRequired',
    });
    expect(errors.lines.i1).toEqual({ unitPrice: 'priceRequired' });
  });

  it.each([-1, 1.5])('refuses the delivery estimate %s', (days) => {
    const form = valid();
    form.leadDays = days;
    expect(check(form).fields.leadDays).toBe('leadDaysInvalid');
  });

  it('refuses a price of 0, which the service would accept as a free item', () => {
    const form = valid();
    form.lines[0].unitPrice = 0;
    expect(check(form).lines.i1.unitPrice).toBe('priceRequired');
  });

  it('refuses a negative final price but accepts a blank one', () => {
    const form = valid();
    form.lines[0].finalPrice = -1;
    expect(check(form).lines.i1.finalPrice).toBe('negative');
    form.lines[0].finalPrice = '';
    expect(hasQuoteErrors(check(form))).toBe(false);
  });

  it('keeps the texts within what the service takes', () => {
    const form = valid();
    form.number = 'n'.repeat(QUOTE_LIMITS.number + 1);
    form.warranty = 'w'.repeat(QUOTE_LIMITS.warranty + 1);
    form.lines[0].specification = 's'.repeat(QUOTE_LIMITS.specification + 1);
    const errors = check(form);

    expect(errors.fields).toMatchObject({ number: 'numberTooLong', warranty: 'warrantyTooLong' });
    expect(errors.lines.i1).toEqual({ specification: 'tooLong' });
  });

  it('refuses a discount above the value of the items and a negative amount', () => {
    const form = valid();
    form.discountAmount = 5_400_001;
    expect(check(form).fields.discountAmount).toBe('discountTooHigh');
    form.discountAmount = 5_400_000;
    expect(check(form).fields.discountAmount).toBeUndefined();
    form.discountAmount = -1;
    form.shippingAmount = -5;
    expect(check(form).fields).toMatchObject({
      discountAmount: 'amountNegative',
      shippingAmount: 'amountNegative',
    });
  });

  it('asks for the quote file only when told it is missing', () => {
    expect(check(valid(), term(), true).fields.id).toBe('filesRequired');
  });

  describe('the figures of the term', () => {
    const projectForm = () => withTermDefaults(valid(), project);

    it('starts from the term defaults', () => {
      const form = projectForm();
      expect(form).toMatchObject({
        paymentTermId: 't2',
        advancePercent: 30,
        installments: 4,
        retentionPercent: 5,
        maintenanceMonths: 6,
      });
      expect(hasQuoteErrors(check(form, project))).toBe(false);
    });

    it.each([0, 100, ''])('refuses an advance of %j', (advance) => {
      const form = projectForm();
      form.advancePercent = advance as number | '';
      expect(check(form, project).fields.advancePercent).toBe('advanceRange');
    });

    it('needs at least two installments', () => {
      const form = projectForm();
      form.installments = 1;
      expect(check(form, project).fields.installments).toBe('installmentsMin');
    });

    it('checks the installment percents add up to 100 and count the installments', () => {
      const form = projectForm();
      form.installments = 3;
      form.installmentPercents = [30, 30, 30];
      expect(check(form, project).fields.installmentPercents).toBe('percentsSum');
      form.installmentPercents = [40, 30, 30];
      expect(check(form, project).fields.installmentPercents).toBeUndefined();
      form.installmentPercents = [50, 50];
      expect(check(form, project).fields.installmentPercents).toBe('percentsSum');
      form.installmentPercents = [50, 50, 0];
      expect(check(form, project).fields.installmentPercents).toBe('percentsSum');
    });

    it('needs a retention between 0 and 100 and at least one month of maintenance', () => {
      const form = projectForm();
      form.retentionPercent = 0;
      form.maintenanceMonths = 0;
      expect(check(form, project).fields).toMatchObject({
        retentionPercent: 'retentionRange',
        maintenanceMonths: 'maintenanceInvalid',
      });
    });

    it('does not ask for figures a plain term does not have', () => {
      const form = valid();
      form.advancePercent = 0;
      form.retentionPercent = 0;
      expect(hasQuoteErrors(check(form))).toBe(false);
    });
  });
});

describe('toQuoteInput', () => {
  it('sends only the overrides of the term mechanism, with blank money as 0 and no tax as null', () => {
    const form = withTermDefaults(valid(), project);
    form.id = 'q9';
    form.discountAmount = '';
    form.shippingAmount = '';
    form.lines[0].finalPrice = 850000;
    form.scores.price = 4;

    const input = toQuoteInput(form, project);

    expect(input).toMatchObject({
      id: 'q9',
      vendor: 'v1',
      paymentTerm: 't2',
      termOverrides: {
        advancePercent: 30,
        installments: 4,
        dueDays: 30,
        retentionPercent: 5,
        maintenanceMonths: 6,
      },
      leadDays: 7,
      discountAmount: 0,
      shippingAmount: 0,
      lines: [{ requestItem: 'i1', unitPrice: 900000, finalPrice: 850000, tax: null }],
      scores: { price: 4 },
    });
    expect(toQuoteInput(valid(), term()).termOverrides).toEqual({ dueDays: 30 });
    expect(toQuoteInput(valid(), term())).not.toHaveProperty('id');
  });

  it('sends a blank valid-until date as null so a cleared date is cleared', () => {
    expect(toQuoteInput(valid(), term()).validUntil).toBeNull();
  });
});

describe('linesSubtotalMinor', () => {
  it('counts price times quantity in minor units', () => {
    const form = valid();
    form.lines[0].unitPrice = 12.5;
    expect(linesSubtotalMinor(form.lines)).toBe(7500);
  });
});
