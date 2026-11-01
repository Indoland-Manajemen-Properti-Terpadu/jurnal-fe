import type { RouteObject } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { PendingChangesPage } from '@/module/pending-changes';
import { routes } from '../routes';

export const pendingChangesRoutes: RouteObject[] = [
  {
    path: routes.pendingChanges.main,
    element: (
      <AppShellLayout>
        <PendingChangesPage />
      </AppShellLayout>
    ),
  },
];
