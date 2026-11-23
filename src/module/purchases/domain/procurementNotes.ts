import type { Procurement } from '@/module/purchases/domain/procurement';

export interface NotesValues {
  singleReason: string;
  belowMinQuotesReason: string;
  reason: string;
  negotiationNote: string;
}

export type NoteKey = keyof NotesValues;

/** Which written reasons this procurement needs, from what the service checks before submitting. */
export const neededNotes = (procurement: Procurement) => {
  const winner = procurement.quotes.find((quote) => quote.vendor.id === procurement.winnerId);
  const complete = Object.values(procurement.totals).filter((totals) => totals.complete).length;
  const negotiated = Boolean(
    winner?.lines.some((line) => line.finalPrice !== null && line.finalPrice > line.unitPrice)
  );
  return {
    single: procurement.route === 'SINGLE',
    belowMin: procurement.route !== 'SINGLE' && complete < procurement.minQuotes,
    notCheapest:
      procurement.route !== 'SINGLE' &&
      winner !== undefined &&
      procurement.cheapestVendorId !== null &&
      procurement.cheapestVendorId !== procurement.winnerId,
    negotiated,
  };
};

/**
 * The fields shown for a procurement, each with whether it is required. A single vendor gives the
 * reason for one vendor and, when the price rose, the negotiation note. Bidding has one field for
 * the reason for the choice and the negotiation (required when the winner is not the cheapest) and,
 * while it applies, the reason for fewer quotes. A reason left over from the other route is not
 * shown: the service ignores it, and showing it under the wrong label confused the approver.
 */
export const noteFields = (procurement: Procurement): { key: NoteKey; needed: boolean }[] => {
  const needs = neededNotes(procurement);
  const written = (key: NoteKey) => procurement[key].trim() !== '';
  if (procurement.route === 'SINGLE') {
    return [
      { key: 'singleReason', needed: true },
      ...(needs.negotiated || written('negotiationNote')
        ? [{ key: 'negotiationNote' as const, needed: needs.negotiated }]
        : []),
    ];
  }
  return [
    ...(needs.belowMin || written('belowMinQuotesReason')
      ? [{ key: 'belowMinQuotesReason' as const, needed: needs.belowMin }]
      : []),
    { key: 'reason', needed: needs.notCheapest },
  ];
};
