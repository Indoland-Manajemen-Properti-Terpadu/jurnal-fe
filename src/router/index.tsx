import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { setNavigate } from '@/lib/http/apiClient';
import { NotFound } from '@/components/ErrorPage/NotFound';
import { routes } from './routes';
import { appRoutes } from './modules/app';
import { bankCashRoutes } from './modules/bankCash';
import { pettyCashRoutes } from './modules/pettyCash';
import { contactsRoutes } from './modules/contacts';
import { chartOfAccountsRoutes } from './modules/chartOfAccounts';
import { journalEntriesRoutes } from './modules/journalEntries';
import { accountLedgerRoutes } from './modules/accountLedger';
import { beginningBalancesRoutes } from './modules/beginningBalances';
import { bankStatementsRoutes } from './modules/bankStatements';
import { periodClosingRoutes } from './modules/periodClosing';
import { reportsRoutes } from './modules/reports';
import { budgetingRoutes } from './modules/budgeting';
import { salesRoutes } from './modules/sales';
import { purchasesRoutes } from './modules/purchases';
import { costsRoutes } from './modules/costs';
import { productsRoutes } from './modules/products';
import { productionRoutes } from './modules/production';
import { fulfillmentRoutes } from './modules/fulfillment';
import { assetsRoutes } from './modules/assets';
import { pendingChangesRoutes } from './modules/pendingChanges';
import { settingsRoutes } from './modules/settings';
import { userManagementRoutes } from './modules/userManagement';
import { legacyRoutes } from './modules/legacy';

const router = createBrowserRouter([
  ...appRoutes,
  ...bankCashRoutes,
  ...pettyCashRoutes,
  ...contactsRoutes,
  ...chartOfAccountsRoutes,
  ...journalEntriesRoutes,
  ...accountLedgerRoutes,
  ...beginningBalancesRoutes,
  ...bankStatementsRoutes,
  ...periodClosingRoutes,
  ...reportsRoutes,
  ...budgetingRoutes,
  ...salesRoutes,
  ...purchasesRoutes,
  ...costsRoutes,
  ...productsRoutes,
  ...productionRoutes,
  ...fulfillmentRoutes,
  ...assetsRoutes,
  ...pendingChangesRoutes,
  ...settingsRoutes,
  ...userManagementRoutes,
  ...legacyRoutes,
  { path: routes.notFound, element: <NotFound /> },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

export const { navigate } = router;
setNavigate(router.navigate);
export { routes } from './routes';
export { router };
