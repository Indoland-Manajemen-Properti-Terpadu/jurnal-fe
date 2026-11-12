/** The two documents a bank asks for: the ID of the responsible person and proof of the account. */
export const DOCUMENT_TYPES = ['IDENTITY', 'ACCOUNT_PROOF'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;

export type DocumentError = 'required' | 'tooLarge' | 'wrongType';
export type DocumentFiles = Partial<Record<DocumentType, File>>;
export type DocumentErrors = Partial<Record<DocumentType, DocumentError>>;

export const validateDocument = (file: File): DocumentError | null => {
  if (!(ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) return 'wrongType';
  if (file.size > MAX_DOCUMENT_BYTES) return 'tooLarge';
  return null;
};

/**
 * Both documents are needed before a request goes for review. One the backend already holds (a
 * request sent back) is not asked for again; a chosen file must be usable.
 */
export const validateDocuments = (files: DocumentFiles, held: DocumentType[]): DocumentErrors => {
  const errors: DocumentErrors = {};
  DOCUMENT_TYPES.forEach((type) => {
    const file = files[type];
    if (file) {
      const problem = validateDocument(file);
      if (problem) errors[type] = problem;
    } else if (!held.includes(type)) {
      errors[type] = 'required';
    }
  });
  return errors;
};
