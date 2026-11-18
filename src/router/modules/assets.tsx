import type { RouteObject } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import {
  AssetDetailPage,
  AssetFormPage,
  AssetPage,
  NeedsYouPage,
  WriteOffDetailPage,
  WriteOffFormPage,
} from '@/module/assets';
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
    path: routes.assets.needsYou,
    element: (
      <AppShellLayout>
        <NeedsYouPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.assets.writeOffNew,
    element: (
      <AppShellLayout>
        <WriteOffFormPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.assets.writeOffDetail,
    element: (
      <AppShellLayout>
        <WriteOffDetailPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.assets.new,
    element: (
      <AppShellLayout>
        <AssetFormPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.assets.edit,
    element: (
      <AppShellLayout>
        <AssetFormPage />
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
