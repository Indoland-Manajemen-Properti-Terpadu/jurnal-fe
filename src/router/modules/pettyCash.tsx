import type { RouteObject } from 'react-router-dom';
import { PettyCashDetailPage, PettyCashPage } from '@/module/petty-cash';
import { routes } from '../routes';

export const pettyCashRoutes: RouteObject[] = [
  { path: routes.pettyCash.main, element: <PettyCashPage /> },
  { path: routes.pettyCash.detail, element: <PettyCashDetailPage /> },
];
