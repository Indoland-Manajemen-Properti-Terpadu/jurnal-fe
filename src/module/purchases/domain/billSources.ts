import type { PartyRef } from '@/module/purchases/domain/purchaseCommon';
import type { BillSource, OrderSchedule } from '@/module/purchases/domain/purchaseDocuments';

/** The sources that bring documents to bill; a manual bill is typed in. */
export type PickedSource = Exclude<BillSource, 'MANUAL'>;

export interface BillSourceLine {
  purchaseOrderItemId: string;
  description: string;
  /** What can still be billed on this line: received and not billed yet, or the order's open quantity. */
  openQty: number;
  unitPrice: number;
  taxRate: number;
  schedule: OrderSchedule | null;
}

/** The payment term as the service sends it, field by field. */
export interface BillTerm {
  name: string;
  description: string;
  /** Days to pay; null when the term has no due date. */
  dueDays: number | null;
  /** What the days count from: the receipt date or the vendor's invoice date. */
  dueBasis: string;
  hasDueTerm: boolean;
  /** The sentence for a due date ("jatuh tempo saat penerimaan"). */
  dueText: string;
}

/** A receipt (FPB / BAPP) or an order that is ready to be billed. */
export interface BillSourceDoc {
  id: string;
  number: string;
  date: string;
  vendor: PartyRef;
  kind: 'GOODS' | 'SERVICE' | null;
  orderId: string;
  orderNumber: string;
  /** Receipts with the same key can share a bill; a different payment term cannot. */
  termKey: string;
  termName: string;
  term: BillTerm;
  /** Set when the term counts from the receipt date; null when it counts from the vendor invoice. */
  dueDate: string | null;
  isPriceIncludeTax: boolean;
  lines: BillSourceLine[];
  /** Extra lines of the order (shipping, an advance) the bill takes along. */
  orderLines: BillSourceLine[];
}

/** The due date for a vendor invoice dated `invoiceDate`; the service leaves it null for that term. */
export const dueDateFor = (doc: BillSourceDoc, invoiceDate: string): string => {
  if (doc.dueDate) return doc.dueDate;
  if (!doc.term.hasDueTerm || doc.term.dueDays === null || !invoiceDate) return '';
  const date = new Date(`${invoiceDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + doc.term.dueDays);
  return date.toISOString().slice(0, 10);
};

/** One bill is for one vendor and one payment term. */
export const compatibleWith = (picked: BillSourceDoc[], candidate: BillSourceDoc): boolean =>
  picked.length === 0 ||
  picked.every((doc) => doc.vendor.id === candidate.vendor.id && doc.termKey === candidate.termKey);

/** Why a candidate cannot join what is picked, for the hint under it; null when it can. */
export const incompatibility = (
  picked: BillSourceDoc[],
  candidate: BillSourceDoc
): 'vendor' | 'term' | null => {
  if (picked.length === 0) return null;
  if (picked.some((doc) => doc.vendor.id !== candidate.vendor.id)) return 'vendor';
  if (picked.some((doc) => doc.termKey !== candidate.termKey)) return 'term';
  return null;
};

/** Picks or unpicks one document. A document that does not fit the rest is not added. */
export const togglePicked = (
  picked: BillSourceDoc[],
  doc: BillSourceDoc,
  source: PickedSource
): BillSourceDoc[] => {
  if (picked.some((item) => item.id === doc.id)) return picked.filter((item) => item.id !== doc.id);
  if (!compatibleWith(picked, doc)) return picked;
  // An order bills straight from itself and can be combined with another of the same vendor and term.
  return source === 'ORDER' || source === 'RECEIPT' ? [...picked, doc] : picked;
};

export interface BillEstimateRow {
  key: string;
  description: string;
  /** The receipt the line was received on, or the order for a line that only the order has. */
  from: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface BillEstimate {
  rows: BillEstimateRow[];
  /** DPP: the amounts before tax. */
  subtotal: number;
  tax: number;
  total: number;
  /** The one tax rate of every taxed line, or null when the rates differ or none is taxed. */
  taxRate: number | null;
}

/**
 * What the bill will roughly come to, from the quantities still open and the order's prices. The service
 * works out the real figures when the bill is saved; this is only the preview shown before that.
 */
export const estimateBill = (picked: BillSourceDoc[]): BillEstimate => {
  const rows: BillEstimateRow[] = [];
  let subtotal = 0;
  let tax = 0;
  const rates = new Set<number>();
  picked.forEach((doc) => {
    [
      ...doc.lines.map((line) => ({ line, from: doc.number })),
      ...doc.orderLines.map((line) => ({ line, from: doc.orderNumber })),
    ].forEach(({ line, from }) => {
      const amount = line.openQty * line.unitPrice;
      const rate = line.taxRate / 100;
      const base = doc.isPriceIncludeTax ? amount / (1 + rate) : amount;
      subtotal += base;
      tax += doc.isPriceIncludeTax ? amount - base : base * rate;
      if (line.taxRate > 0) rates.add(line.taxRate);
      rows.push({
        key: `${doc.id}-${line.purchaseOrderItemId}`,
        description: line.description,
        from,
        qty: line.openQty,
        unitPrice: line.unitPrice,
        amount,
      });
    });
  });
  return {
    rows,
    subtotal,
    tax,
    total: subtotal + tax,
    taxRate: rates.size === 1 ? [...rates][0] : null,
  };
};
