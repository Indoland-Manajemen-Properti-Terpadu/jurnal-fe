import {
  DEFAULT_PAYMENT_TERM_FORM,
  toPaymentTermFormValues,
  toPaymentTermPayload,
  validatePaymentTermForm,
  visiblePaymentTermFields,
  type PaymentTerm,
  type PaymentTermFormValues,
} from './paymentTerm';

const form = (patch: Partial<PaymentTermFormValues> = {}): PaymentTermFormValues => ({
  ...DEFAULT_PAYMENT_TERM_FORM,
  name: 'Net 30',
  ...patch,
});

const term = (patch: Partial<PaymentTerm> = {}): PaymentTerm => ({
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
  isDefault: false,
  summary: { paymentLabel: 'Tanpa uang muka', billingLabel: 'Sekali tagih', dueLabel: '30 hari' },
  usageCount: 0,
  usageBreakdown: { purchase: 0, sale: 0 },
  canDelete: true,
  ...patch,
});

describe('visiblePaymentTermFields', () => {
  it('shows only the due date fields for the default term', () => {
    expect(visiblePaymentTermFields(form())).toEqual({
      advancePercent: false,
      installments: false,
      advanceOutsideInstallments: false,
      retention: false,
      retentionDetails: false,
      period: false,
      due: true,
    });
  });

  it('shows the advance percent only for a partial advance', () => {
    expect(visiblePaymentTermFields(form({ advanceType: 'partial' })).advancePercent).toBe(true);
    expect(visiblePaymentTermFields(form({ advanceType: 'full' })).advancePercent).toBe(false);
  });

  it('shows installments, the outside-installments switch and retention for milestones', () => {
    const milestone = visiblePaymentTermFields(form({ billingSplit: 'milestone' }));
    expect(milestone.installments).toBe(true);
    expect(milestone.retention).toBe(true);
    expect(milestone.advanceOutsideInstallments).toBe(false);
    expect(
      visiblePaymentTermFields(form({ billingSplit: 'milestone', advanceType: 'partial' }))
        .advanceOutsideInstallments
    ).toBe(true);
  });

  it('shows retention details only while retention is on', () => {
    expect(
      visiblePaymentTermFields(form({ billingSplit: 'milestone', hasRetention: false }))
        .retentionDetails
    ).toBe(false);
    expect(
      visiblePaymentTermFields(form({ billingSplit: 'milestone', hasRetention: true }))
        .retentionDetails
    ).toBe(true);
  });

  it('shows the period fields for recurring billing', () => {
    expect(visiblePaymentTermFields(form({ billingSplit: 'recurring' })).period).toBe(true);
  });

  it('hides the due date fields when the invoice has no due date', () => {
    expect(visiblePaymentTermFields(form({ hasDueTerm: false })).due).toBe(false);
  });
});

