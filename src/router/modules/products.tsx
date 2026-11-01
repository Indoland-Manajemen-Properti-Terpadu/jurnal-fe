import type { RouteObject } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ProductDetailPage, ProductsPage } from '@/module/products';
import { routes } from '../routes';

export const productsRoutes: RouteObject[] = [
  {
    path: routes.products.main,
    element: (
      <AppShellLayout>
        <ProductsPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.products.detail,
    element: (
      <AppShellLayout>
        <ProductDetailPage />
      </AppShellLayout>
    ),
  },
];
