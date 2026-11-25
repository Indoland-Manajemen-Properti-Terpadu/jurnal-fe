import { toPurchaseRequest } from './requestMappers';
import type { PurchaseRequestDto } from './requestDto';
import { requestDtoFixture as dto } from './requestDtoFixture';

describe('toPurchaseRequest, the payment schedule of a quote', () => {
  /** What the service answered for a quote with four terms and a retention (Aldi's note, PRO-120). */
  const withSchedule = (termSchedule: unknown) =>
    toPurchaseRequest({
      ...(dto as unknown as PurchaseRequestDto),
      procurementView: {
        ...((dto as unknown as PurchaseRequestDto).procurementView ?? {}),
        quotes: [{ id: 'q1', total: 100000000, termSchedule }],
      },
    } as PurchaseRequestDto);

  it('reads the rows the service planned, and their total', () => {
    const { procurement } = withSchedule({
      rows: [
        {
          kind: 'TERM',
          seq: 1,
          of: 4,
          label: 'Termin 1 dari 4 · 9.5%',
          percent: 9.5,
          amount: 9500000,
        },
        { kind: 'RETENTION', seq: 5, of: 5, label: 'Retensi 5%', percent: 5, amount: 5000000 },
      ],
      percent: 100,
      amount: 100000000,
    });

    expect(procurement.totals.q1.schedule).toEqual({
      rows: [
        {
          kind: 'TERM',
          seq: 1,
          of: 4,
          label: 'Termin 1 dari 4 · 9.5%',
          percent: 9.5,
          amount: 9500000,
          retentionAmount: 0,
          withheld: false,
        },
        {
          kind: 'RETENTION',
          seq: 5,
          of: 5,
          label: 'Retensi 5%',
          percent: 5,
          amount: 5000000,
          retentionAmount: 0,
          withheld: false,
        },
      ],
      percent: 100,
      amount: 100000000,
      advanceAmount: 0,
      advancePercent: 0,
      afterAdvanceAmount: 0,
      afterAdvancePercent: 0,
      retentionAmount: 0,
    });
  });

  it('has no schedule while the quote has no term (the service sends null)', () => {
    expect(withSchedule(null).procurement.totals.q1.schedule).toBeNull();
  });

  it('reads the advance, what the terms share after it, and the retention held on each term', () => {
    const { procurement } = withSchedule({
      rows: [
        { kind: 'ADVANCE', seq: 0, of: 3, label: 'Uang muka 20%', percent: 20, amount: 200 },
        {
          kind: 'TERM',
          seq: 1,
          of: 3,
          label: 'Termin 1 dari 3 · 32%',
          percent: 32,
          amount: 320,
          retentionAmount: 20,
        },
        {
          kind: 'RETENTION',
          seq: 5,
          of: 5,
          label: 'Retensi 5%',
          percent: 5,
          amount: 50,
          withheld: true,
        },
      ],
      percent: 100,
      amount: 1000,
      retentionAmount: 50,
      advanceAmount: 200,
      advancePercent: 20,
      afterAdvanceAmount: 800,
      afterAdvancePercent: 80,
    });

    const { schedule } = procurement.totals.q1;
    expect(schedule).toMatchObject({
      advanceAmount: 200,
      advancePercent: 20,
      afterAdvanceAmount: 800,
      afterAdvancePercent: 80,
      retentionAmount: 50,
    });
    expect(schedule?.rows[1]).toMatchObject({ retentionAmount: 20, withheld: false });
    expect(schedule?.rows[2]).toMatchObject({ withheld: true });
  });

  it('has no advance and no retention for a schedule that does not name them', () => {
    const { procurement } = withSchedule({
      rows: [{ kind: 'TERM', seq: 1, of: 1, label: 'Termin 1 dari 1', percent: 100, amount: 100 }],
      percent: 100,
      amount: 100,
    });

    expect(procurement.totals.q1.schedule).toMatchObject({
      advanceAmount: 0,
      advancePercent: 0,
      afterAdvanceAmount: 0,
      afterAdvancePercent: 0,
      retentionAmount: 0,
    });
  });
});