describe('validatePaymentTermForm', () => {
  it('accepts the default term once it has a name', () => {
    expect(validatePaymentTermForm(form())).toEqual({});
  });

  it('requires a name', () => {
    expect(validatePaymentTermForm(form({ name: '  ' }))).toEqual({
      name: 'validation.paymentTermNameRequired',
    });
  });

  it.each([[''], [0], [100], [150]] as const)(
    'rejects a partial advance of %s',
    (advancePercent) => {
      expect(
        validatePaymentTermForm(form({ advanceType: 'partial', advancePercent })).advancePercent
      ).toBe('validation.advancePercentRange');
    }
  );

  it.each([[1], [30], [99]] as const)('accepts a partial advance of %s', (advancePercent) => {
    expect(
      validatePaymentTermForm(form({ advanceType: 'partial', advancePercent })).advancePercent
    ).toBeUndefined();
  });

  it('ignores a stale advance percent when the advance is not partial', () => {
    expect(validatePaymentTermForm(form({ advanceType: 'full', advancePercent: 500 }))).toEqual({});
  });

  it.each([[''], [0], [1]] as const)('rejects %s milestone installments', (installments) => {
    expect(
      validatePaymentTermForm(form({ billingSplit: 'milestone', installments })).installments
    ).toBe('validation.installmentsMin');
  });

  it('accepts two milestone installments', () => {
    expect(
      validatePaymentTermForm(form({ billingSplit: 'milestone', installments: 2 })).installments
    ).toBeUndefined();
  });

  it.each([[''], [1]] as const)('rejects %s recurring periods', (periods) => {
    expect(validatePaymentTermForm(form({ billingSplit: 'recurring', periods })).periods).toBe(
      'validation.periodsMin'
    );
  });

  it('accepts two recurring periods', () => {
    expect(
      validatePaymentTermForm(form({ billingSplit: 'recurring', periods: 2 })).periods
    ).toBeUndefined();
  });

  it('requires due days of at least 0 while the invoice has a due date', () => {
    expect(validatePaymentTermForm(form({ dueDays: '' })).dueDays).toBe(
      'validation.paymentTermDaysMin'
    );
    expect(validatePaymentTermForm(form({ dueDays: -1 })).dueDays).toBe(
      'validation.paymentTermDaysMin'
    );
    expect(validatePaymentTermForm(form({ dueDays: 0 })).dueDays).toBeUndefined();
  });

  it('does not ask for due days when the invoice has no due date', () => {
    expect(validatePaymentTermForm(form({ hasDueTerm: false, dueDays: '' }))).toEqual({});
  });

  it('requires the retention percent and maintenance months when retention is on', () => {
    const errors = validatePaymentTermForm(
      form({ billingSplit: 'milestone', installments: 3, hasRetention: true })
    );
    expect(errors.retentionPercent).toBe('validation.retentionPercentRequired');
    expect(errors.maintenanceMonths).toBe('validation.maintenanceMonthsMin');
  });

  it('ignores retention values once billing is no longer milestone', () => {
    expect(validatePaymentTermForm(form({ billingSplit: 'single', hasRetention: true }))).toEqual(
      {}
    );
  });
});

