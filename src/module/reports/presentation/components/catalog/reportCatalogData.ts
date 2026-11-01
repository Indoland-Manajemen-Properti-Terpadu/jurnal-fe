import {
  IconArrowsExchange,
  IconBook2,
  IconCashBanknote,
  IconChartBar,
  IconChartPie,
  IconFileAnalytics,
  IconReportMoney,
  IconScale,
  IconTimeline,
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
  category: 'financial' | 'ledger' | 'management';
  icon: Icon;
  color: string;
  badgeKey?: string;
  badgeColor?: string;
  featured?: boolean;
}

export const reportCategories: Array<{ value: ReportCategory; labelKey: string }> = [
  { value: 'all', labelKey: 'catalog.categoryAll' },
  { value: 'financial', labelKey: 'catalog.categoryFinancial' },
  { value: 'ledger', labelKey: 'catalog.categoryLedger' },
  { value: 'management', labelKey: 'catalog.categoryManagement' },
];

export const reportCatalogData: ReportItem[] = [
  {
    id: 'general-ledger',
    titleKey: 'catalog.generalLedgerTitle',
    englishTitleKey: 'catalog.generalLedgerEnglish',
    descriptionKey: 'catalog.generalLedgerDescription',
    route: routes.reports.generalLedger,
    category: 'ledger',
    icon: IconBook2,
    color: 'violet',
    badgeKey: 'catalog.badgeLive',
    badgeColor: 'teal',
    featured: true,
  },
  {
    id: 'balance-sheet',
    titleKey: 'catalog.balanceSheetTitle',
    englishTitleKey: 'catalog.balanceSheetEnglish',
    descriptionKey: 'catalog.balanceSheetDescription',
    route: routes.reports.balanceSheet,
    category: 'financial',
    icon: IconScale,
    color: 'blue',
    badgeKey: 'catalog.badgePsak',
    badgeColor: 'blue',
    featured: true,
  },
  {
    id: 'income-statement',
    titleKey: 'catalog.incomeStatementTitle',
    englishTitleKey: 'catalog.incomeStatementEnglish',
    descriptionKey: 'catalog.incomeStatementDescription',
    route: routes.reports.incomeStatement,
    category: 'financial',
    icon: IconChartBar,
    color: 'teal',
    badgeKey: 'catalog.badgePopular',
    badgeColor: 'orange',
    featured: true,
  },
  {
    id: 'trial-balance',
    titleKey: 'catalog.trialBalanceTitle',
    englishTitleKey: 'catalog.trialBalanceEnglish',
    descriptionKey: 'catalog.trialBalanceDescription',
    route: routes.reports.trialBalance,
    category: 'financial',
    icon: IconFileAnalytics,
    color: 'cyan',
  },
  {
    id: 'cash-flow',
    titleKey: 'catalog.cashFlowTitle',
    englishTitleKey: 'catalog.cashFlowEnglish',
    descriptionKey: 'catalog.cashFlowDescription',
    route: routes.reports.cashFlow,
    category: 'financial',
    icon: IconCashBanknote,
    color: 'emerald',
  },
  {
    id: 'journal-entry',
    titleKey: 'catalog.journalTitle',
    englishTitleKey: 'catalog.journalEnglish',
    descriptionKey: 'catalog.journalDescription',
    route: routes.reports.journalEntries,
    category: 'ledger',
    icon: IconTimeline,
    color: 'indigo',
  },
  {
    id: 'equity-changes',
    titleKey: 'catalog.equityTitle',
    englishTitleKey: 'catalog.equityEnglish',
    descriptionKey: 'catalog.equityDescription',
    route: routes.reports.equityChanges,
    category: 'financial',
    icon: IconArrowsExchange,
    color: 'grape',
  },
  {
    id: 'business-summary',
    titleKey: 'catalog.summaryTitle',
    englishTitleKey: 'catalog.summaryEnglish',
    descriptionKey: 'catalog.summaryDescription',
    route: routes.reports.businessSummary,
    category: 'management',
    icon: IconChartPie,
    color: 'pink',
  },
  {
    id: 'income-statement-budget',
    titleKey: 'catalog.budgetTitle',
    englishTitleKey: 'catalog.budgetEnglish',
    descriptionKey: 'catalog.budgetDescription',
    route: routes.reports.incomeStatementBudget,
    category: 'management',
    icon: IconReportMoney,
    color: 'yellow',
  },
];
