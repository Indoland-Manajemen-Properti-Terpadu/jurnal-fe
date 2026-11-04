import { create } from 'zustand';
import { t } from '@/i18n';
import { summarizePreview } from '../../domain/importDraft';
import { parseServerImportError } from '../../domain/importValidation';
import type { BankStatementPreviewItem, PreviewSummary } from '../../domain/importPreview';

interface BankStatementState extends PreviewSummary {
  showAlert: boolean;
  errorMessages: string[];
  setShowAlert: (status: boolean) => void;
  setImportData: (preview: BankStatementPreviewItem[]) => void;
  setErrorMessages: (dataMessages: string[]) => void;
  updateItem: (rowIndex: number, updatedItem: Partial<BankStatementPreviewItem>) => void;
  deleteItem: (rowIndex: number) => void;
}

/** The server answers in English; a message it does not know is shown as it came. */
const describeError = (message: string): string => {
  const known = parseServerImportError(message);
  return known
    ? t(`importDraft.errors.${known.code}`, { fields: known.detail ?? '' }, 'bankStatements')
    : message;
};

const rowErrors = (wrongData: BankStatementPreviewItem[]) =>
  wrongData.map((item) =>
    t(
      'importDraft.rowError',
      { row: item.rowIndex, errors: item.errors.map(describeError).join(', ') },
      'bankStatements'
    )
  );

const derive = (rows: BankStatementPreviewItem[]) => {
  const summary = summarizePreview(rows);
  const errorMessages = rowErrors(summary.wrongData);
  return { ...summary, errorMessages, showAlert: errorMessages.length > 0 };
};

export const useBankStatementStore = create<BankStatementState>((set) => ({
  showAlert: false,
  totalData: [],
  wrongData: [],
  correctData: [],
  errorMessages: [],
  sumTotalData: 0,
  totalWrongData: 0,
  totalCorrectData: 0,

  setShowAlert: (status) => set({ showAlert: status }),

  setImportData: (preview) => set(derive(preview)),

  setErrorMessages: (dataMessages) =>
    set({ errorMessages: dataMessages, showAlert: dataMessages.length > 0 }),

  updateItem: (rowIndex, updatedItem) =>
    set((state) =>
      derive(
        state.totalData.map((item) =>
          item.rowIndex === rowIndex ? { ...item, ...updatedItem } : item
        )
      )
    ),

  deleteItem: (rowIndex) =>
    set((state) => derive(state.totalData.filter((item) => item.rowIndex !== rowIndex))),
}));
