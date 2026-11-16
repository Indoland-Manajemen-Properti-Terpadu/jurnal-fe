import { sumLineAmounts, balanceAfter } from '@/module/bank-cash/domain/transactionPayload';

/**
 * What a posting form still needs before it can be saved, and the journal it will post. Pure
 * functions over what the user typed; the payload itself is built in `transactionPayload`.
 */

export type MissingReason =
  | 'account'
  | 'fromAccount'
  | 'toAccount'
  | 'sameAccount'
  | 'date'
  | 'lines'
  | 'amount';

export interface FormLine {
  accountId: string;
  amount: number;
}

export interface LinesFormState {
  date: string;
  accountId: string | null;
  lines: FormLine[];
}

const linesComplete = (lines: FormLine[]): boolean =>
  lines.length > 0 &&
  lines.every((line) => line.accountId && Number(line.amount) > 0) &&
  sumLineAmounts(lines) > 0;

/** Receive and send share one shape: a cash account, a date and lines of account and amount. */
const linesMissing = ({ date, accountId, lines }: LinesFormState): MissingReason[] => [
  ...(accountId ? [] : (['account'] as const)),
  ...(date ? [] : (['date'] as const)),
  ...(linesComplete(lines) ? [] : (['lines'] as const)),
];

export const receiveMissing = linesMissing;
export const sentMissing = linesMissing;

export interface TransferFormState {
  date: string;
  fromId: string | null;
  toId: string | null;
  amount: number;
}

export const transferMissing = ({
  date,
  fromId,
  toId,
  amount,
}: TransferFormState): MissingReason[] => [
  ...(fromId ? [] : (['fromAccount'] as const)),
  ...(toId ? [] : (['toAccount'] as const)),
  ...(fromId && toId && fromId === toId ? (['sameAccount'] as const) : []),
  ...(date ? [] : (['date'] as const)),
  ...(amount > 0 ? [] : (['amount'] as const)),
];

export interface JournalPreviewLine {
  account: string;
  debit?: number;
  credit?: number;
}

export interface JournalPreview {
  lines: JournalPreviewLine[];
  /** Debit and credit add up to the same cent amount. */
  balanced: boolean;
}

interface NamedAmount {
  name: string;
  amount: number;
}

const usable = (items: NamedAmount[]): NamedAmount[] =>
  items.filter((item) => item.name && Number(item.amount) > 0);

const totalOf = (lines: JournalPreviewLine[], side: 'debit' | 'credit'): number =>
  sumLineAmounts(lines.map((line) => ({ amount: line[side] ?? 0 })));

const preview = (lines: JournalPreviewLine[]): JournalPreview => ({
  lines,
  balanced: totalOf(lines, 'debit') === totalOf(lines, 'credit'),
});

export const receivePreview = (cashName: string, sources: NamedAmount[]): JournalPreview => {
  const used = usable(sources);
  if (used.length === 0) return preview([]);
  return preview([
    { account: cashName, debit: sumLineAmounts(used) },
    ...used.map((item) => ({ account: item.name, credit: item.amount })),
  ]);
};

export const sentPreview = (cashName: string, expenses: NamedAmount[]): JournalPreview => {
  const used = usable(expenses);
  if (used.length === 0) return preview([]);
  return preview([
    ...used.map((item) => ({ account: item.name, debit: item.amount })),
    { account: cashName, credit: sumLineAmounts(used) },
  ]);
};

export const transferPreview = (
  fromName: string,
  toName: string,
  amount: number
): JournalPreview =>
  amount > 0
    ? preview([
        { account: toName, debit: amount },
        { account: fromName, credit: amount },
      ])
    : preview([]);

/** Balance after money comes in, cent-exact (the reverse of `balanceAfter`). */
export const balanceAfterReceive = (balance: number, total: number): number =>
  balanceAfter(balance, -total);

/** Today's calendar date (`YYYY-MM-DD`) in the books' time zone, WIB; the browser's zone must not move it. */
export const todayWib = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
