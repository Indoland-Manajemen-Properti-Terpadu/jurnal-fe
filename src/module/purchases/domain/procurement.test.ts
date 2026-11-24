import {
  latestRejection,
  procurementEditable,
  procurementSteps,
  procurementToInput,
  quoteToInput,
  quotesNeeded,
  termOverridesOf,
  type Procurement,
  type Quote,
  type TermSnapshot,
} from '@/module/purchases/domain/procurement';

const term = (overrides: Partial<TermSnapshot> = {}): TermSnapshot => ({
  paymentTermId: 't1',
  name: 'Net 30',
  advanceType: 'none',
  billingSplit: 'single',
  hasDueTerm: true,
  hasRetention: false,
  advancePercent: 0,
  installments: null,
  installmentPercents: [],
  dueDays: 30,
  periods: null,
  periodUnit: null,
  retentionPercent: 0,
  maintenanceMonths: 0,
  ...overrides,
});

const quote = (overrides: Partial<Quote> = {}): Quote => ({
  id: 'q1',
  vendor: { id: 'v1', name: 'PT Alfa', paymentTermDays: null, npwp: null },
  number: 'QT-1',
  validUntil: '2026-12-31',
  description: '',
  attachments: [],
  paymentTermId: 't1',
  term: term(),
  leadDays: 7,
  warranty: '12 bulan',
  withReceipt: true,
  isPriceIncludeTax: false,
  discountType: 'nominal',
  discountValue: 0,
  discountAmount: 0,
  shippingAmount: 0,
  lines: [
    {
      requestItemId: 'i1',
      unitPrice: 900000,
      finalPrice: null,
      specification: 'x',
      taxId: 'tax1',
      taxName: 'PPN',
    },
  ],
  scores: { price: 5, spec: null, delivery: 4, term: null },
  ...overrides,
});

const procurement = (overrides: Partial<Procurement> = {}): Procurement => ({
  route: 'BIDDING',
  rejectedWinners: [],
  status: 'DRAFT',
  singleReason: '',
  belowMinQuotesReason: '',
  winnerId: 'v1',
  reason: '',
  negotiationNote: '',
  negotiationAttachments: [],
  quotes: [quote()],
  totals: {},
  cheapestVendorId: 'v1',
  estimatedValue: 0,
  minQuotes: 2,
  biddingNumber: '',
  submitErrors: [],
  scoreCriteria: [],
  approvalPreview: [],
  approval: {
    plan: [],
    entries: [],
    pending: [],
    canDecide: false,
    rejectionReason: null,
    rejectedAt: null,
  },
  ...overrides,
});

describe('termOverridesOf', () => {
  it('sends nothing for a plain term, so no advance of 0 is refused by the service', () => {
    expect(termOverridesOf(term({ hasDueTerm: false }))).toEqual({});
    expect(termOverridesOf(term())).toEqual({ dueDays: 30 });
  });

  it('sends the figures of the mechanism the term has', () => {
    expect(
      termOverridesOf(
        term({
          advanceType: 'partial',
          advancePercent: 20,
          billingSplit: 'milestone',
          installments: 3,
          installmentPercents: [40, 30, 30],
          hasRetention: true,
          retentionPercent: 5,
          maintenanceMonths: 6,
        })
      )
    ).toEqual({
      advancePercent: 20,
      installments: 3,
      installmentPercents: [40, 30, 30],
      dueDays: 30,
      retentionPercent: 5,
      maintenanceMonths: 6,
    });
  });

  it('sends the periods of a recurring term and nothing without a term', () => {
    expect(
      termOverridesOf(term({ billingSplit: 'recurring', periods: 12, hasDueTerm: false }))
    ).toEqual({ periods: 12 });
    expect(termOverridesOf(null)).toEqual({});
  });
});

