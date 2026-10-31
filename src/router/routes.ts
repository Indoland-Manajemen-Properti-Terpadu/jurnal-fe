// Pure route constants.
// IMPORTANT: This file must NOT import any page/module components.
// Keeping it free of component imports prevents circular module
// initialization between `src/router/index.tsx` (which imports every page)
// and feature modules that need to read route paths.
//
// One group per feature module, named like the module folder in camelCase.
// Keys: `main` (the module's landing page), `detail`, `add`, `edit`, then clear names.
// Paths are public URLs; never change one without keeping the old one in `legacyPaths`.

export const routes = {
  // App level
  landing: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  oauthCallback: '/callback',
  dashboard: '/dashboard',
  profile: '/profile',
  notFound: '*',

  bankCash: {
    main: '/bank-cash',
    addTransfer: '/bank-cash/add-transfer-money',
    addReceive: '/bank-cash/add-receive-money',
    addSent: '/bank-cash/add-sent-money',
  },

  pettyCash: {
    main: '/bank-cash/petty-cash',
    detail: '/bank-cash/petty-cash/:fundId',
  },

  contacts: {
    main: '/contact',
    add: '/contact/add',
    detail: '/contact/:idAccount',
    transactions: '/contact/:idAccount/transaction-detail',
  },

  // The chart of accounts is the landing page of the "general journal" URL space.
  chartOfAccounts: {
    main: '/general-journal',
    add: '/general-journal/add-account',
    edit: '/general-journal/edit-account/:idAccount',
  },

  journalEntries: {
    add: '/general-journal/add-transaction-journal',
    detail: '/general-journal/detail-transaction-journal/:idTransaction',
  },

  accountLedger: {
    cashBank: '/general-journal/detail-account-cb/:idAccount',
    nonCashBank: '/general-journal/detail-account/:idAccount',
  },

  beginningBalances: {
    main: '/general-journal/beginning-balance',
  },

  bankStatements: {
    importDraft: '/general-journal/bank-statement/:idAccount/import',
  },

  periodClosing: {
    closingBooks: '/settings/general-journal/closing-books',
    list: '/settings/general-journal/closing-books/list/period-lock',
    financialStatement: '/settings/general-journal/period-lock/financial-statement',
  },

  reports: {
    main: '/result-reports',
    balanceSheet: '/result-reports/business-overview/balance-sheet',
    trialBalance: '/result-reports/business-overview/trial-balance',
    incomeStatement: '/result-reports/business-overview/income-statement',
    incomeStatementBudget: '/result-reports/business-overview/income-statement-budget',
    cashFlow: '/result-reports/business-overview/cash-flow',
    journalEntries: '/result-reports/business-overview/journal-entry',
    businessSummary: '/result-reports/business-overview/business-summary',
    generalLedger: '/result-reports/business-overview/general-ledger',
    equityChanges: '/result-reports/business-overview/equity-changes',
    budgetManagement: '/result-reports/business-overview/budget-management',
  },

  budgeting: {
    planning: '/budget-planning',
    budgetManagement: '/setting-budget/budget-management',
  },

  sales: {
    main: '/sales',
    detail: '/sales/:id',
  },

  purchases: {
    main: '/purchases',
  },

  costs: {
    main: '/finance/cost',
  },

  products: {
    main: '/products',
    detail: '/products/:id',
  },

  production: {
    main: '/production',
  },

  fulfillment: {
    main: '/fulfillment',
  },

  assets: {
    main: '/assets',
    detail: '/assets/:id',
  },

  pendingChanges: {
    main: '/pending-changes',
  },

  settings: {
    main: '/settings',
    general: '/settings/general',
    company: '/settings/company-setting',
    accountMapping: '/settings/account-mapping',
    taxes: '/settings/taxes',
    paymentTerms: '/settings/payment-terms',
    paymentMethods: '/settings/payment-methods',
    numberFormats: '/settings/number-formats',
    tags: '/settings/tags',
  },

  userManagement: {
    main: '/settings/user-management',
    addUser: '/settings/user-management/add-user-form',
    editUser: '/settings/user-management/edit-user/:email',
    addRole: '/settings/user-management/add-role-form',
  },

  // Old URLs that still work: each one redirects to its current page (see router/legacy.tsx).
  legacyPaths: {
    contacts: '/kontak',
    purchases: '/pembelian',
    assets: '/asset',
    approvalSetting: '/settings/approval-setting',
    reportsBusinessSumary: '/result-reports/business-overview/business-sumary',
  },
} as const;

export type Routes = typeof routes;
