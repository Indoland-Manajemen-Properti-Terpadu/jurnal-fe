export const reconciliation = {
  empty: {
    title: 'Reconciliation Not Available Yet',
    description:
      'No bank statement has been imported. Import a bank statement first to start reconciling.',
    button: 'Import Bank Statement',
  },
  error: {
    title: 'The reconciliation data could not be loaded',
    description: 'Check your connection, then try again.',
    retry: 'Reload',
  },
  allMatched: {
    title: 'Every bank statement row is matched',
    description: 'No statement row is waiting. Import a new bank statement to continue.',
  },
  summary: {
    statements: 'Bank statement not matched',
    journals: 'Journal not matched',
    difference: 'Difference between the sides',
    rows: '{count} row(s)',
    differenceHint: 'What is left once every row is matched',
    differenceZero: 'Both sides are balanced',
  },
  list: {
    title: '{count} bank statement row(s) waiting',
    hint: 'Tick the suggestions that are right, then click Reconcile. Matched rows do not show up again.',
  },
  header: {
    bankStatement: 'Bank Statement',
  },
  direction: {
    received: 'Received',
    sent: 'Sent',
  },
  row: {
    select: 'Select row {description}',
    journalNumber: 'Journal Entry #{number}',
    suggestion: 'Suggested journal',
    sameDay: 'same day',
    daysApart: '{count} day(s) apart',
    noSuggestion: 'No suggested journal yet',
    noSuggestionHint: 'Find the journal first before ticking',
    blockedHint: 'Another ticked row already uses this journal',
    sharedWarning:
      'This journal is also suggested for another row. One journal can back one row only.',
    findOther: 'Find another journal',
    findAndMatch: 'Find & Match',
    dismiss: 'Dismiss this suggestion',
  },
  journals: {
    title: '{count} journal line(s) not on the bank statement',
    description:
      'Journal lines of this account with no bank statement row yet. Usually transactions the bank has not recorded.',
    columnDescription: 'Description',
    date: 'Date',
    debit: 'Debit (Rp)',
    credit: 'Credit (Rp)',
  },
  actions: {
    selected: '{count} row(s) selected',
    nothingSelected: 'No row selected',
    restore: 'Show {count} dismissed suggestion(s)',
    clear: 'Clear Selection',
    reconcile: 'Reconcile',
    reconcileCount: 'Reconcile ({count})',
    cancel: 'Cancel',
  },
  modal: {
    title: 'Match with Bank Statement',
    searchJournal: 'Search Journal Entries',
    searchPlaceholder: 'Search by description, account code or name...',
    allDates: 'All Dates',
    columns: {
      description: 'Description',
      date: 'Date',
      debit: 'Debit (Rp)',
      credit: 'Credit (Rp)',
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
    reason: {
      amountMismatch:
        'The journal amount does not equal the bank statement amount. Pick another journal or match manually.',
      alreadyReconciled:
        'This journal is already matched with another bank statement row. Reload the page and try again.',
      statementNotFound:
        'This bank statement row is already matched or deleted. Reload the page and try again.',
      serverError: 'Something went wrong while reconciling. Try again in a moment.',
      unknown: 'Reconciliation failed. Check your selection and try again.',
    },
  },
};
