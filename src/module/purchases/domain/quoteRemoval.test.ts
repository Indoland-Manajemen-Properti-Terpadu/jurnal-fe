import type { Procurement, ProcurementInput } from '@/module/purchases/domain/procurement';
import { removalImpact, withoutQuote } from '@/module/purchases/domain/quoteRemoval';

const makeQuote = (id: string, vendorId: string) => ({
  id,
  vendor: { id: vendorId, name: vendorId },
});

const procurement = (overrides: Record<string, unknown> = {}): Procurement =>
  ({
    route: 'BIDDING',
    winnerId: 'v1',
    minQuotes: 2,
    quotes: [makeQuote('q1', 'v1'), makeQuote('q2', 'v2'), makeQuote('q3', 'v3')],
    totals: {
      q1: { complete: true, total: 900 },
      q2: { complete: true, total: 950 },
      q3: { complete: false, total: 0 },
    },
    ...overrides,
  }) as unknown as Procurement;

describe('removalImpact', () => {
  it('says the removed quote is the winner, and what is left', () => {
    const impact = removalImpact(procurement(), procurement().quotes[0]);
    expect(impact).toMatchObject({ isWinner: true, total: 900, remaining: 1, needed: 2, short: 1 });
  });

  it('is not short when enough complete quotes remain', () => {
    const three = procurement({
      totals: {
        q1: { complete: true, total: 900 },
        q2: { complete: true, total: 950 },
        q3: { complete: true, total: 970 },
      },
    });
    const impact = removalImpact(three, three.quotes[2]);
    expect(impact).toMatchObject({ isWinner: false, remaining: 2, short: 0 });
  });

  it('does not count the quote being removed, or an incomplete one, among what is left', () => {
    const impact = removalImpact(procurement(), procurement().quotes[1]);
    expect(impact.remaining).toBe(1);
  });

  it('needs one quote only on a single vendor, and never counts it short', () => {
    const single = procurement({
      route: 'SINGLE',
      quotes: [makeQuote('q1', 'v1')],
      totals: { q1: { complete: true, total: 900 } },
    });
    const impact = removalImpact(single, single.quotes[0]);
    expect(impact).toMatchObject({ needed: 1, remaining: 0, short: 1 });
  });

  it('has no total for a quote the service has not worked out yet', () => {
    const bare = procurement({ totals: {} });
    expect(removalImpact(bare, bare.quotes[0]).total).toBeNull();
  });
});

describe('withoutQuote', () => {
  const body = (winner?: string | null): ProcurementInput =>
    ({
      route: 'BIDDING',
      quotes: [
        { id: 'q1', vendor: 'v1' },
        { id: 'q2', vendor: 'v2' },
      ],
      ...(winner === undefined ? {} : { winner }),
    }) as unknown as ProcurementInput;

  it('drops the quote and keeps the others and the winner when another quote goes', () => {
    const next = withoutQuote(body('v1'), procurement().quotes[1]);
    expect(next.quotes.map((quote) => quote.id)).toEqual(['q1']);
    expect(next.winner).toBe('v1');
  });

  it('clears the winner on the service when the winner quote goes, since omitting it keeps it', () => {
    const next = withoutQuote(body('v1'), procurement().quotes[0]);
    expect(next.quotes.map((quote) => quote.id)).toEqual(['q2']);
    expect(next.winner).toBeNull();
  });

  it('leaves the winner out when there is none', () => {
    const next = withoutQuote(body(), procurement().quotes[1]);
    expect(next).not.toHaveProperty('winner');
  });
});
