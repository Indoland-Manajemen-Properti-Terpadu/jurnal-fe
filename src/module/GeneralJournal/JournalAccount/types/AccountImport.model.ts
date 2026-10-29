export interface AccountImportItem {
  id: number;
  accountNumber: string;
  name: string | number;
  categoryID: number;
  amount: string | number;
  category?: any;
  categoryName?: string | null;
}

export interface WrongDataItem {
  item: AccountImportItem;
  errorItem: string[];
}

export interface AccountImportResponse {
  code: number;
  message: string;
  data: [
    { totalData: AccountImportItem[] },
    { correctData: AccountImportItem[] },
    { wrongData: WrongDataItem[] },
    { wrongMessages: string[][] }
  ];
}
