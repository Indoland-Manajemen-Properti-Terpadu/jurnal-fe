import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { setNavigate } from '@/lib/http/apiClient';

// General Journal Module
import GeneralJournalPage from '@/module/chart-of-accounts/presentation/pages/AccountListPage';
import AddAccountjournalPage from '@/module/chart-of-accounts/presentation/pages/AddAccountPage';
import EditAccountJournalPage from '@/module/chart-of-accounts/presentation/pages/EditAccountPage';
import { AddJournalEntryPage, JournalEntryDetailPage } from '@/module/journal-entries';
import { AccountLedgerPage } from '@/module/account-ledger';
import { BeginningBalancePage } from '@/module/beginning-balances';
import {
  ClosingBooksPage,
  FinancialStatementPage,
  PeriodClosingListPage,
} from '@/module/period-closing';

// User Management Module
import UserManagement from '@/module/SettingMenu/UserManagement/Main/pages/UserManagement';
import AddUserForm from '@/module/SettingMenu/UserManagement/User/components/AddUserForm/AddUserForm';
import AddRoleForm from '@/module/SettingMenu/UserManagement/Role/components/AddRoleForm/AddRoleForm';
import {
  ReportCatalogPage,
  BalanceSheetPage,
  TrialBalancePage,
  IncomeStatementPage,
  IncomeStatementBudgetPage,
  CashFlowPage,
  JournalEntryReportPage,
  BusinessSummaryPage,
  EquityChangesPage,
  BudgetManagementPage,
  GeneralLedgerPage,
} from '@/module/reports';
import { ImportBankStatementDraftPage } from '@/module/bank-statements';
import AddTransferMoneyPage from '@/module/BankCash/TransferMoney/pages/AddTransferMoney';
import AddReceiveMoneyPage from '@/module/BankCash/ReceiveMoney/page/AddReceiveMoney';
import BankAndCashMainPage from '@/module/BankCash/Main/pages/BankAndCashMainPage';
import AddSentMoneyPage from '@/module/BankCash/SentMoney/page/AddSentMoney';
import PettyCashPage from '@/module/BankCash/PettyCash/pages/PettyCashPage';
import PettyCashDetailPage from '@/module/BankCash/PettyCash/pages/PettyCashDetailPage';
import PettyCashRouteScope from '@/module/BankCash/PettyCash/pages/PettyCashRouteScope';
import EditUserForm from '@/module/SettingMenu/UserManagement/User/pages/EditUser';
import {
  AddContactPage,
  ContactMainPage,
  DetailContactPage,
  TransactionDetailByContactPage,
} from '@/module/contacts';
import { SaleDetailPage, SaleMainPage } from '@/module/sales';

// Base Module Routes
import { BudgetPlanningPage } from '@/module/budgeting';
import { PurchasesPage } from '@/module/purchases';
import { CostPage } from '@/module/costs';
import { ProductsPage, ProductDetailPage } from '@/module/products';
import { ProductionPage } from '@/module/production';
import { FulfillmentPage } from '@/module/fulfillment';
import { AssetDetailPage, AssetPage } from '@/module/assets';
import CompanySettingPage from '@/module/SettingMenu/CompanySetting/view/CompanySettingPage';
import SettingsHubPage from '@/module/SettingMenu/Hub/SettingsHubPage';
import GeneralSettingPage from '@/module/SettingMenu/GeneralSetting/GeneralSettingPage';
import AccountMappingPage from '@/module/SettingMenu/AccountMapping/AccountMappingPage';
import TaxSettingPage from '@/module/SettingMenu/Tax/TaxSettingPage';
import PaymentTermPage from '@/module/SettingMenu/PaymentSettings/PaymentTermPage';
import PaymentMethodPage from '@/module/SettingMenu/PaymentSettings/PaymentMethodPage';
import NumberFormatPage from '@/module/SettingMenu/NumberFormat/NumberFormatPage';
import TagSettingPage from '@/module/SettingMenu/Tags/TagSettingPage';
import AppShellLayout from '@/components/AppShellLayout';
import { PendingChangesPage } from '@/module/pending-changes';
import { NotFound } from '@/components/ErrorPage/NotFound';
import LoginPage from '@/module/Authentication/Login/pages/LoginPage';
import OAuthCallback from '@/module/Authentication/Login/pages/OAuthCallback';
import { DashboardPage } from '@/module/dashboard';
import { LandingPage } from '@/module/landing';
import { ProfilePage } from '@/module/profile';
import { routes } from './routes';

