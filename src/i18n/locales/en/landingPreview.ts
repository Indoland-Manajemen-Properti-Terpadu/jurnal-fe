export const landingPreview = {
  preview: {
    kicker: 'Interactive Exploration',
    title: 'A High-Precision Accounting Experience at Your Fingertips',
    subtitle:
      'Click the tabs below to try the exclusive features of Jurnal ProApps, from the operational sync queue to a 0-4 digit decimal precision simulation.',
    company: 'PT Graha Mega Properti Utama',
    connectionStatus: '● System Connected in Real Time',
    tabs: {
      dashboard: 'Executive Dashboard',
      sync: 'Operational Sync Queue',
      smartJournal: 'Smart Journal & Opening Balance (0-4 Decimals)',
      bankReconciliation: '3-Way Bank Reconciliation',
    },

    dashboard: {
      cash: {
        label: 'Total Cash & Bank Balance',
        trend: '↑ +14.2% compared to last month',
      },
      revenue: {
        label: 'Rental & Utility Revenue',
        trend: '↑ 98.4% smooth collection rate',
      },
      profit: {
        label: 'Net Profit Year to Date',
        trend: '↑ Operating margin 35.5%',
      },
      ledgerTitle: 'Latest General Ledger Activity (Real-Time Double-Entry Log)',
      autoPosted: 'Auto-Posted by System',
      balancedAmount: 'Rp {amount} [Balanced]',
      entries: {
        rent: 'Unit Rent Payment Tower A-1204 (Tenant: PT Mitra Sukses)',
        penalty: 'Late Payment Penalty Income, Building B Utility Billing',
        vendor: 'Elevator & Escalator Maintenance Vendor Payment',
      },
    },

    sync: {
      title: 'Operational Inbound Approval Center (Pending Operational Sync)',
      subtitle:
        'All transaction events from tenant billing and the operational portal are screened here before they are posted to the general ledger.',
      approveAll: 'Approve & Bulk Post',
      syncedAll: '100% Synchronized',
      statusSynced: 'Synchronized',
      statusPending: 'Pending Approval',
      postedTitle: '3 Events Posted Successfully!',
      postedMessage:
        'Transactions are posted to the General Journal & General Ledger in balance, with no discrepancies.',
      resetTitle: 'Simulation Reset',
      resetMessage: 'The status is back to the pending queue mode.',
      columns: {
        eventType: 'EVENT TYPE',
        reference: 'REFERENCE & OPERATIONAL SOURCE',
        accountMapping: 'ACCOUNTING ACCOUNT MAPPING',
        amount: 'TRANSACTION AMOUNT',
        status: 'STATUS',
      },
      items: {
        salePayment: {
          title: 'Invoice #INV-2026-4410',
          subtitle: 'Tenant: PT Citra Mandiri Abadi (Unit B-08)',
          debit: 'Dr 1-1002 Bank BCA',
          credit: 'Cr 1-1201 Accounts Receivable',
        },
        penalty: {
          title: 'Penalty #PEN-2026-092',
          subtitle: 'Late Utility Payment Unit C-14',
          debit: 'Dr 1-1202 Penalty Receivable',
          credit: 'Cr 4-4200 Penalty Income',
        },
        deposit: {
          title: 'Security Deposit #DEP-2026-11',
          subtitle: '1-Year Lease Security Deposit',
          debit: 'Dr 1-1003 Bank Mandiri Escrow',
          credit: 'Cr 2-2300 Security Deposits Held',
        },
      },
    },

    smartJournal: {
      title: 'Foreign Currency & Material Purchase Journal (#JU-2026-095)',
      subtitle:
        'Includes Color Micro-Guidance, Mutual Exclusion Validation, and Decimal Precision Simulation',
      precisionLabel: 'Decimal Precision:',
      precision0: '0 Digits (IDR)',
      precision2: '2 Digits (Standard)',
      precision4: '4 Digits (Forex/Commodities)',
      colAccount: 'CHART OF ACCOUNTS (COA)',
      colDebit: 'DEBIT (RP)',
      colCredit: 'CREDIT (RP)',
      colIndicator: 'SYSTEM INDICATOR',
      totalLabel: 'JOURNAL BALANCE TOTAL',
      balanced: '100% Balanced',
      rows: {
        bank: {
          account: '1-1004 Bank CIMB Niaga Forex (USD)',
          note: 'Rate: Rp 16.240,5512 per USD',
          badge: 'Normal Debit ✓',
        },
        chemicals: {
          account: '1-1502 Chemicals & Unit Maintenance Expense',
          note: 'Unit price per liter calculated precisely',
          badge: 'Operating Expense ✓',
        },
        payable: {
          account: '2-2101 International Vendor Accounts Payable',
          note: 'Payment Terms 30 Days (Letter of Credit)',
          badge: 'Normal Credit ✓',
        },
      },
    },

    bankReconciliation: {
      bankBalanceLabel: 'BANK STATEMENT BALANCE',
      bankBalanceNote: '● Live Bank API Feed Connected',
      glBalanceLabel: 'GENERAL LEDGER (GL) BALANCE',
      glBalanceNote: '● Last Journal Posted Today',
      statusLabel: 'RECONCILIATION COMPLETENESS STATUS',
      statusValue: 'ZERO DIFFERENCE (Rp 0)',
      statusNote: '✓ 384 Transactions 100% Matched',
      algorithmTitle: 'Smart 3-Way Reconciliation Algorithm',
      algorithmDesc:
        'Automatically matches bank reference numbers, precise decimal amounts, and value dates without a spreadsheet.',
      printReport: 'Print Reconciliation Report (PDF)',
    },
  },
};

export default landingPreview;
