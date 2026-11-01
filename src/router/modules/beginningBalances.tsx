import type { RouteObject } from 'react-router-dom';
import { BeginningBalancePage } from '@/module/beginning-balances';
import { routes } from '../routes';

export const beginningBalancesRoutes: RouteObject[] = [
  { path: routes.beginningBalances.main, element: <BeginningBalancePage /> },
];
