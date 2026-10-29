import { JournalAccounts } from "@/module/GeneralJournal/JournalAccount/types/JournalAccountModel";

export interface ImportBankStatement {
    account?: JournalAccounts;
    datas?:   BankStatementPreviewItem[];
}

export interface BankStatementPreviewItem {
    rowIndex: number;
    TransactionDate: string;
    Received: string;
    Spent: string;
    Description: string;
    date: string | null;
    received: number | null;
    spent: number | null;
    amount: number | null;
    description: string;
    isDateValid: boolean;
    isReceivedValid: boolean;
    isSpentValid: boolean;
    isDescriptionValid: boolean;
    isValid: boolean;
    errors: string[];
    id?: string; // For local identification if needed
}

export interface BankStatementImportResponse {
    code: number;
    message: string;
    data: {
        accountId: string;
        preview: BankStatementPreviewItem[];
        errors: Record<string, string[]>;
        totalRows: number;
        totalValid: number;
    }
}