describe('toPaymentTermPayload', () => {
  it('sends only the fields of a plain term', () => {
    expect(toPaymentTermPayload(form({ dueDays: 30 }))).toEqual({
      name: 'Net 30',
      appliesTo: 'both',
      advanceType: 'none',
      billingSplit: 'single',
      hasDueTerm: true,
      defaultDueDays: 30,
      dueBasis: 'vendor_invoice_date',
      hasRetention: false,
    });
  });

  it('trims the name and sends the optional texts only when filled', () => {
    const payload = toPaymentTermPayload(
      form({ name: '  Net 30  ', description: ' Untuk vendor tetap ', usageExample: '' })
    );
    expect(payload.name).toBe('Net 30');
    expect(payload.description).toBe('Untuk vendor tetap');
    expect(payload).not.toHaveProperty('usageExample');
  });

  it('sends the advance percent for a partial advance and leaves it out for the other types', () => {
    expect(
      toPaymentTermPayload(form({ advanceType: 'partial', advancePercent: 30 }))
        .defaultAdvancePercent
    ).toBe(30);
    expect(
      toPaymentTermPayload(form({ advanceType: 'full', advancePercent: 30 }))
    ).not.toHaveProperty('defaultAdvancePercent');
    expect(
      toPaymentTermPayload(form({ advanceType: 'none', advancePercent: 30 }))
    ).not.toHaveProperty('defaultAdvancePercent');
  });

  it('sends a milestone term with installments, outside-installments and retention', () => {
    expect(
      toPaymentTermPayload(
        form({
          advanceType: 'partial',
          advancePercent: 30,
          billingSplit: 'milestone',
          installments: 3,
          advanceOutsideInstallments: true,
          hasRetention: true,
          retentionPercent: 5,
          maintenanceMonths: 6,
        })
      )
    ).toMatchObject({
      defaultAdvancePercent: 30,
      billingSplit: 'milestone',
      defaultInstallments: 3,
      advanceOutsideInstallments: true,
      hasRetention: true,
      defaultRetentionPercent: 5,
      defaultMaintenanceMonths: 6,
    });
  });

  it('leaves out the milestone fields once billing is single, even if they were filled before', () => {
    const payload = toPaymentTermPayload(
      form({
        billingSplit: 'single',
        installments: 3,
        advanceOutsideInstallments: true,
        hasRetention: true,
        retentionPercent: 5,
        maintenanceMonths: 6,
      })
    );
    expect(payload.hasRetention).toBe(false);
    for (const key of [
      'defaultInstallments',
      'advanceOutsideInstallments',
      'defaultRetentionPercent',
      'defaultMaintenanceMonths',
    ]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it('always sends the advance as outside the terms, whatever the form says: the service bills it apart', () => {
    expect(
      toPaymentTermPayload(
        form({
          advanceType: 'partial',
          advancePercent: 20,
          billingSplit: 'milestone',
          installments: 3,
          advanceOutsideInstallments: false,
        })
      )
    ).toMatchObject({ advanceOutsideInstallments: true });
  });

  it('sends the outside-installments switch only for a partial advance with milestones', () => {
    expect(
      toPaymentTermPayload(
        form({ billingSplit: 'milestone', installments: 2, advanceOutsideInstallments: true })
      )
    ).not.toHaveProperty('advanceOutsideInstallments');
  });

  it('sends the unit and the periods for recurring billing only', () => {
    expect(
      toPaymentTermPayload(form({ billingSplit: 'recurring', periodUnit: 'quarterly', periods: 4 }))
    ).toMatchObject({ billingSplit: 'recurring', periodUnit: 'quarterly', defaultPeriods: 4 });
    const single = toPaymentTermPayload(form({ periodUnit: 'quarterly', periods: 4 }));
    expect(single).not.toHaveProperty('periodUnit');
    expect(single).not.toHaveProperty('defaultPeriods');
  });

  it('leaves the due days and basis out when the invoice has no due date', () => {
    const payload = toPaymentTermPayload(form({ hasDueTerm: false, dueDays: 30 }));
    expect(payload.hasDueTerm).toBe(false);
    expect(payload).not.toHaveProperty('defaultDueDays');
    expect(payload).not.toHaveProperty('dueBasis');
  });
});

describe('toPaymentTermFormValues', () => {
  it('turns a plain term into form values with empty numbers', () => {
    expect(toPaymentTermFormValues(term())).toEqual({
      ...DEFAULT_PAYMENT_TERM_FORM,
      name: 'Net 30',
      dueDays: 30,
    });
  });

  it('reads a milestone term with partial advance and retention', () => {
    expect(
      toPaymentTermFormValues(
        term({
          appliesTo: 'service',
          description: 'Proyek',
          advanceType: 'partial',
          defaultAdvancePercent: 30,
          billingSplit: 'milestone',
          defaultInstallments: 3,
          advanceOutsideInstallments: true,
          dueBasis: 'receipt_date',
          defaultDueDays: 14,
          hasRetention: true,
          defaultRetentionPercent: 5,
          defaultMaintenanceMonths: 6,
        })
      )
    ).toMatchObject({
      appliesTo: 'service',
      description: 'Proyek',
      advanceType: 'partial',
      advancePercent: 30,
      billingSplit: 'milestone',
      installments: 3,
      advanceOutsideInstallments: true,
      dueBasis: 'receipt_date',
      dueDays: 14,
      hasRetention: true,
      retentionPercent: 5,
      maintenanceMonths: 6,
    });
  });

  it('falls back to monthly when a recurring unit is missing and keeps the periods', () => {
    expect(
      toPaymentTermFormValues(term({ billingSplit: 'recurring', defaultPeriods: 12 }))
    ).toMatchObject({ periodUnit: 'monthly', periods: 12 });
  });

  it('round-trips a term through the form into the same payload fields', () => {
    const milestone = term({
      advanceType: 'partial',
      defaultAdvancePercent: 30,
      billingSplit: 'milestone',
      defaultInstallments: 3,
      advanceOutsideInstallments: true,
      hasRetention: true,
      defaultRetentionPercent: 5,
      defaultMaintenanceMonths: 6,
    });
    expect(toPaymentTermPayload(toPaymentTermFormValues(milestone))).toMatchObject({
      name: 'Net 30',
      defaultAdvancePercent: 30,
      defaultInstallments: 3,
      advanceOutsideInstallments: true,
      defaultRetentionPercent: 5,
      defaultMaintenanceMonths: 6,
      defaultDueDays: 30,
    });
  });
});
