import type {
  ApprovalMode,
  ApprovalState,
  Attachment,
  PartyRef,
} from '@/module/purchases/domain/purchaseCommon';
import type { ProcurementRoute } from '@/module/purchases/domain/purchaseRequest';

export type ProcurementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type ScoreKey = 'price' | 'spec' | 'delivery' | 'term';

/** 1 to 5 per criterion; a criterion nobody scored yet is null. */
export type QuoteScores = Record<ScoreKey, number | null>;

export interface ScoreCriterion {
  key: ScoreKey;
  label: string;
  /** Percent of the total score. */
  weight: number;
}

/** The payment term as it stood when the quote was saved, with the overrides applied. */
export interface TermSnapshot {
  paymentTermId: string;
  name: string;
  advanceType: 'none' | 'partial' | 'full';
  billingSplit: 'single' | 'milestone' | 'recurring';
  hasDueTerm: boolean;
  hasRetention: boolean;
  advancePercent: number;
  installments: number | null;
  installmentPercents: number[];
  dueDays: number | null;
  periods: number | null;
  retentionPercent: number;
  maintenanceMonths: number;
}

export interface QuoteLine {
  requestItemId: string;
  unitPrice: number;
  /** The price after negotiation; null means the quoted price stands. */
  finalPrice: number | null;
  specification: string;
  taxId: string;
  taxName: string;
}

/** A quote's discount is a rupiah amount (`nominal`) or a percent of the items (`percentage`). */
export type DiscountMode = 'nominal' | 'percentage';

export interface Quote {
  id: string;
  vendor: PartyRef;
  number: string;
  validUntil: string | null;
  description: string;
  attachments: Attachment[];
  paymentTermId: string;
  term: TermSnapshot | null;
  leadDays: number | null;
  warranty: string;
  /** The goods or service are received through an FPB / BAPP before billing. */
  withReceipt: boolean;
  isPriceIncludeTax: boolean;
  /** How the discount was given: a rupiah amount or a percent of the items. */
  discountType: DiscountMode;
  /** The rupiah amount or the percent, by `discountType`. */
  discountValue: number;
  /** The discount in rupiah, whichever way it was given. */
  discountAmount: number;
  shippingAmount: number;
  lines: QuoteLine[];
  scores: QuoteScores;
}

/** Amounts and score of one quote, computed by the service. */
export interface QuoteTotals {
  complete: boolean;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  /** Weighted score from 1 to 5; null while the quote is not scored. */
  score: number | null;
  vendorOrders: number;
  vendorLastOrderDate: string | null;
}

export interface ApprovalPreviewLevel {
  name: string;
  mode: ApprovalMode;
  roles: string[];
}

export interface Procurement {
  route: ProcurementRoute | null;
  status: ProcurementStatus;
  singleReason: string;
  belowMinQuotesReason: string;
  /** Vendor id of the chosen quote. */
  winnerId: string | null;
  /** Why the winner is not the cheapest. */
  reason: string;
  /** Why the final price is above the quoted price. */
  negotiationNote: string;
  /** Evidence of the negotiation, uploaded while the procurement is a draft or was rejected. */
  negotiationAttachments: Attachment[];
  quotes: Quote[];
  /** Totals by quote id. */
  totals: Record<string, QuoteTotals>;
  cheapestVendorId: string | null;
  estimatedValue: number;
  minQuotes: number;
  biddingNumber: string;
  /** The service's own sentences about what blocks submitting; empty means ready. */
  submitErrors: string[];
  scoreCriteria: ScoreCriterion[];
  approvalPreview: ApprovalPreviewLevel[];
  approval: ApprovalState;
}

export interface OrderRef {
  id: string;
  number: string;
  isService: boolean;
  total: number;
  status: string;
}

/** What a save sends. The service keeps what a PUT leaves out, so every field is sent. */
export interface QuoteLineInput {
  requestItem: string;
  unitPrice: number;
  finalPrice: number | null;
  specification: string;
  tax: string | null;
}

export interface TermOverridesInput {
  advancePercent?: number;
  installments?: number;
  installmentPercents?: number[];
  dueDays?: number;
  periods?: number;
  retentionPercent?: number;
  maintenanceMonths?: number;
}

export interface QuoteInput {
  /** Sent for a quote that already exists, so it keeps its files. */
  id?: string;
  vendor: string;
  quotationNumber: string;
  validUntil: string | null;
  description: string;
  paymentTerm: string;
  termOverrides: TermOverridesInput;
  leadDays: number;
  warranty: string;
  withReceipt: boolean;
  isPriceIncludeTax: boolean;
  discountType: DiscountMode;
  discountValue: number;
  shippingAmount: number;
  lines: QuoteLineInput[];
  scores?: Partial<Record<ScoreKey, number>>;
}

