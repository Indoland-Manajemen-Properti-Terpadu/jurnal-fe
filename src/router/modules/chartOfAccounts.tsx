import type { RouteObject } from 'react-router-dom';
import AccountListPage from '@/module/chart-of-accounts/presentation/pages/AccountListPage';
import AddAccountPage from '@/module/chart-of-accounts/presentation/pages/AddAccountPage';
import EditAccountPage from '@/module/chart-of-accounts/presentation/pages/EditAccountPage';
import { routes } from '../routes';

export const chartOfAccountsRoutes: RouteObject[] = [
  { path: routes.chartOfAccounts.main, element: <AccountListPage /> },
  { path: routes.chartOfAccounts.add, element: <AddAccountPage /> },
  { path: routes.chartOfAccounts.edit, element: <EditAccountPage /> },
];
