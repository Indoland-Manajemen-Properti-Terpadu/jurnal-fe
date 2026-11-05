import { describe, expect, it } from 'vitest';
import { saleStatusTone, saleTimeline, tabParams } from './saleStatus';

describe('tabParams', () => {
  it('asks only for drafts on the draft tab', () => {
    expect(tabParams('draft', 'all')).toEqual({ paymentStatus: 'DRAFT' });
  });

  it('lists every sent status (and leaves void out) when no status is chosen', () => {
    expect(tabParams('sent', 'all')).toEqual({ paymentStatus: ['UNPAID', 'PAID', 'OVERDUE'] });
  });

  it('uses the chosen status exactly', () => {
    expect(tabParams('sent', 'OVERDUE')).toEqual({ paymentStatus: 'OVERDUE' });
  });
});

describe('saleStatusTone', () => {
  it('keeps red for overdue and green for paid only', () => {
    expect(saleStatusTone('OVERDUE').color).toBe('red');
    expect(saleStatusTone('PAID').color).toBe('teal');
    expect(saleStatusTone('UNPAID').color).toBe('primary');
    expect(saleStatusTone('DRAFT').color).toBe('gray');
    expect(saleStatusTone('VOID').color).toBe('gray');
  });
});

describe('saleTimeline', () => {
  const states = (code: Parameters<typeof saleTimeline>[0]) =>
    saleTimeline(code).map((step) => `${step.key}:${step.state}`);

  it('shows a draft as the first step of three', () => {
    expect(states('DRAFT')).toEqual(['draft:current', 'sent:todo', 'paid:todo']);
  });

  it('keeps an unpaid or overdue invoice on the sent step', () => {
    expect(states('UNPAID')).toEqual(['draft:done', 'sent:current', 'paid:todo']);
    expect(states('OVERDUE')).toEqual(['draft:done', 'sent:current', 'paid:todo']);
  });

  it('completes every step for a paid invoice', () => {
    expect(states('PAID')).toEqual(['draft:done', 'sent:done', 'paid:done']);
  });

  it('ends a void invoice on the void step', () => {
    expect(states('VOID')).toEqual(['draft:done', 'void:current']);
  });
});
