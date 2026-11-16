import type { RouteObject } from 'react-router-dom';
import {
  BankConnectionDetailPage,
  BankConnectionFormPage,
  BankConnectionPage,
} from '@/module/bank-connection';
import { routes } from '../routes';

export const bankConnectionRoutes: RouteObject[] = [
  { path: routes.bankConnection.main, element: <BankConnectionPage /> },
  { path: routes.bankConnection.add, element: <BankConnectionFormPage /> },
  { path: routes.bankConnection.detail, element: <BankConnectionDetailPage /> },
  { path: routes.bankConnection.edit, element: <BankConnectionFormPage /> },
];
