export interface JournalLine {
  accountNumber: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

/**
 * A journal a document posted: the accrual of a receipt, the booking of a bill, a payment, an
 * advance, or the reversing journal made when one of them was cancelled.
 */
export interface DocumentJournal {
  id: string;
  /** `RECEIPT`, `BILL`, `ADVANCE`, `PAYMENT` or `REVERSAL`. */
  role: string;
  /** The role in words ("Verifikasi faktur"). */
  label: string;
  /** The number of the journal entry; empty when the service sends none. */
  number: string;
  date: string;
  /** `ACTIVE`, `VOID` or `REVERSAL`. */
  status: string;
  statusLabel: string;
  /** The journal that reverses this one, once it was cancelled. */
  reversedById: string | null;
  notes: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}
