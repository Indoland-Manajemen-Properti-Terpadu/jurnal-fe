import { JournalAccounts } from "@/module/JurnalUmum/AkunJurnal/types/JournalAccountModel";
import { SetStateAction } from "react";

export interface ImportBankStatement {
    account?: JournalAccounts;
    datas?:   Data[];
}

export interface Data {
    [x: string]: any;
    transactionName?: string;
    transactionDate?: string;
    debit?:           number;
    credit?:          number;
    errors?:          any[];
}