export interface ProcurementInput {
  route: ProcurementRoute;
  singleReason: string;
  belowMinQuotesReason: string;
  reason: string;
  negotiationNote: string;
  /** `null` clears the winner: the service keeps what a PUT leaves out, so omitting it changes nothing. */
  winner?: string | null;
  quotes: QuoteInput[];
}

/**
 * Overrides of the term that apply to its mechanism. The service refuses an advance of 0 on a term
 * without an advance, so only the fields of the term's own mechanism are sent.
 */
export const termOverridesOf = (term: TermSnapshot | null): TermOverridesInput => {
  if (!term) return {};
  const overrides: TermOverridesInput = {};
  if (term.advanceType === 'partial') overrides.advancePercent = term.advancePercent;
  if (term.billingSplit === 'milestone') {
    if (term.installments) overrides.installments = term.installments;
    if (term.installmentPercents.length > 0) {
      overrides.installmentPercents = term.installmentPercents;
    }
  }
  if (term.billingSplit === 'recurring' && term.periods) overrides.periods = term.periods;
  if (term.hasDueTerm && term.dueDays !== null) overrides.dueDays = term.dueDays;
  if (term.hasRetention) {
    overrides.retentionPercent = term.retentionPercent;
    overrides.maintenanceMonths = term.maintenanceMonths;
  }
  return overrides;
};

const scoresOf = (scores: QuoteScores): QuoteInput['scores'] => {
  const entries = (Object.keys(scores) as ScoreKey[]).flatMap((key) => {
    const value = scores[key];
    return value === null ? [] : [[key, value] as const];
  });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

/** A saved quote turned back into what the service takes, so one change can be saved on its own. */
export const quoteToInput = (quote: Quote): QuoteInput => ({
  id: quote.id,
  vendor: quote.vendor.id,
  quotationNumber: quote.number,
  validUntil: quote.validUntil,
  description: quote.description,
  paymentTerm: quote.paymentTermId,
  termOverrides: termOverridesOf(quote.term),
  leadDays: quote.leadDays ?? 0,
  warranty: quote.warranty,
  withReceipt: quote.withReceipt,
  isPriceIncludeTax: quote.isPriceIncludeTax,
  discountType: quote.discountType,
  discountValue: quote.discountValue,
  shippingAmount: quote.shippingAmount,
  lines: quote.lines.map((line) => ({
    requestItem: line.requestItemId,
    unitPrice: line.unitPrice,
    finalPrice: line.finalPrice,
    specification: line.specification,
    tax: line.taxId || null,
  })),
  scores: scoresOf(quote.scores),
});

/** The saved procurement as a body, ready to have one change applied. */
export const procurementToInput = (
  procurement: Procurement,
  route: ProcurementRoute = procurement.route ?? 'BIDDING'
): ProcurementInput => ({
  route,
  singleReason: procurement.singleReason,
  belowMinQuotesReason: procurement.belowMinQuotesReason,
  reason: procurement.reason,
  negotiationNote: procurement.negotiationNote,
  ...(procurement.winnerId ? { winner: procurement.winnerId } : {}),
  quotes: procurement.quotes.map(quoteToInput),
});

/** Bidding needs several quotes; a single vendor needs exactly one. */
export const quotesNeeded = (procurement: Procurement): number =>
  procurement.route === 'SINGLE' ? 1 : procurement.minQuotes;

/** The steps of the procurement card, each with whether it is done. */
export type ProcurementStepKey = 'quotes' | 'winner' | 'notes' | 'approval';

export interface ProcurementStep {
  key: ProcurementStepKey;
  done: boolean;
}

export const procurementSteps = (procurement: Procurement): ProcurementStep[] => {
  const complete = Object.values(procurement.totals).filter((totals) => totals.complete).length;
  const hasWinner = procurement.winnerId !== null;
  const submitted = procurement.status === 'SUBMITTED' || procurement.status === 'APPROVED';
  const quotesDone = complete >= quotesNeeded(procurement);
  return [
    { key: 'quotes', done: quotesDone },
    { key: 'winner', done: hasWinner && quotesDone },
    {
      key: 'notes',
      done: submitted || (quotesDone && hasWinner && procurement.submitErrors.length === 0),
    },
    { key: 'approval', done: procurement.status === 'APPROVED' },
  ];
};

/** The procurement can be changed and (re)submitted only while it is a draft or was rejected. */
export const procurementEditable = (procurement: Procurement): boolean =>
  procurement.status === 'DRAFT' || procurement.status === 'REJECTED';
