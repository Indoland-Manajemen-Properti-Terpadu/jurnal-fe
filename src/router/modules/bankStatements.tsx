import type { RouteObject } from 'react-router-dom';
import { ImportBankStatementDraftPage } from '@/module/bank-statements';
import { routes } from '../routes';

export const bankStatementsRoutes: RouteObject[] = [
  { path: routes.bankStatements.importDraft, element: <ImportBankStatementDraftPage /> },
];