describe('quoteToInput', () => {
  it('keeps the quote id so its files survive a save, and every line field', () => {
    const input = quoteToInput(quote());

    expect(input).toMatchObject({
      id: 'q1',
      vendor: 'v1',
      quotationNumber: 'QT-1',
      validUntil: '2026-12-31',
      paymentTerm: 't1',
      leadDays: 7,
      warranty: '12 bulan',
      withReceipt: true,
      lines: [
        { requestItem: 'i1', unitPrice: 900000, finalPrice: null, specification: 'x', tax: 'tax1' },
      ],
      scores: { price: 5, delivery: 4 },
    });
  });

  it('leaves out the scores nobody gave', () => {
    const input = quoteToInput(
      quote({ scores: { price: null, spec: null, delivery: null, term: null } })
    );
    expect(input.scores).toBeUndefined();
  });

  it('sends no tax for a line without one', () => {
    const line = quote().lines[0];
    expect(quoteToInput(quote({ lines: [{ ...line, taxId: '' }] })).lines[0].tax).toBeNull();
  });
});

describe('procurementToInput', () => {
  it('rebuilds the whole body, with the winner only when there is one', () => {
    expect(procurementToInput(procurement())).toMatchObject({
      route: 'BIDDING',
      winner: 'v1',
      quotes: [{ id: 'q1' }],
    });
    expect(procurementToInput(procurement({ winnerId: null }))).not.toHaveProperty('winner');
  });

  it('can switch the route while keeping the rest', () => {
    expect(procurementToInput(procurement(), 'SINGLE').route).toBe('SINGLE');
  });
});

describe('quotesNeeded and steps', () => {
  const complete = { complete: true } as Procurement['totals'][string];

  it('needs one quote for a single vendor and the service minimum for bidding', () => {
    expect(quotesNeeded(procurement({ route: 'SINGLE' }))).toBe(1);
    expect(quotesNeeded(procurement({ minQuotes: 3 }))).toBe(3);
  });

  it('marks the steps as quotes, winner, notes and approval come in', () => {
    const open = procurement({ totals: { q1: complete } });
    // A winner left over from an earlier route does not count while the quotes are too few.
    expect(procurementSteps(open).map((step) => step.done)).toEqual([false, false, false, false]);

    const ready = procurement({
      totals: { q1: complete, q2: complete },
      quotes: [quote(), quote({ id: 'q2' })],
    });
    expect(procurementSteps(ready).map((step) => step.done)).toEqual([true, true, true, false]);

    const approved = procurement({ status: 'APPROVED', totals: { q1: complete, q2: complete } });
    expect(procurementSteps(approved)[3].done).toBe(true);
  });

  it('does not call the notes done while the service still lists what blocks submitting', () => {
    const blocked = procurement({
      totals: { q1: complete, q2: complete },
      submitErrors: ['Pemenang bukan penawaran termurah: alasan pemilihan wajib diisi'],
    });
    expect(procurementSteps(blocked)[2].done).toBe(false);
  });
});

describe('procurementEditable', () => {
  it('is open for a draft or a rejection and closed once submitted or approved', () => {
    expect(procurementEditable(procurement({ status: 'DRAFT' }))).toBe(true);
    expect(procurementEditable(procurement({ status: 'REJECTED' }))).toBe(true);
    expect(procurementEditable(procurement({ status: 'SUBMITTED' }))).toBe(false);
    expect(procurementEditable(procurement({ status: 'APPROVED' }))).toBe(false);
  });
});

describe('latestRejection', () => {
  const rejected = [
    { vendorId: 'v1', reason: 'Baru', rejectedAt: '2026-11-24', rejectedByName: 'A', amount: 1 },
    { vendorId: 'v1', reason: 'Lama', rejectedAt: '2026-11-20', rejectedByName: 'B', amount: 1 },
    { vendorId: 'v2', reason: 'Lain', rejectedAt: '2026-11-22', rejectedByName: 'C', amount: 2 },
  ];

  it('gives the first entry of the vendor, which is the newest', () => {
    expect(latestRejection({ rejectedWinners: rejected }, 'v1')?.reason).toBe('Baru');
  });

  it('gives null for a vendor never turned down', () => {
    expect(latestRejection({ rejectedWinners: rejected }, 'v9')).toBeNull();
  });
});
