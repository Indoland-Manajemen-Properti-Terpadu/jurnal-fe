/**
 * A failed contact import answers 400 with a summary in `message` and one entry per problem in
 * `data`: `{ row, field, message }`. A row can have several entries, and `field` is the column of
 * the template, or null when the problem belongs to the whole row.
 */
export interface ContactImportIssue {
  row: number;
  /** The template column, or null when the problem is about the whole row. */
  field: string | null;
  reason: string;
}

export class ContactImportError extends Error {
  constructor(
    message: string,
    readonly issues: ContactImportIssue[]
  ) {
    super(message);
    this.name = 'ContactImportError';
  }
}

const asIssue = (entry: unknown): ContactImportIssue | null => {
  if (typeof entry !== 'object' || entry === null) return null;
  const { row, field, message } = entry as Record<string, unknown>;
  const rowNumber = Number(row);
  if (!Number.isFinite(rowNumber) || typeof message !== 'string' || !message.trim()) return null;
  return {
    row: rowNumber,
    field: typeof field === 'string' && field.trim() ? field.trim() : null,
    reason: message.trim(),
  };
};

/** The error of an import the server refused, or null when the answer carries no row details. */
export const parseImportFailure = (body: unknown): ContactImportError | null => {
  if (typeof body !== 'object' || body === null) return null;
  const { message, data } = body as { message?: unknown; data?: unknown };
  if (!Array.isArray(data)) return null;
  const issues = data.map(asIssue).filter((issue): issue is ContactImportIssue => issue !== null);
  if (issues.length === 0) return null;
  const summary = typeof message === 'string' && message.trim() ? message.trim() : '';
  return new ContactImportError(summary, issues);
};
