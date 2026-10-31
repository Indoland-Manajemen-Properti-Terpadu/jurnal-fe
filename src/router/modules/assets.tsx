import type { RouteObject } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { AssetDetailPage, AssetPage } from '@/module/assets';
import { routes } from '../routes';

export const assetsRoutes: RouteObject[] = [
  {
    path: routes.assets.main,
    element: (
      <AppShellLayout>
        <AssetPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.assets.detail,
    element: (
      <AppShellLayout>
        <AssetDetailPage />
      </AppShellLayout>
    ),
  },
];
