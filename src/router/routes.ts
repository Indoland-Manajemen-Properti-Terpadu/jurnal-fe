// Pure route constants.
// IMPORTANT: This file must NOT import any page/module components.
// Keeping it free of component imports prevents circular module
// initialization between `src/router/index.tsx` (which imports every page)
// and feature modules that need to read route paths.

export const routes = {
  notFound: '*',
  landingPage: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  oauthCallback: '/callback',
  dashboard: '/dashboard',
  profile: '/profile',

  BankAndCash: {
    Main: '/bank-cash',
    AddTransferMoney: '/bank-cash/add-transfer-money',
    AddReceiveMoney: '/bank-cash/add-receive-money',
    AddSentMoney: '/bank-cash/add-sent-money',
    PettyCash: '/bank-cash/petty-cash',
    PettyCashDetail: '/bank-cash/petty-cash/:fundId',
  },

  Contact: {
    Main: '/contact',
    AddContact: '/contact/add',
    DetailContact: '/contact/:idAccount',
    TransactionDetailByContact: '/contact/:idAccount/transaction-detail',
  },

  // General Journal Routes
  generalJournal: {
    main: '/general-journal',
    list: '/general-journal',
    addAccountJournal: '/general-journal/add-account',
    editAccountJournal: '/general-journal/edit-account/:idAccount',
    addTransactionJournal: '/general-journal/add-transaction-journal',
    detailTransactionJournal: '/general-journal/detail-transaction-journal/:idTransaction',
    beginningBalance: '/general-journal/beginning-balance',
    closingBooks: '/settings/general-journal/closing-books',
    detailAccount: '/general-journal/detail-account-cb/:idAccount',
    detailAccountNonCB: '/general-journal/detail-account/:idAccount',
    bankStatementDraftImport: '/general-journal/bank-statement/:idAccount/import',
  },

  sales: {
    main: '/sales',
    detail: '/sales/:id',
  },

  SettingBudget: {
    BudgetManagement: '/setting-budget/budget-management',
    BudgetIS: '/setting-budget/budget-IS',
  },

  // User Management Routes
  userManagement: {
    main: '/settings/user-management',
    list: '/settings/user-management',
    addUser: '/settings/user-management/add-user-form',
    editUser: '/settings/user-management/edit-user/:email',
    addRole: '/settings/user-management/add-role-form',
  },

  PeriodAndClosingBook: {
    FinancialStatement: '/settings/general-journal/period-lock/financial-statement',
    ListPLandCB: '/settings/general-journal/closing-books/list/period-lock',
  },

  resultReport: {
    main: '/result-reports',
    businessOverview: '/result-reports/business-overview',
    balanceSheet: '/result-reports/business-overview/balance-sheet',
    trialBalance: '/result-reports/business-overview/trial-balance',
    incomeStatement: '/result-reports/business-overview/income-statement',
    incomeStatementBudget: '/result-reports/business-overview/income-statement-budget',
    cashFlow: '/result-reports/business-overview/cash-flow',
    journalEntry: '/result-reports/business-overview/journal-entry',
    businessSumary: '/result-reports/business-overview/business-sumary',
    generalLedgerReport: '/result-reports/business-overview/general-ledger',
    equityChanges: '/result-reports/business-overview/equity-changes',
    budgetManagement: '/result-reports/business-overview/budget-management',
  },

  products: {
    main: '/products',
    detail: '/products/:id',
  },

  baseModules: {
    budgetPlanning: '/budget-planning',
    purchases: '/purchases',
    legacyPurchases: '/pembelian',
    cost: '/finance/cost',
    products: '/products',
    productDetail: '/products/:id',
    production: '/production',
    fulfillment: '/fulfillment',
    assets: '/assets',
    assetMaster: '/asset',
    assetDetail: '/assets/:id',
    contactsMaster: '/kontak',
    companySetting: '/settings/company-setting',
    approvalSetting: '/settings/approval-setting',
  },

  settings: {
    main: '/settings',
    general: '/settings/general',
    accountMapping: '/settings/account-mapping',
    taxes: '/settings/taxes',
    paymentTerms: '/settings/payment-terms',
    paymentMethods: '/settings/payment-methods',
    numberFormats: '/settings/number-formats',
    tags: '/settings/tags',
  },

  pendingChanges: {
    main: '/pending-changes',
  },
} as const;

export type Routes = typeof routes;
