import type { RouteObject } from 'react-router-dom';
import { ProductionPage } from '@/module/production';
import { routes } from '../routes';

export const productionRoutes: RouteObject[] = [
  { path: routes.production.main, element: <ProductionPage /> },
];
