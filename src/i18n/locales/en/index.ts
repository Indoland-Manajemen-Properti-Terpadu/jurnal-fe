import { common } from './common';
import { navigation } from './navigation';
import { journal } from './journal';
import { settings } from './settings';
import { settingsPages } from './settingsPages';
import { pendingChanges } from './pendingChanges';
import { assets } from './assets';
import { contactDetail } from './contactDetail';
import { contacts } from './contacts';
import { saleDetail } from './saleDetail';
import { sales } from './sales';
import { dashboard } from './dashboard';
import { costs } from './costs';
import { production } from './production';
import { fulfillment } from './fulfillment';
import { budgeting } from './budgeting';
import { landing } from './landing';
import { profile } from './profile';
import { purchases } from './purchases';
import { products } from './products';
import { periodClosing } from './periodClosing';
import { beginningBalances } from './beginningBalances';
import { bankStatements } from './bankStatements';
import { journalEntries } from './journalEntries';
import { chartOfAccounts } from './chartOfAccounts';
import { reconciliation } from './reconciliation';
import { accountLedger } from './accountLedger';
import { reports } from './reports';
import { bankCash } from './bankCash';
import { pettyCash } from './pettyCash';
import { userManagement } from './userManagement';

export const en = {
  common,
  navigation,
  journal,
  settings: { ...settings, ...settingsPages },
  pendingChanges,
  assets,
  contactDetail,
  contacts,
  saleDetail,
  sales,
  dashboard,
  costs,
  production,
  fulfillment,
  budgeting,
  landing,
  profile,
  purchases,
  products,
  periodClosing,
  beginningBalances,
  bankStatements,
  journalEntries,
  chartOfAccounts,
  reconciliation,
  accountLedger,
  reports,
  bankCash,
  pettyCash,
  userManagement,
};

export default en;
