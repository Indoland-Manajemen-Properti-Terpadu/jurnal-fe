import {
  countJourney,
  reimbursementJourney,
  voucherJourney,
} from '@/module/petty-cash/domain/documentJourney';
import type {
  CountRecord,
  PettyCashVoucherRecord,
  ReimbursementRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';

const user = (name: string) => ({ id: name, name, email: `${name}@x.id` });

describe('voucherJourney', () => {
  const voucher = {
    createdAt: '2026-11-03T10:00:00.000Z',
    submittedAt: '2026-11-03T10:05:00.000Z',
    approvedAt: null,
    rejectedAt: '2026-11-03T11:00:00.000Z',
    voidedAt: null,
    requestedBy: user('Staf'),
    approvedBy: null,
    rejectedReason: 'Nota buram',
    voidReason: null,
  } as unknown as PettyCashVoucherRecord;

  it('orders what happened by time and marks the last step', () => {
    const steps = voucherJourney(voucher);
    expect(steps.map((step) => step.title)).toEqual([
      { kind: 'event', event: 'CREATED' },
      { kind: 'event', event: 'SUBMITTED' },
      { kind: 'event', event: 'REJECTED' },
    ]);
    expect(steps.map((step) => step.state)).toEqual(['done', 'done', 'latest']);
    expect(steps[2]).toMatchObject({ refused: true, note: 'Nota buram' });
  });
});

describe('countJourney', () => {
  const count = {
    status: 'SUBMITTED',
    countedAt: '2026-11-03T10:00:00.000Z',
    submittedAt: '2026-11-03T10:01:00.000Z',
    approvedAt: null,
    rejectedAt: null,
    countedBy: user('Finance'),
    approvedBy: null,
    rejectedBy: null,
    rejectedReason: null,
    pendingApprovers: [
      { level: 'BM', label: 'Building Manager' },
      { level: 'CF', label: 'Chief Finance' },
    ],
  } as unknown as CountRecord;

  it('appends the stage being waited for and the ones after it', () => {
    const steps = countJourney(count);
    expect(steps.map((step) => step.state)).toEqual(['done', 'done', 'waiting', 'upcoming']);
    expect(steps[2].title).toEqual({
      kind: 'approval',
      approver: { level: 'BM', label: 'Building Manager' },
    });
  });

  it('shows no stages once the count is no longer waiting', () => {
    const steps = countJourney({ ...count, status: 'APPROVED' } as CountRecord);
    expect(steps.at(-1)?.state).toBe('latest');
    expect(steps.some((step) => step.title.kind === 'approval')).toBe(false);
  });
});

describe('reimbursementJourney', () => {
  it('carries the notes on the submission and ends on the payout', () => {
    const record = {
      status: 'DISBURSED',
      submittedAt: '2026-11-01T08:00:00.000Z',
      approvedAt: '2026-11-01T09:00:00.000Z',
      rejectedAt: null,
      cancelledAt: null,
      disbursedAt: '2026-11-02T09:00:00.000Z',
      submittedBy: user('Custodian'),
      approvedBy: user('CF'),
      rejectedBy: null,
      cancelledBy: null,
      disbursedBy: user('Finance'),
      notes: 'Mingguan',
      rejectedReason: null,
      pendingApprovers: [],
    } as unknown as ReimbursementRecord;
    const steps = reimbursementJourney(record);
    expect(steps[0]).toMatchObject({ note: 'Mingguan', byName: 'Custodian' });
    expect(steps.at(-1)).toMatchObject({
      title: { kind: 'event', event: 'DISBURSED' },
      state: 'latest',
    });
  });
});

describe('voucherJourney of a voucher made from an advance', () => {
  it('leaves out a creation that happened after the submission', () => {
    const voucher = {
      createdAt: '2026-11-03T17:46:00.000Z',
      submittedAt: '2026-11-03T17:42:00.000Z',
      approvedAt: '2026-11-03T17:46:00.000Z',
      rejectedAt: null,
      voidedAt: null,
      requestedBy: user('Staf'),
      approvedBy: user('Finance'),
      rejectedReason: null,
      voidReason: null,
    } as unknown as PettyCashVoucherRecord;
    expect(voucherJourney(voucher).map((step) => step.title)).toEqual([
      { kind: 'event', event: 'SUBMITTED' },
      { kind: 'event', event: 'APPROVED' },
    ]);
  });
});
