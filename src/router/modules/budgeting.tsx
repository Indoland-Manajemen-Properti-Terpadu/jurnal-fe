import type { RouteObject } from 'react-router-dom';
import { BudgetPlanningPage } from '@/module/budgeting';
import { BudgetManagementPage } from '@/module/reports';
import { routes } from '../routes';

export const budgetingRoutes: RouteObject[] = [
  { path: routes.budgeting.planning, element: <BudgetPlanningPage /> },
  { path: routes.budgeting.budgetManagement, element: <BudgetManagementPage /> },
];
