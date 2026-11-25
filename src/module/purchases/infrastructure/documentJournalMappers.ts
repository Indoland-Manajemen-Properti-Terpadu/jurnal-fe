import type { DocumentJournal } from '@/module/purchases/domain/documentJournal';
import { toDateOrNull } from '@/module/purchases/infrastructure/purchaseMappers';

export interface DocumentJournalDto {
  id: string;
  role?: string | null;
  label?: string | null;
  transactionNumber?: string | number | null;
  transactionDate?: string | null;
  status?: string | null;
  statusLabel?: string | null;
  reversedBy?: string | null;
  notes?: string | null;
  lines?:
    | {
        accountNumber?: string | null;
        accountName?: string | null;
        description?: string | null;
        debit?: number | null;
        credit?: number | null;
      }[]
    | null;
  totalDebit?: number | null;
  totalCredit?: number | null;
}

export const toDocumentJournals = (
  dtos: DocumentJournalDto[] | null | undefined
): DocumentJournal[] =>
  (dtos ?? []).map((dto) => ({
    id: dto.id,
    role: dto.role ?? '',
    label: dto.label ?? '',
    number:
      dto.transactionNumber === null || dto.transactionNumber === undefined
        ? ''
        : String(dto.transactionNumber),
    date: toDateOrNull(dto.transactionDate) ?? '',
    status: dto.status ?? '',
    statusLabel: dto.statusLabel ?? '',
    reversedById: dto.reversedBy ?? null,
    notes: dto.notes ?? '',
    lines: (dto.lines ?? []).map((line) => ({
      accountNumber: line.accountNumber ?? '',
      accountName: line.accountName ?? '',
      description: line.description ?? '',
      debit: line.debit ?? 0,
      credit: line.credit ?? 0,
    })),
    totalDebit: dto.totalDebit ?? 0,
    totalCredit: dto.totalCredit ?? 0,
  }));
