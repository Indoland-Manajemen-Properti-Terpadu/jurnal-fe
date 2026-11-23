import {
  quotesNeeded,
  type Procurement,
  type ProcurementInput,
  type Quote,
} from '@/module/purchases/domain/procurement';

/**
 * What removing a quote does to the procurement, so the confirmation can say it: whether the quote
 * is the winner, what it is worth, and how many complete quotes remain against how many are needed.
 */
export const removalImpact = (procurement: Procurement, quote: Quote) => {
  const needed = quotesNeeded(procurement);
  const remaining = procurement.quotes.filter(
    (other) => other.id !== quote.id && procurement.totals[other.id]?.complete
  ).length;
  return {
    isWinner: procurement.winnerId === quote.vendor.id,
    total: procurement.totals[quote.id]?.total ?? null,
    remaining,
    needed,
    short: Math.max(0, needed - remaining),
  };
};

/**
 * The procurement body without one quote. The service keeps a winner that a save leaves out, so
 * removing the winning quote clears the winner explicitly and the person chooses again.
 */
export const withoutQuote = (body: ProcurementInput, quote: Quote): ProcurementInput => {
  const { winner, ...rest } = body;
  const quotes = body.quotes.filter((other) => other.id !== quote.id);
  if (!winner) return { ...rest, quotes };
  return { ...rest, quotes, winner: winner === quote.vendor.id ? null : winner };
};
