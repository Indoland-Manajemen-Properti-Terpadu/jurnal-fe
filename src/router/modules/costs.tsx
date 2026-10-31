import type { RouteObject } from 'react-router-dom';
import { CostPage } from '@/module/costs';
import { routes } from '../routes';

export const costsRoutes: RouteObject[] = [{ path: routes.costs.main, element: <CostPage /> }];
