import type {
  JournalHistoryEntry,
  JournalHistoryLine,
  JournalHistoryPage,
} from '../domain/journalHistory';
import { tagNames } from '../domain/journalTags';

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw =>
  value !== null && typeof value === 'object' ? (value as Raw) : {};
const text = (value: unknown) => (value === null || value === undefined ? '' : String(value));
const amount = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const count = (value: unknown, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const toLine = (value: unknown): JournalHistoryLine => {
  const line = asRecord(value);
  const account = asRecord(line.account);
  return {
    id: text(line.id),
    accountId: text(account.id),
    accountNumber: text(account.accountNumber),
    accountName: text(account.name),
    description: text(line.description),
    debit: amount(line.debit),
    credit: amount(line.credit),
  };
};

const toEntry = (value: unknown): JournalHistoryEntry => {
  const entry = asRecord(value);
  const lines = Array.isArray(entry.transactionDetail) ? entry.transactionDetail.map(toLine) : [];
  return {
    id: text(entry.id),
    transactionNumber: text(entry.transactionNumber),
    transactionDate: text(entry.transactionDate),
    transactionType: text(entry.transactionType),
    status: text(entry.status),
    notes: text(entry.notes),
    sourceType: entry.sourceType ? text(entry.sourceType) : null,
    tags: tagNames(entry.tags as never),
    lines,
    totalDebit: amount(entry.totalDebit),
    totalCredit: amount(entry.totalCredit),
    canVoid: entry.canVoid === true,
    voidBlockedReason: entry.voidBlockedReason ? text(entry.voidBlockedReason) : null,
  };
};

/** `GET /v1/journal`: `{ data: { results, page, limit, totalPages, totalResults } }`. */
export const toJournalHistoryPage = (body: unknown): JournalHistoryPage => {
  const data = asRecord(asRecord(body).data);
  const entries = Array.isArray(data.results) ? data.results.map(toEntry) : [];
  return {
    entries,
    page: count(data.page, 1),
    limit: count(data.limit, entries.length || 1),
    totalPages: count(data.totalPages, 1),
    total: Number.isFinite(Number(data.totalResults)) ? Number(data.totalResults) : entries.length,
  };
};
