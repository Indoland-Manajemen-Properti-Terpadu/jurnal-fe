import { fromMinor, sumMinor } from '@/lib/money/money';
import type { BankCashTransactionPayload } from './transactionTypes';

/**
 * Journal payloads of the cash and bank forms, built on integer cents (see `@/lib/money`). Each
 * typed amount is rounded half up to the cent once, so the debit line always equals the sum of
 * the credit lines. The default notes and descriptions are stored memo text, not UI copy.
 */

export interface AmountLine {
  accountId: string;
  description: string;
  amount: number;
}

/** Rounds one amount half up to the cent; a missing or non-finite amount counts as zero. */
const toCents = (value: unknown): number => {
  const amount = typeof value === 'string' ? Number(value) : value;
  return typeof amount === 'number' && Number.isFinite(amount)
    ? Math.round(Number((amount * 100).toPrecision(15)))
    : 0;
};

const toAmount = (cents: number): number => Number(fromMinor(cents));

export const sumLineAmounts = (lines: Array<Pick<AmountLine, 'amount'>>): number =>
  toAmount(sumMinor(lines.map((line) => toCents(line.amount))));

/** Balance left after paying `total`, in cents; negative means overdraft. */
export const balanceAfter = (balance: number, total: number): number =>
  toAmount(toCents(balance) - toCents(total));

const suffix = (value: string, build: (value: string) => string): string =>
  value ? build(value) : '';

export interface ReceiveInput {
  transactionDate: string;
  depositToAccountId: string;
  depositAccountName?: string;
  payerName: string;
  notes: string;
  items: AmountLine[];
}

export const buildReceivePayload = (input: ReceiveInput): BankCashTransactionPayload => {
  const { payerName, items } = input;
  const notes = input.notes.trim();
  const from = suffix(payerName, (name) => ` dari ${name}`);

  return {
    transactionDate: input.transactionDate,
    notes: notes || `Penerimaan kas masuk ke ${input.depositAccountName || 'Kas/Bank'}${from}`,
    transactionDetail: [
      {
        account: input.depositToAccountId,
        description: notes || `Penerimaan kas masuk${from}`,
        debit: sumLineAmounts(items),
      },
      ...items.map((item) => ({
        account: item.accountId,
        description:
          item.description.trim() || `Penerimaan kas${suffix(payerName, (name) => ` - ${name}`)}`,
        credit: toAmount(toCents(item.amount)),
      })),
    ],
  };
};

export interface SentInput {
  transactionDate: string;
  payFromAccountId: string;
  payFromAccountName?: string;
  recipientName: string;
  notes: string;
  items: AmountLine[];
}

export const buildSentPayload = (input: SentInput): BankCashTransactionPayload => {
  const { recipientName, items } = input;
  const notes = input.notes.trim();

  return {
    transactionDate: input.transactionDate,
    notes:
      notes ||
      `Pengeluaran kas dari ${input.payFromAccountName || 'Kas/Bank'}${suffix(recipientName, (name) => ` untuk ${name}`)}`,
    transactionDetail: [
      ...items.map((item) => ({
        account: item.accountId,
        description:
          item.description.trim() ||
          `Pengeluaran kas${suffix(recipientName, (name) => ` - ${name}`)}`,
        debit: toAmount(toCents(item.amount)),
      })),
      {
        account: input.payFromAccountId,
        description:
          notes || `Pengeluaran kas${suffix(recipientName, (name) => ` kepada ${name}`)}`,
        credit: sumLineAmounts(items),
      },
    ],
  };
};

export interface TransferInput {
  transactionDate: string;
  fromAccountId: string;
  fromAccountName?: string;
  fromAccountNumber?: string;
  toAccountId: string;
  toAccountName?: string;
  toAccountNumber?: string;
  amount: number;
  notes: string;
}

export const buildTransferPayload = (input: TransferInput): BankCashTransactionPayload => {
  const amount = toAmount(toCents(input.amount));
  const notes = input.notes.trim();

  return {
    transactionDate: input.transactionDate,
    notes:
      notes ||
      `Transfer dana dari ${input.fromAccountName || 'Kas'} ke ${input.toAccountName || 'Bank'}`,
    transactionDetail: [
      {
        account: input.toAccountId,
        description: `Transfer masuk dari ${input.fromAccountName || 'Akun Asal'} (${input.fromAccountNumber || ''})`,
        debit: amount,
      },
      {
        account: input.fromAccountId,
        description: `Transfer keluar ke ${input.toAccountName || 'Akun Tujuan'} (${input.toAccountNumber || ''})`,
        credit: amount,
      },
    ],
  };
};
