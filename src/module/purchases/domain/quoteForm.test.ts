import type { PaymentTermOption } from '@/module/purchases/domain/purchaseCommon';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import {
  addDays,
  appliesToOf,
  composeWarranty,
  defaultTaxId,
  parseWarranty,
  QUOTE_VALID_DAYS,
} from '@/module/purchases/domain/quoteDefaults';
import { estimateQuote } from '@/module/purchases/domain/quoteEstimate';
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
  form.number = 'QT-001';
  form.validUntil = '2026-12-07';
  form.leadDays = 7;
  form.lines[0].unitPrice = 900000;
  form.lines[0].specification = 'Putih 80 gsm';
  return form;
};

const check = (values: QuoteFormValues, option = term(), filesMissing = false) =>
  validateQuoteForm(values, option, { filesMissing });

describe('validateQuoteForm', () => {
  it('accepts a complete quote', () => {
    expect(hasQuoteErrors(check(valid()))).toBe(false);
  });

  it('needs the vendor, the quote number and date, the delivery estimate, the term, a price and the specification', () => {
    const form = emptyQuoteForm(items);
    const errors = check(form, undefined);

    expect(errors.fields).toMatchObject({
      vendorId: 'vendorRequired',
      number: 'numberRequired',
      validUntil: 'validUntilRequired',
      leadDays: 'leadDaysInvalid',
      paymentTermId: 'termRequired',
    });
    expect(errors.lines.i1).toEqual({
      unitPrice: 'priceRequired',
      specification: 'specificationRequired',
    });
  });

  it('does not take a quote number or a specification of only spaces', () => {
    const form = valid();
    form.number = '   ';
    form.lines[0].specification = '  ';
    const errors = check(form);
    expect(errors.fields.number).toBe('numberRequired');
    expect(errors.lines.i1.specification).toBe('specificationRequired');
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
    form.lines[0].specification = 's'.repeat(QUOTE_LIMITS.specification + 1);
    const errors = check(form);

    expect(errors.fields).toMatchObject({ number: 'numberTooLong' });
    expect(errors.lines.i1).toEqual({ specification: 'tooLong' });
  });

  it('refuses a discount in rupiah above the value of the items and a negative amount', () => {
    const form = valid();
    form.discountValue = 5_400_001;
    expect(check(form).fields.discountValue).toBe('discountTooHigh');
    form.discountValue = 5_400_000;
    expect(check(form).fields.discountValue).toBeUndefined();
    form.discountValue = -1;
    form.shippingAmount = -5;
    expect(check(form).fields).toMatchObject({
      discountValue: 'amountNegative',
      shippingAmount: 'amountNegative',
    });
  });

  it('takes a discount in percent from 0 to 100', () => {
    const form = valid();
    form.discountType = 'percentage';
    form.discountValue = 100;
    expect(check(form).fields.discountValue).toBeUndefined();
    form.discountValue = 100.5;
    expect(check(form).fields.discountValue).toBe('discountPercentRange');
    form.discountValue = -2;
    expect(check(form).fields.discountValue).toBe('amountNegative');
  });

  it('takes a warranty as a whole number with a unit, or none at all', () => {
    const form = valid();
    expect(check(form).fields.warrantyValue).toBeUndefined();
    form.warrantyValue = 12;
    expect(check(form).fields.warrantyValue).toBeUndefined();
    form.warrantyValue = 0;
    expect(check(form).fields.warrantyValue).toBe('warrantyInvalid');
    form.warrantyValue = 1.5;
    expect(check(form).fields.warrantyValue).toBe('warrantyInvalid');
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
    form.discountValue = '';
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
      discountType: 'nominal',
      discountValue: 0,
      shippingAmount: 0,
      lines: [{ requestItem: 'i1', unitPrice: 900000, finalPrice: 850000, tax: null }],
      scores: { price: 4 },
    });
    expect(toQuoteInput(valid(), term()).termOverrides).toEqual({ dueDays: 30 });
    expect(toQuoteInput(valid(), term())).not.toHaveProperty('id');
  });

  it('sends the discount with its mode, and the warranty as one text', () => {
    const form = valid();
    form.discountType = 'percentage';
    form.discountValue = 10;
    form.warrantyValue = 12;
    form.warrantyUnit = 'month';
    expect(toQuoteInput(form, term())).toMatchObject({
      discountType: 'percentage',
      discountValue: 10,
      warranty: '12 bulan',
    });
  });

  it('leaves the final price out where only the quoted price counts (bidding)', () => {
    const form = valid();
    form.lines[0].finalPrice = 850000;
    expect(toQuoteInput(form, term()).lines[0].finalPrice).toBe(850000);
    expect(toQuoteInput(form, term(), { allowFinalPrice: false }).lines[0].finalPrice).toBeNull();
  });
});

