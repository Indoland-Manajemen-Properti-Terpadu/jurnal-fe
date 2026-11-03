import type {
  JournalEntryByAccount,
  JournalEntryDetail,
  JournalEntryPayload,
} from '../domain/journalEntry';

/**
 * Normalizes fields of `POST /v1/journal`. A zero amount side is left out, `transactionNumber`
 * only when it is a number, and optional values only when present.
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

/** Encodes a journal entry as multipart form data so files are sent as binary attachments. */
export const toCreateFormData = (data: JournalEntryPayload): FormData => {
  const body = toCreateBody(data);
  const formData = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    if (key === 'attachments' && Array.isArray(value)) {
      value.forEach((file) => formData.append('attachments', file as File));
      return;
    }

    if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
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
