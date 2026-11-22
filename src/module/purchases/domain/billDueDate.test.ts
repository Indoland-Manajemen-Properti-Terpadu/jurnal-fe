import { dueDateFor, type BillSourceDoc } from './billSources';

const doc = (overrides: Partial<BillSourceDoc>): BillSourceDoc =>
  ({
    dueDate: null,
    term: {
      name: 'Net 30',
      description: '',
      dueDays: 30,
      dueBasis: 'VENDOR_INVOICE',
      hasDueTerm: true,
      dueText: '',
    },
    ...overrides,
  }) as BillSourceDoc;

describe('dueDateFor', () => {
  it('uses the date the service worked out from the receipt', () => {
    expect(dueDateFor(doc({ dueDate: '2026-12-01' }), '2026-11-22')).toBe('2026-12-01');
  });

  it('adds the term days to the vendor invoice date when the service sends none', () => {
    expect(dueDateFor(doc({}), '2026-11-22')).toBe('2026-12-22');
  });

  it('crosses a year end', () => {
    expect(dueDateFor(doc({}), '2026-12-15')).toBe('2027-01-14');
  });

  it('gives nothing without a term, without days, or without an invoice date', () => {
    const term = {
      name: 'CAD',
      description: '',
      dueDays: null,
      dueBasis: '',
      hasDueTerm: false,
      dueText: '',
    };
    expect(dueDateFor(doc({ term }), '2026-11-22')).toBe('');
    expect(dueDateFor(doc({}), '')).toBe('');
  });
});
