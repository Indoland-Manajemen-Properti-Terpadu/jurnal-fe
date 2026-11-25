import { render, screen } from '@test-utils';
import { describe, expect, it } from 'vitest';
import type { TermSchedule } from '@/module/purchases/domain/procurement';
import { hasSplitSchedule, TermScheduleTable } from './TermScheduleTable';

const row = (
  kind: TermSchedule['rows'][number]['kind'],
  seq: number,
  label: string,
  percent: number,
  amount: number,
  extra: Partial<TermSchedule['rows'][number]> = {}
): TermSchedule['rows'][number] => ({
  kind,
  seq,
  of: 3,
  label,
  percent,
  amount,
  retentionAmount: 0,
  withheld: false,
  ...extra,
});

const none = { advanceAmount: 0, advancePercent: 0, afterAdvanceAmount: 0, afterAdvancePercent: 0 };

const split: TermSchedule = {
  rows: [
    row('TERM', 1, 'Termin 1 dari 2 · 47.5%', 47.5, 475),
    row('TERM', 2, 'Termin 2 dari 2 · 47.5%', 47.5, 475),
    row('RETENTION', 3, 'Retensi 5%', 5, 50),
  ],
  percent: 100,
  amount: 1000,
  retentionAmount: 0,
  ...none,
};

const once: TermSchedule = {
  rows: [row('FULL', 1, 'Sekali bayar', 100, 1000)],
  percent: 100,
  amount: 1000,
  retentionAmount: 0,
  ...none,
};

/** Quote of Rp 1.000: advance 20%, three terms sharing the rest, 5% retention held on each term. */
const withAdvance: TermSchedule = {
  rows: [
    row('ADVANCE', 0, 'Uang muka 20%', 20, 200),
    row('TERM', 1, 'Termin 1 dari 3 · 32%', 32, 320, { retentionAmount: 20 }),
    row('TERM', 2, 'Termin 2 dari 3 · 24%', 24, 240, { retentionAmount: 15 }),
    row('TERM', 3, 'Termin 3 dari 3 · 24%', 24, 240, { retentionAmount: 15 }),
    row('RETENTION', 5, 'Retensi 5% (ditahan di tiap termin)', 5, 50, { withheld: true }),
  ],
  percent: 100,
  amount: 1000,
  retentionAmount: 50,
  advanceAmount: 200,
  advancePercent: 20,
  afterAdvanceAmount: 800,
  afterAdvancePercent: 80,
};

describe('hasSplitSchedule', () => {
  it('is true for a schedule with more than a single payment', () => {
    expect(hasSplitSchedule(split)).toBe(true);
  });

  it('is false for a pay-at-once schedule or no schedule', () => {
    expect(hasSplitSchedule(once)).toBe(false);
    expect(hasSplitSchedule(null)).toBe(false);
  });
});

describe('TermScheduleTable', () => {
  it('shows every row with the service sentence and a total of 100%', () => {
    render(<TermScheduleTable schedule={split} />);

    expect(screen.getByText('Termin 1 dari 2 · 47.5%')).toBeInTheDocument();
    expect(screen.getByText('Retensi 5%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('draws nothing for a payment made at once', () => {
    render(<TermScheduleTable schedule={once} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Sekali bayar')).not.toBeInTheDocument();
  });

  it('puts the advance first, then the terms, then a total for the advance and one for the rest', () => {
    render(<TermScheduleTable schedule={withAdvance} />);

    const labels = screen.getAllByRole('row').map((tr) => tr.textContent ?? '');
    expect(labels[1]).toContain('Uang muka 20%');
    expect(labels[2]).toContain('Termin 1 dari 3');
    expect(screen.getByText('DP')).toBeInTheDocument();
    expect(screen.getByText('Termin setelah DP')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('shows the retention that is held on a term, in rupiah, under that term', () => {
    render(<TermScheduleTable schedule={withAdvance} />);

    expect(screen.getByText(/Retensi ditahan Rp\s20\b/)).toBeInTheDocument();
  });

  it('does not add the retention row into the total: it is only held from the terms', () => {
    render(<TermScheduleTable schedule={withAdvance} />);

    expect(screen.getByText(/ditahan dari tiap termin dan tidak dijumlahkan/i)).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('has no advance totals for a schedule without an advance', () => {
    render(<TermScheduleTable schedule={split} />);

    expect(screen.queryByText('Termin setelah DP')).not.toBeInTheDocument();
  });
});
