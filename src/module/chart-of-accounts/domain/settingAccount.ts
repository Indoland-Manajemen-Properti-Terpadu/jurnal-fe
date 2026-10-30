export interface AccountImportItem {
  id?: number | string;
  accountNumber: string;
  name: string;
  categoryID?: string | number;
  category?: string;
  categoryName?: string;
  amount?: number | string;
}

export interface WrongDataItem {
  item: AccountImportItem;
  errorItem?: string[];
}

export interface AccountImportParsedData {
  totalData: AccountImportItem[];
  correctData: AccountImportItem[];
  wrongData: WrongDataItem[];
  wrongMessages: string[][];
}

export interface AccountImportApiResponse {
  code?: number;
  message?: string;
  data?:
    | [
        { totalData: AccountImportItem[] },
        { correctData: AccountImportItem[] },
        { wrongData: WrongDataItem[] },
        { wrongMessages: string[][] },
      ]
    | {
        totalData?: AccountImportItem[];
        correctData?: AccountImportItem[];
        wrongData?: WrongDataItem[];
        wrongMessages?: string[][];
      };
}

export interface CommitImportPayload {
  correctData: AccountImportItem[];
}

export type SettingAccountAction = 'import' | 'export' | 'restore';
