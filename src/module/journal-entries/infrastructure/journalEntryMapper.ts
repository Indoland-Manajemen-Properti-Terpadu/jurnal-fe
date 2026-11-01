import type {
  JournalEntryByAccount,
  JournalEntryDetail,
  JournalEntryPayload,
} from '../domain/journalEntry';

/**
 * Body of `POST /v1/journal`. A zero amount side is left out, `transactionNumber` only when it
 * is a number, `notes` only when not blank, `tags` and `attachments` only when not empty.
 * `attachments` holds `File` objects inside a JSON body: the backend contract for them is
 * undocumented (see the README), so it is kept exactly as before.
 */
export const toCreateBody = (data: JournalEntryPayload): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    transactionDate: data.transactionDate,
    transactionDetail: data.transactionDetail.map((detail) => ({
      account: detail.account,
      description: detail.description,
      ...(detail.debit ? { debit: detail.debit } : {}),
      ...(detail.credit ? { credit: detail.credit } : {}),
    })),
  };

  if (data.transactionNumber !== undefined && !Number.isNaN(data.transactionNumber)) {
    body.transactionNumber = data.transactionNumber;
  }
  if (data.notes && data.notes.trim().length > 0) {
    body.notes = data.notes;
  }
  if (data.tags?.length) {
    body.tags = data.tags;
  }
  if (data.attachments?.length) {
    body.attachments = data.attachments;
  }
  return body;
};

type Envelope = { data?: unknown; results?: unknown } | null | undefined;

const pickRows = (value: unknown): JournalEntryByAccount[] | undefined => {
  if (Array.isArray(value)) {
    return value as JournalEntryByAccount[];
  }
  return undefined;
};

/** The list of an account answers in several shapes; the first array found wins. */
export const toEntriesByAccount = (body: unknown): JournalEntryByAccount[] => {
  const result = body as Envelope;
  const nested = result?.data as Envelope;
  return (
    pickRows(nested?.results) ??
    pickRows(result?.results) ??
    pickRows(result?.data) ??
    pickRows(body) ??
    []
  );
};

export const toEntryDetail = (body: unknown): JournalEntryDetail =>
  (body as { data: JournalEntryDetail }).data;
