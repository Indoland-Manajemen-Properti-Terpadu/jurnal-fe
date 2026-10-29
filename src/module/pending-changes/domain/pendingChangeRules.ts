import { PENDING_CHANGE_TYPES, type PendingChangeItem } from './pendingChange';

export const isFineChange = (change: PendingChangeItem): boolean =>
  change.type === PENDING_CHANGE_TYPES.fine;

export const isPaymentChange = (change: PendingChangeItem): boolean =>
  change.type === PENDING_CHANGE_TYPES.salePayment;

export const isDeletionChange = (change: PendingChangeItem): boolean => {
  const type = change.type?.toUpperCase() ?? '';
  return (
    type.includes('DELETE') ||
    type.includes('VOID') ||
    change.payload?.action === 'DELETE' ||
    change.deleted === true
  );
};

export const countByType = (items: PendingChangeItem[]) => ({
  fine: items.filter(isFineChange).length,
  payment: items.filter(isPaymentChange).length,
});

export type ParsedChangeNotes = {
  invoiceNo: string | null;
  customerCode: string | null;
  description: string | null;
};

/** Notes look like "Invoice: INV-001, Pelanggan: C-77 free text"; pull the codes out of the text. */
export const parseChangeNotes = (notes?: string): ParsedChangeNotes => {
  if (!notes) return { invoiceNo: null, customerCode: null, description: null };
  const invoiceMatch = notes.match(/Invoice:\s*([^\s,;]+)/i);
  const customerMatch = notes.match(/Pelanggan:\s*([^\s,;]+)/i);

  let description = notes;
  if (invoiceMatch || customerMatch) {
    description = notes
      .replace(/Pelanggan:\s*[^\s,;]+,?\s*/i, '')
      .replace(/Invoice:\s*[^\s,;]+[.,]?\s*/i, '')
      .trim();
  }

  return {
    invoiceNo: invoiceMatch ? invoiceMatch[1] : null,
    customerCode: customerMatch ? customerMatch[1] : null,
    description: description || notes,
  };
};

const HIDDEN_PAYLOAD_KEYS = ['syncDate', '_id', 'id', 'site', '__v', 'createdAt', 'updatedAt'];

/** Payload fields worth showing when a change has no amount. */
export const visiblePayloadEntries = (change: PendingChangeItem): [string, unknown][] =>
  Object.entries(change.payload || {}).filter(([key]) => !HIDDEN_PAYLOAD_KEYS.includes(key));

export const findGenericAmount = (change: PendingChangeItem) => {
  const { amount, nominal, total } = change.payload || {};
  if (amount === undefined && nominal === undefined && total === undefined) return undefined;
  return { value: amount ?? nominal ?? total };
};
