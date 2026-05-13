interface TransactionByAccountModel {
  id: string;
  transactionNumber: number;
  transactionDate: Date;
  transactionDetail: TransactionDetail[];
  status: string | '-';
  amount: number;
  credit: number | 0;
  debit: number | 0;
  balance: number | 0;
  attachments: any[];
  notes: string;
  site: string;
  createdAt: string;
  updatedAt: string;
}

interface Site {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  isLocked: boolean;
  name: string;
  accountNumber: string;
  category: string;
  subAccount: any[];
  draftAmount: number;
  isPublished: boolean;
  isAllUser: boolean;
  level: string;
  reconciliationDetail: any[];
  journals: any[];
  site: Site;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TransactionDetail {
  id: string;
  account: Account;
  description: string;
  debit: number;
  credit: number;
  site: Site;
  createdAt: string;
  updatedAt: string;
}
