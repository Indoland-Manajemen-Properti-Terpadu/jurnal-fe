export const reconciliation = {
  loading: 'Loading data...',
  empty: {
    title: 'Reconciliation Not Available Yet',
    description:
      'No bank statement has been imported. Import a bank statement first to start reconciling.',
    button: 'Import Bank Statement',
  },
  header: {
    source: 'Data Source',
    bankStatement: 'Bank Statement',
    balance: 'Balance',
    bookkeeping: 'Bookkeeping',
    journal: 'Journal Entries',
  },
  direction: {
    received: 'Received',
    sent: 'Sent',
  },
  row: {
    matchedCount: 'Matched with {count} journal(s)',
    unmatched: 'Not matched yet',
    journalNumber: 'Journal Entry #{number}',
    matchedWith: 'Matched with {description}',
    findAndMatch: 'Find & Match',
    pickJournal: 'Choose journals to match',
  },
  actions: {
    reset: 'Reset',
    reconcile: 'Reconcile',
    reconcileCount: 'Reconcile ({count})',
    cancel: 'Cancel',
  },
  modal: {
    title: 'Match with Bank Statement',
    searchJournal: 'Search Journal Entries',
    searchPlaceholder: 'Search by account code or name...',
    allDates: 'All Dates',
    columns: {
      description: 'Description',
      date: 'Date',
      debit: 'Debit (in Rp)',
      credit: 'Credit (in Rp)',
    },
    total: 'Total Amount:',
    selected: 'Selected:',
    shortage: 'Shortfall:',
    excess: 'Excess:',
  },
  confirm: {
    title: 'Reconcile Bank Statement',
    message: 'Are you sure you want to reconcile this transaction?',
    helper: 'A reconciled transaction cannot be undone.',
  },
  notifications: {
    successTitle: 'Success',
    matched: 'Transaction reconciled successfully',
    failureTitle: 'Failed',
    matchFailed: 'Failed to reconcile',
  },
};
