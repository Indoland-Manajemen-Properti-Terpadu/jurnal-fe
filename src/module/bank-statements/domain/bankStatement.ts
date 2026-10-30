export interface BankStatementModelV2 {
  resultTransaction?: Array<Result | null>;
  results?: Result[];
}

export interface Result {
  id?: string;
  account?: string;
  description?: string;
  /** Money received: the positive side of the bank amount. */
  debit?: number;
  /** Money spent: the negative side of the bank amount, as a positive number. */
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
