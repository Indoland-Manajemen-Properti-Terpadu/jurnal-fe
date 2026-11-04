/** Balance pockets of a fund, merged into the `pettyCash` namespace. */
export const pocketNotify = {
  pocketAdded: 'Pocket {{name}} added.',
  pocketUpdated: 'Pocket {{name}} updated.',
  pocketTransferred: 'Funds moved between pockets.',
};

export const pocketErrorCodes = {
  INVALID_BANK_ACCOUNT:
    'This bank account cannot be used for this transaction. Choose another one.',
  REIMBURSEMENT_AMOUNT_CHANGED:
    'The replenishment amount changed since it was submitted. Check the latest preview and try again.',
  POCKET_NOT_FOUND: 'This pocket was not found in the fund.',
  POCKET_INACTIVE: 'This pocket is inactive and cannot be used for new transactions.',
  POCKET_BALANCES_REQUIRED: 'Enter the balance of every active non-cash pocket.',
};

export const pettyCashPockets = {
  pocketAdmin: {
    sectionTitle: 'Non-cash pockets (optional)',
    sectionHint:
      'If part of the petty cash is kept in a petty cash bank account or an e-wallet / card. All pockets still use the same petty cash account.',
    add: 'Add pocket',
    remove: 'Remove pocket',
    code: 'Code',
    codePlaceholder: 'e.g. BCA',
    type: 'Type',
    name: 'Name',
    namePlaceholder: 'e.g. BCA Petty Cash Account',
    provider: 'Bank / provider',
    accountNumber: 'Account / card number',
    accountHolder: 'Account holder',
    share: 'Share of the ceiling in this pocket',
    remainder: 'Rest of the ceiling as cash:',
    addTitle: 'Add a pocket',
    addBody:
      'A new pocket starts at Rp 0. Fill it by transfer, ceiling adjustment or replenishment.',
    addSubmit: 'Add pocket',
    editTitle: 'Edit pocket {{name}}',
    edit: 'Edit',
    save: 'Save',
    active: 'Pocket is active',
    activeHint:
      'An inactive pocket cannot be used for new transactions. A pocket can be switched off when its balance is Rp 0, and switched on again at any time.',
    cannotDeactivate:
      'This pocket still holds a balance, or it is the cash box. Move the funds out before switching it off.',
    cashAlwaysOn: 'The cash pocket is always active.',
    reason: 'Reason for the change',
    noChanges: 'Nothing has changed.',
    transfer: 'Move funds',
    transferTitle: 'Move funds between pockets',
    transferBody:
      'No journal is posted because all pockets share one petty cash account. Cash withdrawal fees are recorded as a normal voucher.',
    from: 'From pocket',
    to: 'To pocket',
    amount: 'Amount',
    date: 'Date',
    memo: 'Note (optional)',
    available: 'Available {{amount}}',
    transferSubmit: 'Move funds',
    paidFrom: 'Paid from pocket',
    paidFromHint: 'The pocket the money for this expense comes from.',
    insufficientHint:
      'This pocket does not hold enough. Move funds first or choose another pocket.',
    receivedIn: 'Funds received in pocket',
    receivedInHint: 'The pocket that receives the replenishment.',
    takenFrom: 'Funds taken from pocket',
    addedTo: 'Funds added to pocket',
    cashFrom: 'Cash taken from pocket',
    settleVia: 'Leftover or shortfall through pocket',
    settleViaHint: 'Default: the pocket the advance was paid out from.',
    refillTo: 'Petty cash is refilled into pocket',
    issue: {
      REQUIRED: 'Required.',
      INVALID_CODE: 'Use 2-20 letters, digits, - or _.',
      DUPLICATE_CODE: 'This code is already used.',
      NEGATIVE: 'Cannot be negative.',
      WHOLE_NUMBER: 'Must be a whole number.',
      TOO_LARGE: 'The number is too large.',
      POSITIVE_AMOUNT: 'Must be more than zero.',
      OVER_PAGU: 'The pocket shares add up to more than the ceiling.',
      SAME_POCKET: 'Choose a different pocket.',
      OVER_BALANCE: 'The amount is more than the source pocket holds.',
      FUTURE_DATE: 'The date cannot be in the future.',
    },
  },
};
