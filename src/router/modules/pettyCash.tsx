import type { RouteObject } from 'react-router-dom';
import {
  CountAddPage,
  PettyCashDetailPage,
  PettyCashPage,
  ReplenishmentAddPage,
  VoucherAddPage,
  VoucherEditPage,
} from '@/module/petty-cash';
import { routes } from '../routes';

export const pettyCashRoutes: RouteObject[] = [
  { path: routes.pettyCash.main, element: <PettyCashPage /> },
  { path: routes.pettyCash.detail, element: <PettyCashDetailPage /> },
  { path: routes.pettyCash.voucherAdd, element: <VoucherAddPage /> },
  { path: routes.pettyCash.voucherEdit, element: <VoucherEditPage /> },
  { path: routes.pettyCash.countAdd, element: <CountAddPage /> },
  { path: routes.pettyCash.replenishmentAdd, element: <ReplenishmentAddPage /> },
];
