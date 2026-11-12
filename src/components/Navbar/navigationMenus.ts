/** Menu ids of the server catalog that the sidebar depends on. */
export const NAV_MENU = {
  ledger: ['JP-GL'],
  /** Period locks and closing the books ("Tutup Buku & Lock Period"). */
  periodClosing: ['JP-GL-PC'],
  sales: ['JP-SALES'],
  products: ['JP-PRDCT'],
  contacts: ['JP-CNTCT'],
  approvals: ['JP-SETT-AS'],
  pettyCash: [
    'JP-PC',
    'JP-PC-VCH',
    'JP-PC-CNT',
    'JP-PC-RMB',
    'JP-PC-ADV',
    'JP-PC-CST',
    'JP-PC-APR',
    'JP-PC-DSB',
    'JP-PC-APR-BM',
    'JP-PC-APR-CF',
    'JP-PC-CTL',
  ],
  purchases: [
    'JP-PURCH',
    'JP-PURCH-PAY',
    'JP-PURCH-APR-PR',
    'JP-PURCH-APR-PO',
    'JP-PURCH-APR-PAY',
    'JP-PURCH-RPT',
  ],
  payables: ['JP-PURCH-RPT', 'JP-PURCH'],
  settings: ['JP-SETT'],
  /** Users and roles screens; either menu opens the user list because it needs the roles too. */
  users: ['JP-SETT-UM', 'JP-SETT-CT'],
  userAccess: ['JP-SETT-UM'],
  roleAccess: ['JP-SETT-CT'],
  approvalFlow: ['JP-SETT-AF'],
  sites: ['JP-SETT-SITE'],
} as const;
