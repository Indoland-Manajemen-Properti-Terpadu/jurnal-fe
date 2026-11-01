import type { RouteObject } from 'react-router-dom';
import {
  ClosingBooksPage,
  FinancialStatementPage,
  PeriodClosingListPage,
} from '@/module/period-closing';
import { routes } from '../routes';

export const periodClosingRoutes: RouteObject[] = [
  { path: routes.periodClosing.closingBooks, element: <ClosingBooksPage /> },
  { path: routes.periodClosing.financialStatement, element: <FinancialStatementPage /> },
  { path: routes.periodClosing.list, element: <PeriodClosingListPage /> },
];
