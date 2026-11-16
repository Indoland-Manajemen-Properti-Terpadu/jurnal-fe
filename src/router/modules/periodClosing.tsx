import type { RouteObject } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { CloseBooksPage, PeriodListPage } from '@/module/period-closing';
import { routes } from '../routes';

export const periodClosingRoutes: RouteObject[] = [
  {
    path: routes.periodClosing.main,
    element: (
      <AppShellLayout>
        <PeriodListPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.periodClosing.closeBooks,
    element: (
      <AppShellLayout>
        <CloseBooksPage />
      </AppShellLayout>
    ),
  },
];
