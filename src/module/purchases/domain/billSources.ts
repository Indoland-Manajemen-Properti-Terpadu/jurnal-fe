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
  isPriceIncludeTax: boolean;
  lines: BillSourceLine[];
  /** Extra lines of the order (shipping, an advance) the bill takes along. */
  orderLines: BillSourceLine[];
}

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
