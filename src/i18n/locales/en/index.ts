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
import { plannedModules } from './plannedModules';
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
import { bankConnection } from './bankConnection';
import { pettyCash } from './pettyCash';
import { userManagement } from './userManagement';
import { authentication } from './authentication';

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
  plannedModules,
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
  bankConnection,
  pettyCash,
  userManagement,
  authentication,
};

export default en;
