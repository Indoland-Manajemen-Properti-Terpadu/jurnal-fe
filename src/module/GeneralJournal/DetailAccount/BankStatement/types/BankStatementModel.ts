export type BankStatementModel = {
  id: number;
  transaction: string;
  date: string;
  received: number;
  sent: number;
  balance: number;
  status: string;
};

export interface BankStatementModelV2 {
  resultTransaction?: Array<Result | null>;
  results?: Result[];
}

export interface Result {
  id?: string;
  account?: string;
  description?: string;
  debit?: number;
  credit?: number;
  site?: Site;
  createdAt?: Date;
  updatedAt?: Date;
  transactionDate?: Date;
  transactionName?: string;
  reconciled?: boolean;
}

export interface Site {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
