import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

// General Journal Module
import GeneralJournalPage from '@/module/GeneralJournal/Main/pages/GeneralJournalPage';
import AddAccountjournalPage from '@/module/GeneralJournal/JournalAccount/pages/AddAccount/AddAccountJournal';
import EditAccountJournalPage from '@/module/GeneralJournal/JournalAccount/pages/EditAccount/EditAccountJournal';
import AddJournalTransactionForm from '@/module/GeneralJournal/DetailAccount/TransactionJournal/components/Form/AddJournalTransactionForm';
import JournalTransactionDetailPage from '@/module/GeneralJournal/DetailAccount/TransactionJournal/pages/JournalTransactionDetail';
import DetailAccount from '@/module/GeneralJournal/DetailAccount/Main/pages/DetailAccountPage';
import DetailAccountNonCashBank from '@/module/GeneralJournal/DetailAccount/Main/pages/DetailAccountNonCashBankPage';
import BeginningBalancePage from '@/module/GeneralJournal/BeginningBalance/pages/BeginningBalancePage';
import ClosingBooksPage from '@/module/GeneralJournal/PeriodeLockAndClosingBooks/pages/ClosingBooks';

// User Management Module
import UserManagement from '@/module/SettingMenu/UserManagement/Main/pages/UserManagement';
import AddUserForm from '@/module/SettingMenu/UserManagement/User/components/AddUserForm/AddUserForm';
import AddRoleForm from '@/module/SettingMenu/UserManagement/Role/components/AddRoleForm/AddRoleForm';
import ResultReportPage from '@/module/ResultReport/Main/pages/CategoryReportPage';
import BalanceSheetPage from '@/module/ResultReport/BusinessOverview/page/BalanceSheetPage';
import ImportBankStatementDraft from '@/module/GeneralJournal/DetailAccount/BankStatement/pages/ImportBankStatementDraft';
import TrialBalancePage from '@/module/ResultReport/BusinessOverview/page/TrialBalancePage';
import IncomeStatementPage from '@/module/ResultReport/BusinessOverview/page/IncomeStatementPage';
import CashFlowPage from '@/module/ResultReport/BusinessOverview/page/CashFlowPage';
import JournalEntryPage from '@/module/ResultReport/BusinessOverview/page/JournalEntryPage';
import BusinessSumaryPage from '@/module/ResultReport/BusinessOverview/page/BusinessSumaryPage';
import IncomeStatementBudgetPage from '@/module/ResultReport/BusinessOverview/page/IncomeStatementBudgetPage';
import FinancialstatementPage from '@/module/GeneralJournal/PeriodeLockAndClosingBooks/pages/FinancialStatement';
import ListPeriodLockAndClosingBooksPage from '@/module/GeneralJournal/PeriodeLockAndClosingBooks/pages/ListPeriodLockAndClosingBooks';
import GeneralLedgerReportPage from '@/module/ResultReport/BusinessOverview/page/GeneralLedgerPage';
import EquityChangesPage from '@/module/ResultReport/BusinessOverview/page/EquityChangesPage';
import BudgetManagementPage from '@/module/ResultReport/BusinessOverview/page/BudgetManagementPage';
import AddTransferMoneyPage from '@/module/BankCash/TransferMoney/pages/AddTransferMoney';
import AddReceiveMoneyPage from '@/module/BankCash/ReceiveMoney/page/AddReceiveMoney';
import BankAndCashMainPage from '@/module/BankCash/Main/pages/BankAndCashMainPage';
import AddSentMoneyPage from '@/module/BankCash/SentMoney/page/AddSentMoney';
import EditUserForm from '@/module/SettingMenu/UserManagement/User/pages/EditUser';
import ContactMainPage from '@/module/Contact/view/ContactMainPage';
import AddContactPage from '@/module/Contact/view/AddContact';
import DetailContactPage from '@/module/Contact/view/DetailContact';
import TransactionDetailByContact from '@/module/Contact/view/TransactionDetailByContact';

// Base Module Routes
import BudgetPlanningPage from '@/module/BudgetPlanning/view/BudgetPlanningPage';
import PembelianPage from '@/module/Pembelian/view/PembelianPage';
import CostPage from '@/module/Cost/view/CostPage';
import ProductsPage from '@/module/products/pages/ProductsPage';
import ProductDetailPage from '@/module/products/pages/ProductDetailPage';
import ProductionPage from '@/module/Production/view/ProductionPage';
import FulfillmentPage from '@/module/Fulfillment/view/FulfillmentPage';
import AssetPage from '@/module/Asset/view/AssetPage';
import KontakPage from '@/module/Kontak/view/KontakPage';
import CompanySettingPage from '@/module/SettingMenu/CompanySetting/view/CompanySettingPage';
import ApprovalSettingPage from '@/module/SettingMenu/ApprovalSetting/view/ApprovalSettingPage';
import { NotFound } from '@/components/ErrorPage/NotFound';
import LoginPage from '@/module/Authentication/Login/pages/LoginPage';
import OAuthCallback from '@/module/Authentication/Login/pages/OAuthCallback';
import MainDashboard from '@/module/Dashboard/page/page';
import LandingPage from '@/module/LandingPage/pages/LandingPage';
import ProfilePage from '@/module/Profile/pages/ProfilePage';

const router = createBrowserRouter([
  {
    path: routes.landingPage,
    element: <LandingPage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.oauthCallback,
    element: <OAuthCallback />,
  },
  {
    path: routes.dashboard,
    element: <MainDashboard />,
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
    element: <AddJournalTransactionForm />,
  },
  {
    path: routes.generalJournal.detailAccount,
    element: <DetailAccount />,
  },
  {
    path: routes.generalJournal.detailAccountNonCB,
    element: <DetailAccountNonCashBank />,
  },
  {
    path: routes.generalJournal.detailTransactionJournal,
    element: <JournalTransactionDetailPage />,
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
    element: <ImportBankStatementDraft />,
  },
  {
    path: routes.PeriodAndClosingBook.FinancialStatement,
    element: <FinancialstatementPage />,
  },
  {
    path: routes.PeriodAndClosingBook.ListPLandCB,
    element: <ListPeriodLockAndClosingBooksPage />,
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
    element: <TransactionDetailByContact />,
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
    element: <ResultReportPage />,
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
    element: <JournalEntryPage />,
  },
  {
    path: routes.resultReport.businessSumary,
    element: <BusinessSumaryPage />,
  },
  {
    path: routes.resultReport.incomeStatementBudget,
    element: <IncomeStatementBudgetPage />,
  },
  {
    path: routes.resultReport.generalLedgerReport,
    element: <GeneralLedgerReportPage />,
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
    path: routes.notFound,
    element: <NotFound />,
  },

  {
    path: routes.baseModules.budgetPlanning,
    element: <BudgetPlanningPage />,
  },
  {
    path: routes.baseModules.pembelian,
    element: <PembelianPage />,
  },
  {
    path: routes.baseModules.cost,
    element: <CostPage />,
  },
  {
    path: routes.baseModules.products,
    element: <ProductsPage />,
  },
  {
    path: routes.baseModules.productDetail,
    element: <ProductDetailPage />,
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
    element: <AssetPage />,
  },
  {
    path: routes.baseModules.assetMaster,
    element: <AssetPage />,
  },
  {
    path: routes.baseModules.contactsMaster,
    element: <KontakPage />,
  },
  {
    path: routes.baseModules.companySetting,
    element: <CompanySettingPage />,
  },
  {
    path: routes.baseModules.approvalSetting,
    element: <ApprovalSettingPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

export const { navigate } = router;
export { routes } from './routes';