const router = createBrowserRouter([
  {
    path: routes.landingPage,
    element: <LandingPage />,
  },
  {
    path: routes.login,
    element: <LoginPage initialMode="login" />,
  },
  {
    path: routes.forgotPassword,
    element: <LoginPage initialMode="forgot" />,
  },
  {
    path: routes.oauthCallback,
    element: <OAuthCallback />,
  },
  {
    path: routes.dashboard,
    element: <DashboardPage />,
  },
  {
    path: routes.profile,
    element: <ProfilePage />,
  },

  //Bank And Cash Routes
  {
    path: routes.BankAndCash.Main,
    element: <BankAndCashMainPage />,
  },
  {
    path: routes.BankAndCash.AddTransferMoney,
    element: <AddTransferMoneyPage />,
  },
  {
    path: routes.BankAndCash.AddReceiveMoney,
    element: <AddReceiveMoneyPage />,
  },
  {
    path: routes.BankAndCash.AddSentMoney,
    element: <AddSentMoneyPage />,
  },
  {
    path: routes.BankAndCash.PettyCash,
    element: <PettyCashRouteScope />,
    children: [
      { index: true, element: <PettyCashPage /> },
      { path: ':fundId', element: <PettyCashDetailPage /> },
    ],
  },

  // Setting Budget Routes

  {
    path: routes.SettingBudget.BudgetManagement,
    element: <BudgetManagementPage />,
  },

  // General Journal Routes
  {
    path: routes.generalJournal.main,
    element: <GeneralJournalPage />,
  },
  {
    path: routes.generalJournal.addAccountJournal,
    element: <AddAccountjournalPage />,
  },
  {
    path: routes.generalJournal.editAccountJournal,
    element: <EditAccountJournalPage />,
  },
  {
    path: routes.generalJournal.addTransactionJournal,
    element: <AddJournalEntryPage />,
  },
  {
    path: routes.generalJournal.detailAccount,
    element: <AccountLedgerPage variant="cashBank" />,
  },
  {
    path: routes.generalJournal.detailAccountNonCB,
    element: <AccountLedgerPage variant="nonCashBank" />,
  },
  {
    path: routes.generalJournal.detailTransactionJournal,
    element: <JournalEntryDetailPage />,
  },
  {
    path: routes.generalJournal.beginningBalance,
    element: <BeginningBalancePage />,
  },
  {
    path: routes.generalJournal.closingBooks,
    element: <ClosingBooksPage />,
  },
  {
    path: routes.generalJournal.bankStatementDraftImport,
    element: <ImportBankStatementDraftPage />,
  },
  {
    path: routes.PeriodAndClosingBook.FinancialStatement,
    element: <FinancialStatementPage />,
  },
  {
    path: routes.PeriodAndClosingBook.ListPLandCB,
    element: <PeriodClosingListPage />,
  },

  // Contact Routes

  {
    path: routes.Contact.Main,
    element: <ContactMainPage />,
  },
  {
    path: routes.Contact.AddContact,
    element: <AddContactPage />,
  },
  {
    path: routes.Contact.DetailContact,
    element: <DetailContactPage />,
  },
  {
    path: routes.Contact.TransactionDetailByContact,
    element: <TransactionDetailByContactPage />,
  },

  // User Management Routes
  {
    path: routes.userManagement.main,
    element: <UserManagement />,
  },
  {
    path: routes.userManagement.addUser,
    element: <AddUserForm />,
  },
  {
    path: routes.userManagement.editUser,
    element: <EditUserForm />,
  },
  {
    path: routes.userManagement.addRole,
    element: <AddRoleForm />,
  },

  // Result Report Routes
  {
    path: routes.resultReport.main,
    element: <ReportCatalogPage />,
  },
  {
    path: routes.resultReport.balanceSheet,
    element: <BalanceSheetPage />,
  },
  {
    path: routes.resultReport.trialBalance,
    element: <TrialBalancePage />,
  },
  {
    path: routes.resultReport.incomeStatement,
    element: <IncomeStatementPage />,
  },
  {
    path: routes.resultReport.cashFlow,
    element: <CashFlowPage />,
  },
  {
    path: routes.resultReport.journalEntry,
    element: <JournalEntryReportPage />,
  },
  {
    path: routes.resultReport.businessSummary,
    element: <BusinessSummaryPage />,
  },
  {
    path: routes.resultReport.legacyBusinessSumary,
    element: <Navigate to={routes.resultReport.businessSummary} replace />,
  },
  {
    path: routes.resultReport.incomeStatementBudget,
    element: <IncomeStatementBudgetPage />,
  },
  {
    path: routes.resultReport.generalLedgerReport,
    element: <GeneralLedgerPage />,
  },
  {
    path: routes.resultReport.equityChanges,
    element: <EquityChangesPage />,
  },
  {
    path: routes.resultReport.budgetManagement,
    element: <BudgetManagementPage />,
  },

  {
    path: routes.sales.main,
    element: <SaleMainPage />,
  },
  {
    path: routes.sales.detail,
    element: <SaleDetailPage />,
  },

  {
    path: routes.notFound,
    element: <NotFound />,
  },

  {
    path: routes.baseModules.budgetPlanning,
    element: <BudgetPlanningPage />,
  },
  {
    path: routes.baseModules.purchases,
    element: <PurchasesPage />,
  },
  {
    path: routes.baseModules.legacyPurchases,
    element: <Navigate to={routes.baseModules.purchases} replace />,
  },
  {
    path: routes.baseModules.cost,
    element: <CostPage />,
  },
  {
    path: routes.baseModules.products,
    element: (
      <AppShellLayout>
        <ProductsPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.baseModules.productDetail,
    element: (
      <AppShellLayout>
        <ProductDetailPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.baseModules.production,
    element: <ProductionPage />,
  },
  {
    path: routes.baseModules.fulfillment,
    element: <FulfillmentPage />,
  },
  {
    path: routes.baseModules.assets,
    element: (
      <AppShellLayout>
        <AssetPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.baseModules.assetMaster,
    element: (
      <AppShellLayout>
        <AssetPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.baseModules.assetDetail,
    element: (
      <AppShellLayout>
        <AssetDetailPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.baseModules.contactsMaster,
    element: <Navigate to={routes.Contact.Main} replace />,
  },
  {
    path: routes.baseModules.companySetting,
    element: <CompanySettingPage />,
  },
  {
    path: routes.pendingChanges.main,
    element: (
      <AppShellLayout>
        <PendingChangesPage />
      </AppShellLayout>
    ),
  },
  {
    path: routes.baseModules.approvalSetting,
    element: <Navigate to={routes.pendingChanges.main} replace />,
  },
  {
    path: routes.settings.main,
    element: <SettingsHubPage />,
  },
  {
    path: routes.settings.general,
    element: <GeneralSettingPage />,
  },
  {
    path: routes.settings.accountMapping,
    element: <AccountMappingPage />,
  },
  {
    path: routes.settings.taxes,
    element: <TaxSettingPage />,
  },
  {
    path: routes.settings.paymentTerms,
    element: <PaymentTermPage />,
  },
  {
    path: routes.settings.paymentMethods,
    element: <PaymentMethodPage />,
  },
  {
    path: routes.settings.numberFormats,
    element: <NumberFormatPage />,
  },
  {
    path: routes.settings.tags,
    element: <TagSettingPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

export const { navigate } = router;
setNavigate(router.navigate);
export { routes } from './routes';
export { router };
