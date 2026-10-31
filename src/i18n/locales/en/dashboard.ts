export const dashboard = {
  greetingMorning: 'Good morning',
  greetingAfternoon: 'Good afternoon',
  greetingEvening: 'Good evening',
  greetingNight: 'Good evening',

  heroSubtitle:
    'Track cash position, balance sheet health, receivable quality, and accounting activity in one overview.',
  spatialModeLabel: '3D Spatial Mode',
  spatialModeOn: '3D Spatial Active',
  spatialModeOff: 'Standard View',

  btnCreateJournal: 'New Journal Entry',
  btnSalesInvoice: 'Sales Invoice',
  btnRefresh: 'Refresh',

  periodLockedUntil: 'Period {{name}} locked until {{date}}',
  periodUnlocked: 'Accounting period open (unlocked)',

  // Fundamental Accounting Equation
  equationTitle: 'Financial Position Overview',
  equationBalanced: 'Books Balanced',
  equationUnbalanced: 'Adjustment Needed',
  totalAssets: 'Total Assets',
  totalAssetsHint: 'Cash, receivables & company resources',
  totalLiabilities: 'Liabilities',
  totalLiabilitiesHint: 'Payables & current obligations',
  totalEquity: 'Equity',
  totalEquityHint: 'Net capital & retained earnings',
  netWorkingCapital: 'Net Working Capital',
  equityShare: 'Equity Ratio',
  collectionEfficiency: 'Collection Rate',

  // 3D Spatial Canvas
  spatialEngineBadge: '3D BALANCE SHEET CORE',
  spatialDragHint: 'Drag to orbit 3D perspective',
  viewOrbit: '3D Orbit',
  viewRadar: 'Top Radar',
  viewIsometric: 'Isometric',
  nodeAssets: 'Assets',
  nodeLiabilities: 'Liabilities',
  nodeEquity: 'Equity',
  nodeCash: 'Cash Liquidity',

  // Workspace filter tabs
  filterAll: 'Executive Overview',
  filterLiquidity: 'Liquidity & Balance Sheet',
  filterReceivables: 'Sales & Receivables',
  filterOperations: 'Ledger & Operations',

  // Section titles
  sectionPulseTitle: 'Core Financial Health Indicators',
  sectionPulseSubtitle:
    'Summary of cash liquidity, active receivables, and current month revenue performance',
  sectionAnalyticsTitle: 'Billing Cashflow & Receivable Quality',
  sectionAnalyticsSubtitle:
    'Invoiced amounts vs. collected cash alongside receivable aging distribution',
  sectionBalanceTitle: 'Cash Liquidity & Balance Sheet Anatomy',
  sectionBalanceSubtitle:
    'Operational bank account distribution and asset, liability, and equity proportions',
  sectionOperationsTitle: 'Operational Activity & System Controls',
  sectionOperationsSubtitle:
    'Monitor recent invoices, general ledger audit trails, and daily transaction shortcuts',

  // KPI Tiles
  kpiCashLabel: 'Cash & Bank Balance',
  kpiCashHint: '{{count}} active cash & bank accounts',
  kpiCashDesc: 'Liquid funds ready for daily operations',
  kpiReceivableLabel: 'Open Receivables',
  kpiReceivableHint: '{{count}} unpaid invoices',
  kpiReceivableDesc: 'Active customer billings awaiting payment',
  kpiOverdueLabel: 'Overdue Receivables',
  kpiOverdueHintActive: '{{count}} overdue invoices',
  kpiOverdueHintClear: 'Zero overdue invoices',
  kpiOverdueDesc: 'Invoices past their payment due date',
  kpiRevenueLabel: 'Current Month Sales',
  kpiRevenueHint: '{{count}} issued · {{draft}} drafts',
  kpiRevenueDesc: 'Net sales (excluding VAT) of invoices issued this month',

  // Alerts
  alertTitleOverdue: 'Attention: {{count}} Overdue Invoices Awaiting Payment',
  alertTitlePending: 'Operational Tasks Awaiting Action',
  alertOverdueAmount: '{{amount}} overdue',
  alertDraftCount: '{{count}} invoices in draft status',
  alertPendingCount: '{{count}} changes awaiting approval',
  alertBtnOverdue: 'Follow Up Receivables',
  alertBtnDraft: 'Review Drafts',
  alertBtnPending: 'Review Approvals',
  healthyBannerTitle: 'Books & Operations Healthy',
  healthyBannerDesc:
    'No overdue invoices or pending approval items require urgent action right now.',

  // Charts & Widgets
  trendTitle: '6-Month Billing & Cash Collection Trend',
  trendSubtitle: 'Comparison of issued invoice value vs. actual cash payments received',
  collectionBadge: '{{rate}}% Collected',
  legendInvoiced: 'Invoiced (Billed)',
  legendCollected: 'Collected (Cash In)',
  summary6mInvoiced: '6M Total Invoiced',
  summary6mCollected: '6M Cash Collected',
  summary6mUncollected: 'Uncollected Balance',
  noTrendData: 'No published invoices in the last 6 months.',

  agingTitle: 'Receivable Aging Analysis',
  agingSubtitle: 'Remaining receivable balances grouped by days past due',
  agingTotalLabel: 'Total Open Receivables',
  agingBucketCurrent: 'Current (Not due)',
  agingBucket1_30: '1–30 days overdue',
  agingBucket31_60: '31–60 days overdue',
  agingBucket60Plus: '> 60 days overdue',
  invoiceUnit: 'invoices',

  bankTitle: 'Cash & Bank Account Distribution',
  bankSubtitle: 'Actual balance across each operational cash and bank account',
  btnManageCash: 'Manage Cash & Bank',
  bankShareOfTotal: '{{pct}}% of total cash',
  bankEmpty: 'No cash or bank accounts registered yet.',

  compositionTitle: 'Balance Sheet Structure & Anatomy',
  compositionSubtitleWithDate: 'Balance sheet position as of {{date}}',
  compositionSubtitleDefault: 'Proportion of current assets, fixed assets, liabilities, and equity',
  btnViewBalanceSheet: 'Open Balance Sheet',
  sliceCurrentAssets: 'Current Assets',
  sliceNonCurrentAssets: 'Non-Current Assets',
  sliceLiabilities: 'Liabilities',
  sliceEquity: 'Equity',
  insightWorkingCapitalDesc: 'Current Assets minus Liabilities (net short-term liquidity buffer)',

  // Tabbed Receivables / Invoices card
  tabTopDebtors: 'Collection Priority',
  tabRecentInvoices: 'Recent Invoices',
  debtorsTitle: 'Top Customer Receivables',
  debtorsSubtitle: '{{count}} invoices recorded in system',
  btnViewAllSales: 'View All Sales',
  debtorsEmpty: 'No open customer receivables.',
  dueDateLabel: 'Due:',
  overdueBadge: 'Overdue',
  invoicesEmpty: 'No sales invoices recorded yet.',

  // Activity Feed
  activityTitle: 'General Ledger Audit Trail',
  activitySubtitle: 'Recent journal entry creations and modifications',
  activityEmpty: 'No journal activity recorded yet.',
  actionCreate: 'created journal',
  actionUpdate: 'updated journal',
  actionDelete: 'deleted journal',

  // Control Center & Quick Actions
  controlTitle: 'Control Center & Quick Actions',
  controlSubtitle: 'System queue status and instant daily transaction launchers',
  ctrlPendingChanges: 'Pending Approvals',
  ctrlDraftInvoices: 'Draft Invoices',
  ctrlTotalContacts: 'Total Contacts & Partners',
  ctrlActivePeriod: 'Active Period',
  quickActionsLabel: 'Instant Transactions',
  qaGeneralJournal: 'General Journal',
  qaReceiveMoney: 'Receive Money',
  qaSendMoney: 'Send Money',
  qaTransferCash: 'Transfer Cash',

  userFallback: 'Finance',
  bankAccountFallback: 'Cash & Bank',
  periodOpenValue: 'OPEN',
  generalCustomer: 'General Customer',
};

export default dashboard;
