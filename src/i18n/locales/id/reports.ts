import { reportsCommon } from './reportsCommon';
import { reportsCatalog } from './reportsCatalog';
import { reportsBalanceSheet } from './reportsBalanceSheet';
import { reportsLedger } from './reportsLedger';
import { reportsStatements } from './reportsStatements';
import { reportsProfitLoss } from './reportsProfitLoss';
import { reportsTrialBalance } from './reportsTrialBalance';

export const reports = {
  ...reportsCommon,
  ...reportsCatalog,
  ...reportsBalanceSheet,
  ...reportsLedger,
  ...reportsStatements,
  ...reportsProfitLoss,
  ...reportsTrialBalance,
};
