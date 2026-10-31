import type { RouteObject } from 'react-router-dom';
import { PettyCashDetailPage, PettyCashPage, PettyCashRouteScope } from '@/module/petty-cash';
import { routes } from '../routes';

export const pettyCashRoutes: RouteObject[] = [
  {
    path: routes.pettyCash.main,
    element: <PettyCashRouteScope />,
    children: [
      { index: true, element: <PettyCashPage /> },
      { path: ':fundId', element: <PettyCashDetailPage /> },
    ],
  },
];
