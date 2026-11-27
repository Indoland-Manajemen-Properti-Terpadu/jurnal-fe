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

  bankConnection: {
    main: '/bank-cash/connection',
    add: '/bank-cash/connection/new',
    detail: '/bank-cash/connection/:connectionId',
    edit: '/bank-cash/connection/:connectionId/edit',
  },

  pettyCash: {
    main: '/bank-cash/petty-cash',
    detail: '/bank-cash/petty-cash/:fundId',
    voucherAdd: '/bank-cash/petty-cash/:fundId/voucher/add',
    voucherEdit: '/bank-cash/petty-cash/:fundId/voucher/:voucherId/edit',
    countAdd: '/bank-cash/petty-cash/:fundId/count/add',
    replenishmentAdd: '/bank-cash/petty-cash/:fundId/replenishment/add',
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
    // The general journal is a report of the financial reports section.
    main: '/result-reports/business-overview/journal-entry',
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
    main: '/settings/general-journal/closing-books',
    closeBooks: '/settings/general-journal/closing-books/close',
  },

  reports: {
    main: '/result-reports',
    balanceSheet: '/result-reports/business-overview/balance-sheet',
    trialBalance: '/result-reports/business-overview/trial-balance',
    incomeStatement: '/result-reports/business-overview/income-statement',
    incomeStatementBudget: '/result-reports/business-overview/income-statement-budget',
    cashFlow: '/result-reports/business-overview/cash-flow',
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
    add: '/sales/new',
    quotations: '/sales/quotations',
    quotationAdd: '/sales/quotations/new',
    quotationEdit: '/sales/quotations/:id/edit',
    quotationDetail: '/sales/quotations/:id',
    orders: '/sales/orders',
    orderAdd: '/sales/orders/new',
    orderEdit: '/sales/orders/:id/edit',
    orderDetail: '/sales/orders/:id',
    payments: '/sales/payments',
    returns: '/sales/returns',
    returnAdd: '/sales/returns/new',
    returnEdit: '/sales/returns/:id/edit',
    returnDetail: '/sales/returns/:id',
    receivables: '/sales/receivables',
    edit: '/sales/:id/edit',
    detail: '/sales/:id',
    publicInvoice: '/invoice/:token',
  },

  purchases: {
    main: '/purchases',
    requests: '/purchases/requests',
    orders: '/purchases/orders',
    receipts: '/purchases/receipts',
    bills: '/purchases/bills',
    payments: '/purchases/payments',
    returns: '/purchases/returns',
    priceChanges: '/purchases/price-changes',
    payables: '/purchases/payables',
    requestAdd: '/purchases/requests/new',
    requestDetail: '/purchases/requests/:id',
    requestEdit: '/purchases/requests/:id/edit',
    orderDetail: '/purchases/orders/:id',
    receiptAdd: '/purchases/receipts/new',
    receiptDetail: '/purchases/receipts/:id',
    billAdd: '/purchases/bills/new',
    billDetail: '/purchases/bills/:id',
    billEdit: '/purchases/bills/:id/edit',
    paymentRequestAdd: '/purchases/payment-requests/new',
    paymentRequestDetail: '/purchases/payment-requests/:id',
    paymentRequestEdit: '/purchases/payment-requests/:id/edit',
    paymentAdd: '/purchases/payments/new',
    paymentDetail: '/purchases/payments/:id',
    returnAdd: '/purchases/returns/new',
    returnDetail: '/purchases/returns/:id',
    returnEdit: '/purchases/returns/:id/edit',
  },

  costs: {
    main: '/finance/cost',
  },

  products: {
    main: '/products',
    categories: '/products/categories',
    units: '/products/units',
    detail: '/products/:id',
  },

  inventory: {
    warehouses: '/inventory/warehouses',
    warehouseDetail: '/inventory/warehouses/:id',
    stockMovements: '/inventory/stock-movements',
    // Under the list's address so the sidebar keeps "Mutasi Stok" as the one active item.
    stockCard: '/inventory/stock-movements/card/:productId',
    transferNew: '/inventory/stock-movements/transfers/new',
    transferDetail: '/inventory/stock-movements/transfers/:id',
    stockTake: '/inventory/stock-take',
    // Under the list's address so the sidebar keeps "Stok Opname" as the one active item.
    stockTakeNew: '/inventory/stock-take/new',
    stockTakeDetail: '/inventory/stock-take/:id',
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
    new: '/assets/new',
    edit: '/assets/:id/edit',
    needsYou: '/assets/needs-you',
    writeOffNew: '/assets/write-offs/new',
    writeOffDetail: '/assets/write-offs/:id',
  },

  pendingChanges: {
    main: '/pending-changes',
  },

  settings: {
    main: '/settings',
    general: '/settings/general',
    company: '/settings/company-setting',
    sites: '/settings/sites',
    approvalFlow: '/settings/approval-flow',
    accountMapping: '/settings/account-mapping',
    taxes: '/settings/taxes',
    paymentTerms: '/settings/payment-terms',
    paymentTermNew: '/settings/payment-terms/new',
    paymentTermEdit: '/settings/payment-terms/:id/edit',
    paymentMethods: '/settings/payment-methods',
    numberFormats: '/settings/number-formats',
    tags: '/settings/tags',
    departments: '/settings/departments',
    opnameAccounts: '/settings/opname-accounts',
  },

  userManagement: {
    main: '/settings/user-management',
    roles: '/settings/user-management/roles',
    history: '/settings/user-management/history',
    addUser: '/settings/user-management/add-user-form',
    editUser: '/settings/user-management/edit-user/:userId',
    addRole: '/settings/user-management/add-role-form',
    roleDetail: '/settings/user-management/roles/:id',
    editRole: '/settings/user-management/roles/:id/edit',
  },

  // Old URLs that still work: each one redirects to its current page (see router/legacy.tsx).
  legacyPaths: {
    contacts: '/kontak',
    purchases: '/pembelian',
    assets: '/asset',
    journalEntries: '/journal-entries',
    approvalSetting: '/settings/approval-setting',
    reportsBusinessSumary: '/result-reports/business-overview/business-sumary',
    // The period closing prototype and the planned settings page now open the period list.
    periodClosingList: '/settings/general-journal/closing-books/list/period-lock',
    periodClosingStatement: '/settings/general-journal/period-lock/financial-statement',
    settingsAccountingPeriods: '/settings/accounting-periods',
  },
} as const;

export type Routes = typeof routes;
