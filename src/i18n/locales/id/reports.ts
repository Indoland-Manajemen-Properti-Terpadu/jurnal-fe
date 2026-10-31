import { reportsCommon } from './reportsCommon';
import { reportsCatalog } from './reportsCatalog';
import { reportsBalanceSheet } from './reportsBalanceSheet';
import { reportsLedger } from './reportsLedger';
import { reportsStatements } from './reportsStatements';

export const reports = {
  ...reportsCommon,
  ...reportsCatalog,
  ...reportsBalanceSheet,
  ...reportsLedger,
  ...reportsStatements,
};
