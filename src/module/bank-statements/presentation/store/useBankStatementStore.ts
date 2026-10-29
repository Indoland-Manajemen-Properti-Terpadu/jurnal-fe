import { create } from 'zustand';
import { t } from '@/i18n';
import { summarizePreview } from '../../domain/importDraft';
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

const rowErrors = (wrongData: BankStatementPreviewItem[]) =>
  wrongData.map((item) =>
    t(
      'importDraft.rowError',
      { row: item.rowIndex, errors: item.errors.join(', ') },
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
