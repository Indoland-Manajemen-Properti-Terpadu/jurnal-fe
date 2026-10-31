import type { RouteObject } from 'react-router-dom';
import { AccountLedgerPage } from '@/module/account-ledger';
import { routes } from '../routes';

export const accountLedgerRoutes: RouteObject[] = [
  { path: routes.accountLedger.cashBank, element: <AccountLedgerPage variant="cashBank" /> },
  { path: routes.accountLedger.nonCashBank, element: <AccountLedgerPage variant="nonCashBank" /> },
];
