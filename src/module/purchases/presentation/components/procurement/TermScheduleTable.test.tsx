import { render, screen } from '@test-utils';
import { describe, expect, it } from 'vitest';
import type { TermSchedule } from '@/module/purchases/domain/procurement';
import { hasSplitSchedule, TermScheduleTable } from './TermScheduleTable';

const split: TermSchedule = {
  rows: [
    { kind: 'TERM', seq: 1, of: 2, label: 'Termin 1 dari 2 · 47.5%', percent: 47.5, amount: 475 },
    { kind: 'TERM', seq: 2, of: 2, label: 'Termin 2 dari 2 · 47.5%', percent: 47.5, amount: 475 },
    { kind: 'RETENTION', seq: 3, of: 3, label: 'Retensi 5%', percent: 5, amount: 50 },
  ],
  percent: 100,
  amount: 1000,
};

const once: TermSchedule = {
  rows: [{ kind: 'FULL', seq: 1, of: 1, label: 'Sekali bayar', percent: 100, amount: 1000 }],
  percent: 100,
  amount: 1000,
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
});
