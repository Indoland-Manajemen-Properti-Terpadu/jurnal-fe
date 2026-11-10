import {
  IconArrowsExchange,
  IconBook2,
  IconCashBanknote,
  IconChartBar,
  IconChartPie,
  IconNotebook,
  IconFileAnalytics,
  IconReportMoney,
  IconScale,
  type Icon,
} from '@tabler/icons-react';
import { routes } from '@/router/routes';

export type ReportCategory = 'all' | 'financial' | 'ledger' | 'management';

export interface ReportItem {
  id: string;
  titleKey: string;
  englishTitleKey: string;
  descriptionKey: string;
  route: string;
  category: Exclude<ReportCategory, 'all'>;
  icon: Icon;
  /**
   * `soon` marks a report whose data is not available yet (the endpoint is missing or the page still
   * shows sample numbers). Flip it to `ready` when the report reads real data.
   */
  status: 'ready' | 'soon';
  /** Server menu id whose read right is needed; the card is hidden without it. */
  menuId?: string;
}

export const reportCategories: Array<{ value: ReportCategory; labelKey: string }> = [
  { value: 'all', labelKey: 'catalog.categoryAll' },
  { value: 'financial', labelKey: 'catalog.sectionFinancial' },
  { value: 'ledger', labelKey: 'catalog.sectionLedger' },
  { value: 'management', labelKey: 'catalog.sectionManagement' },
];

export const reportSections: Array<{
  category: Exclude<ReportCategory, 'all'>;
  titleKey: string;
  hintKey: string;
}> = [
  {
    category: 'financial',
    titleKey: 'catalog.sectionFinancial',
    hintKey: 'catalog.sectionFinancialHint',
  },
  { category: 'ledger', titleKey: 'catalog.sectionLedger', hintKey: 'catalog.sectionLedgerHint' },
  {
    category: 'management',
    titleKey: 'catalog.sectionManagement',
    hintKey: 'catalog.sectionManagementHint',
  },
];

export const reportCatalogData: ReportItem[] = [
  {
    id: 'balance-sheet',
    titleKey: 'catalog.balanceSheetTitle',
    englishTitleKey: 'catalog.balanceSheetEnglish',
    descriptionKey: 'catalog.balanceSheetDescription',
    route: routes.reports.balanceSheet,
    category: 'financial',
    icon: IconScale,
    status: 'ready',
  },
  {
    id: 'income-statement',
    titleKey: 'catalog.incomeStatementTitle',
    englishTitleKey: 'catalog.incomeStatementEnglish',
    descriptionKey: 'catalog.incomeStatementDescription',
    route: routes.reports.incomeStatement,
    category: 'financial',
    icon: IconChartBar,
    status: 'ready',
    menuId: 'JP-GL-PL',
  },
  {
    id: 'trial-balance',
    titleKey: 'catalog.trialBalanceTitle',
    englishTitleKey: 'catalog.trialBalanceEnglish',
    descriptionKey: 'catalog.trialBalanceDescription',
    route: routes.reports.trialBalance,
    category: 'financial',
    icon: IconFileAnalytics,
    status: 'soon',
  },
  {
    id: 'cash-flow',
    titleKey: 'catalog.cashFlowTitle',
    englishTitleKey: 'catalog.cashFlowEnglish',
    descriptionKey: 'catalog.cashFlowDescription',
    route: routes.reports.cashFlow,
    category: 'financial',
    icon: IconCashBanknote,
    status: 'soon',
  },
  {
    id: 'equity-changes',
    titleKey: 'catalog.equityTitle',
    englishTitleKey: 'catalog.equityEnglish',
    descriptionKey: 'catalog.equityDescription',
    route: routes.reports.equityChanges,
    category: 'financial',
    icon: IconArrowsExchange,
    status: 'soon',
  },
  {
    id: 'general-ledger',
    titleKey: 'catalog.generalLedgerTitle',
    englishTitleKey: 'catalog.generalLedgerEnglish',
    descriptionKey: 'catalog.generalLedgerDescription',
    route: routes.reports.generalLedger,
    category: 'ledger',
    icon: IconBook2,
    status: 'ready',
  },
  {
    id: 'journal-entry',
    titleKey: 'catalog.journalTitle',
    englishTitleKey: 'catalog.journalEnglish',
    descriptionKey: 'catalog.journalDescription',
    route: routes.journalEntries.main,
    category: 'ledger',
    icon: IconNotebook,
    status: 'ready',
  },
  {
    id: 'business-summary',
    titleKey: 'catalog.summaryTitle',
    englishTitleKey: 'catalog.summaryEnglish',
    descriptionKey: 'catalog.summaryDescription',
    route: routes.reports.businessSummary,
    category: 'management',
    icon: IconChartPie,
    status: 'soon',
  },
  {
    id: 'income-statement-budget',
    titleKey: 'catalog.budgetTitle',
    englishTitleKey: 'catalog.budgetEnglish',
    descriptionKey: 'catalog.budgetDescription',
    route: routes.reports.incomeStatementBudget,
    category: 'management',
    icon: IconReportMoney,
    status: 'soon',
  },
];
