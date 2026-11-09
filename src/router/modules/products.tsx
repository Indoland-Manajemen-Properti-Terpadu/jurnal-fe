import type { RouteObject } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import {
  ProductCategoriesPage,
  ProductDetailPage,
  ProductsPage,
  ProductUnitsPage,
} from '@/module/products';
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
    path: routes.products.categories,
    element: (
      <AppShellLayout>
        <ProductCategoriesPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.products.units,
    element: (
      <AppShellLayout>
        <ProductUnitsPage />
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
