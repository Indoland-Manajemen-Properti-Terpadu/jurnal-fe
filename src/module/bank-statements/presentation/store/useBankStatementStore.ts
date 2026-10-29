import { create } from 'zustand'
import { BankStatementPreviewItem } from '../../domain/importPreview';

interface BankStatementState {
    showAlert: boolean;
    errorMessages: string[];
    totalData: BankStatementPreviewItem[];
    wrongData: BankStatementPreviewItem[];
    correctData: BankStatementPreviewItem[];
    sumTotalData: number;
    totalWrongData: number;
    totalCorrectData: number;
    
    setShowAlert: (status: boolean) => void;
    setImportData: (preview: BankStatementPreviewItem[]) => void;
    setErrorMessages: (dataMessages: string[]) => void;
    updateItem: (rowIndex: number, updatedItem: Partial<BankStatementPreviewItem>) => void;
    deleteItem: (rowIndex: number) => void;
}

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
    
    setImportData: (preview) => {
        const correct = preview.filter(item => item.isValid);
        const wrong = preview.filter(item => !item.isValid);
        const allErrors = wrong.map(item => `Row ${item.rowIndex}: ${item.errors.join(', ')}`);
        
        set({
            totalData: preview,
            correctData: correct,
            wrongData: wrong,
            sumTotalData: preview.length,
            totalCorrectData: correct.length,
            totalWrongData: wrong.length,
            errorMessages: allErrors,
            showAlert: allErrors.length > 0
        });
    },

    setErrorMessages: (dataMessages) =>
        set(() => {
            return { errorMessages: dataMessages, showAlert: dataMessages.length > 0 }
        }),

    updateItem: (rowIndex, updatedItem) => set((state) => {
        const totalData = state.totalData.map((item) => 
            item.rowIndex === rowIndex ? { ...item, ...updatedItem } : item
        );
        
        const correct = totalData.filter(item => item.isValid);
        const wrong = totalData.filter(item => !item.isValid);
        const allErrors = wrong.map(item => `Row ${item.rowIndex}: ${item.errors.join(', ')}`);

        return {
            totalData,
            correctData: correct,
            wrongData: wrong,
            sumTotalData: totalData.length,
            totalCorrectData: correct.length,
            totalWrongData: wrong.length,
            errorMessages: allErrors,
            showAlert: allErrors.length > 0
        };
    }),

    deleteItem: (rowIndex) => set((state) => {
        const totalData = state.totalData.filter((item) => item.rowIndex !== rowIndex);
        const correct = totalData.filter(item => item.isValid);
        const wrong = totalData.filter(item => !item.isValid);
        const allErrors = wrong.map(item => `Row ${item.rowIndex}: ${item.errors.join(', ')}`);

        return {
            totalData,
            correctData: correct,
            wrongData: wrong,
            sumTotalData: totalData.length,
            totalCorrectData: correct.length,
            totalWrongData: wrong.length,
            errorMessages: allErrors,
            showAlert: allErrors.length > 0
        };
    }),
}))
