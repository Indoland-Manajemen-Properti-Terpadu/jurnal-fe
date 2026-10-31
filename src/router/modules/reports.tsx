import type { RouteObject } from 'react-router-dom';
import {
  BalanceSheetPage,
  BudgetManagementPage,
  BusinessSummaryPage,
  CashFlowPage,
  EquityChangesPage,
  GeneralLedgerPage,
  IncomeStatementBudgetPage,
  IncomeStatementPage,
  JournalEntryReportPage,
  ReportCatalogPage,
  TrialBalancePage,
} from '@/module/reports';
import { routes } from '../routes';

export const reportsRoutes: RouteObject[] = [
  { path: routes.reports.main, element: <ReportCatalogPage /> },
  { path: routes.reports.balanceSheet, element: <BalanceSheetPage /> },
  { path: routes.reports.trialBalance, element: <TrialBalancePage /> },
  { path: routes.reports.incomeStatement, element: <IncomeStatementPage /> },
  { path: routes.reports.incomeStatementBudget, element: <IncomeStatementBudgetPage /> },
  { path: routes.reports.cashFlow, element: <CashFlowPage /> },
  { path: routes.reports.journalEntries, element: <JournalEntryReportPage /> },
  { path: routes.reports.businessSummary, element: <BusinessSummaryPage /> },
  { path: routes.reports.generalLedger, element: <GeneralLedgerPage /> },
  { path: routes.reports.equityChanges, element: <EquityChangesPage /> },
  { path: routes.reports.budgetManagement, element: <BudgetManagementPage /> },
];
