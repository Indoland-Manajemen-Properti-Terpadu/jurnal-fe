import type { RouteObject } from 'react-router-dom';
import { FulfillmentPage } from '@/module/fulfillment';
import { routes } from '../routes';

export const fulfillmentRoutes: RouteObject[] = [
  { path: routes.fulfillment.main, element: <FulfillmentPage /> },
];