describe('linesSubtotalMinor', () => {
  it('counts price times quantity in minor units', () => {
    const form = valid();
    form.lines[0].unitPrice = 12.5;
    expect(linesSubtotalMinor(form.lines)).toBe(7500);
  });
});

describe('a new quote starts with sensible values', () => {
  it('is valid for 14 days from today', () => {
    expect(QUOTE_VALID_DAYS).toBe(14);
    expect(emptyQuoteForm(items, '2026-11-23').validUntil).toBe('2026-12-07');
    expect(emptyQuoteForm(items).validUntil).toBe('');
  });

  it('counts days across a month and a year end', () => {
    expect(addDays('2026-11-23', 14)).toBe('2026-12-07');
    expect(addDays('2026-12-25', 14)).toBe('2027-01-08');
    expect(addDays('2028-02-20', 14)).toBe('2028-03-05');
  });

  it('starts the discount in rupiah and the warranty in months', () => {
    expect(emptyQuoteForm(items)).toMatchObject({
      discountType: 'nominal',
      discountValue: 0,
      warrantyValue: '',
      warrantyUnit: 'month',
    });
  });
});

describe('default tax', () => {
  it('is the 11% VAT when the list has it', () => {
    expect(
      defaultTaxId([
        { id: 'a', name: 'PPh 23', rate: 2 },
        { id: 'b', name: 'PPN', rate: 11 },
      ])
    ).toBe('b');
  });

  it('is none when there is no 11% VAT, rather than another tax', () => {
    expect(defaultTaxId([{ id: 'a', name: 'PPN', rate: 12 }])).toBe('');
    expect(defaultTaxId([{ id: 'a', name: 'Pajak lain', rate: 11 }])).toBe('');
    expect(defaultTaxId([])).toBe('');
  });
});

describe('payment terms by kind', () => {
  const line = (kind: 'GOODS' | 'SERVICE') => ({ kind }) as RequestItem;

  it('asks for goods terms or service terms by what the request holds', () => {
    expect(appliesToOf([line('GOODS'), line('GOODS')])).toBe('goods');
    expect(appliesToOf([line('SERVICE')])).toBe('service');
  });

  it('asks for every term when the request mixes both', () => {
    expect(appliesToOf([line('GOODS'), line('SERVICE')])).toBeUndefined();
    expect(appliesToOf([])).toBeUndefined();
  });
});

describe('warranty as a number and a unit', () => {
  it('reads what the form writes', () => {
    expect(parseWarranty('12 bulan')).toEqual({ value: 12, unit: 'month', legacy: '' });
    expect(parseWarranty('2 Tahun')).toEqual({ value: 2, unit: 'year', legacy: '' });
    expect(parseWarranty('30 hari')).toEqual({ value: 30, unit: 'day', legacy: '' });
  });

  it('keeps an old free-text warranty so it is not lost', () => {
    expect(parseWarranty('Garansi pabrik 1 tahun')).toEqual({
      value: '',
      unit: 'month',
      legacy: 'Garansi pabrik 1 tahun',
    });
    expect(parseWarranty('')).toEqual({ value: '', unit: 'month', legacy: '' });
  });

  it('writes one text, or the old text while no number is given', () => {
    const form = emptyQuoteForm(items);
    expect(composeWarranty(form)).toBe('');
    form.warrantyLegacy = 'Garansi pabrik 1 tahun';
    expect(composeWarranty(form)).toBe('Garansi pabrik 1 tahun');
    form.warrantyValue = 6;
    form.warrantyUnit = 'year';
    expect(composeWarranty(form)).toBe('6 tahun');
  });
});

describe('estimateQuote', () => {
  const base = (): QuoteFormValues => {
    const form = valid();
    form.lines[0].quantity = 10;
    form.lines[0].unitPrice = 100_000;
    return form;
  };

  it('adds the items up and takes the discount off before tax', () => {
    const form = base();
    form.lines[0].taxId = 'ppn';
    form.discountType = 'percentage';
    form.discountValue = 10;
    form.shippingAmount = 50_000;
    const estimate = estimateQuote(form, { ppn: 11 });
    expect(estimate).toEqual({
      subtotal: 100_000_000,
      discount: 10_000_000,
      tax: 9_900_000,
      shipping: 5_000_000,
      total: 104_900_000,
    });
  });

  it('takes a discount in rupiah as it is', () => {
    const form = base();
    form.discountValue = 250_000;
    expect(estimateQuote(form, {})).toMatchObject({ discount: 25_000_000, total: 75_000_000 });
  });

  it('does not add tax again when the prices already include it', () => {
    const form = base();
    form.lines[0].taxId = 'ppn';
    form.isPriceIncludeTax = true;
    const estimate = estimateQuote(form, { ppn: 11 });
    expect(estimate.total).toBe(100_000_000);
    expect(estimate.tax).toBe(9_909_910);
  });

  it('is zero for a form with no price yet', () => {
    expect(estimateQuote(emptyQuoteForm(items), {})).toEqual({
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    });
  });
});
