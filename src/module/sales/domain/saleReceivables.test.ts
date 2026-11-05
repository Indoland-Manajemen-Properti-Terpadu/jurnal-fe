import { describe, expect, it } from 'vitest';
import type { ReceivablesSummary } from './sale';
import { buildReceivablesView, paidPercent, shareLabel } from './saleReceivables';

// Local noon on 5 Nov 2026; due dates arrive as UTC midnight of the calendar day.
const now = new Date(2026, 10, 5, 12, 0).getTime();

const summary = (patch: Partial<ReceivablesSummary> = {}): ReceivablesSummary => ({
  overdue: { amount: 300, count: 3, oldestDueDate: '2026-09-21T00:00:00.000Z' },
  notDue: { amount: 100, count: 1 },
  total: { amount: 400, count: 4 },
  billed: 500,
  received: 100,
  ...patch,
});

const part = (view: ReturnType<typeof buildReceivablesView>, key: string) =>
  view.parts.find((item) => item.key === key);

describe('buildReceivablesView', () => {
  it('splits what was billed into received, not yet due and overdue, each once', () => {
    const view = buildReceivablesView(summary(), now);

    expect(view.parts.map((item) => [item.key, item.amount, item.count])).toEqual([
      ['received', 100, null],
      ['notDue', 100, 1],
      ['overdue', 300, 3],
    ]);
    expect(view.billedAmount).toBe(500);
    expect(view.outstandingAmount).toBe(400);
    expect(view.outstandingCount).toBe(4);
  });

  it('gives every part its share of the whole, and the shares add up', () => {
    const view = buildReceivablesView(summary(), now);

    expect(view.parts.map((item) => item.shareLabel)).toEqual(['20', '20', '60']);
  });

  it('shows a sliver as "<1" and never rounds a part up to 100', () => {
    const view = buildReceivablesView(
      summary({
        overdue: { amount: 7_346_699_078, count: 3236, oldestDueDate: '2026-07-10T00:00:00.000Z' },
        notDue: { amount: 13_178_378, count: 7 },
        total: { amount: 7_359_877_456, count: 3243 },
        billed: 7_366_387_456,
        received: 6_510_000,
      }),
      now
    );

    expect(part(view, 'received')?.shareLabel).toBe('<1');
    expect(part(view, 'notDue')?.shareLabel).toBe('<1');
    expect(part(view, 'overdue')?.shareLabel).toBe('99');
  });

  it('is empty when nothing was billed and nothing is owed', () => {
    const view = buildReceivablesView(
      summary({
        overdue: { amount: 0, count: 0, oldestDueDate: null },
        notDue: { amount: 0, count: 0 },
        total: { amount: 0, count: 0 },
        billed: 0,
        received: 0,
      }),
      now
    );

    expect(view.isEmpty).toBe(true);
    expect(view.parts.every((item) => item.shareLabel === null)).toBe(true);
    expect(view.oldestOverdueDays).toBeNull();
  });
});

describe('shareLabel', () => {
  it('is a whole percent, floored, in cents', () => {
    expect(shareLabel(1, 3)).toBe('33');
    expect(shareLabel(0.3, 0.1 + 0.2)).toBe('100');
  });

  it('is "0" for nothing, "<1" for a sliver and 100 only for the whole', () => {
    expect(shareLabel(0, 400)).toBe('0');
    expect(shareLabel(1, 400)).toBe('<1');
    expect(shareLabel(399.99, 400)).toBe('99');
    expect(shareLabel(400, 400)).toBe('100');
  });

  it('has no share of nothing', () => {
    expect(shareLabel(0, 0)).toBeNull();
  });
});

describe('overdue age', () => {
  it('counts calendar days, so the hour of the day never moves it', () => {
    const early = new Date(2026, 10, 5, 0, 5).getTime();
    const late = new Date(2026, 10, 5, 23, 55).getTime();
    expect(buildReceivablesView(summary(), early).oldestOverdueDays).toBe(45);
    expect(buildReceivablesView(summary(), late).oldestOverdueDays).toBe(45);
  });

  it('has no age when nothing is overdue', () => {
    const view = buildReceivablesView(
      summary({ overdue: { amount: 0, count: 0, oldestDueDate: null } }),
      now
    );
    expect(view.oldestOverdueDays).toBeNull();
  });
});

describe('paidPercent', () => {
  it('is the whole percent of the invoice already paid', () => {
    expect(paidPercent(400, 100)).toBe(25);
    expect(paidPercent(400, 400)).toBe(100);
  });

  it('never shows 100 while a balance is still open', () => {
    expect(paidPercent(1000, 995)).toBe(99);
    expect(paidPercent(1000, 999.99)).toBe(99);
    expect(paidPercent(1000, 1000)).toBe(100);
  });

  it('is 0 when nothing is billed or paid, and never above 100', () => {
    expect(paidPercent(0, 0)).toBe(0);
    expect(paidPercent(400, 0)).toBe(0);
    expect(paidPercent(400, 500)).toBe(100);
  });
});
