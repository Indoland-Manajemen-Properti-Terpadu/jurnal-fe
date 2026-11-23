import type { AttachmentKind } from '@/module/purchases/domain/purchaseCommon';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';

export type BillVerifyGap =
  | 'vendorInvoiceNumber'
  | 'vendorInvoiceFile'
  | 'vendorInvoiceTotal'
  | 'taxInvoiceFile';

/**
 * What a draft bill still lacks before it can be verified (QA decision, PRO-111, 2026-11-23).
 * Saving a draft stays free; only verifying asks for the vendor invoice number and file, the vendor
 * invoice total on a bill from a receipt (it feeds the three-way check), and the tax invoice file
 * when the bill carries VAT. The server should enforce the same; this only keeps the user from
 * sending a call that is bound to fail.
 */
export const billVerifyMissing = (bill: PurchaseBill): BillVerifyGap[] => {
  const hasFile = (kind: AttachmentKind) => bill.attachments.some((file) => file.kind === kind);
  const missing: BillVerifyGap[] = [];
  if (bill.vendorInvoiceNumber.trim() === '') missing.push('vendorInvoiceNumber');
  if (!hasFile('VENDOR_INVOICE')) missing.push('vendorInvoiceFile');
  if (bill.source === 'RECEIPT' && bill.vendorInvoiceTotal === null) {
    missing.push('vendorInvoiceTotal');
  }
  if (bill.taxAmount > 0 && !hasFile('TAX_INVOICE')) missing.push('taxInvoiceFile');
  return missing;
};
