export const salesCommon = {
  common: {
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
  },
  status: {
    draft: 'Draft',
    unpaid: 'Unpaid',
    paid: 'Paid',
    overdue: 'Overdue',
    void: 'Void',
    partial: 'Partial',
    sent: 'Sent',
  },
  reason: {
    label: 'Reason',
    placeholder: 'Write a short reason (at least 3 characters)',
  },
  errors: {
    rejected: 'The request could not be completed. Check the invoice details and try again.',
    forbidden: 'You do not have permission to do this.',
    validation: 'Some details are not valid. Check the fields and try again.',
    unauthorized: 'Your session has ended. Please sign in again.',
    notFound: 'This invoice was not found or has been deleted.',
    network: 'The connection was lost. Check your network and try again.',
    generic: 'Something went wrong. Please try again shortly.',
  },
  tags: {
    empty: 'No tag matches',
    addPlaceholder: 'Add new tag',
    add: 'Add tag',
  },
  notify: {
    tagCreated: 'New tag added.',
    failedTitle: 'That did not go through',
    draftSaved: 'Draft invoice {number} saved.',
    sent: 'Invoice {number} issued and recorded as accounts receivable.',
    resent: 'The email for invoice {number} was sent again.',
    emailNotSent:
      'The invoice is saved, but the email was not delivered. Make sure the customer has an email address, then resend.',
    updated: 'Changes to invoice {number} saved.',
    deleted: 'Draft invoice deleted.',
    voided: 'Invoice {number} voided.',
    paid: 'Payment recorded and deposited to cash or bank.',
    paidWithOverpayment:
      'Payment recorded. The excess was booked to the customer overpayment account.',
    linkCopied: 'Invoice link copied.',
    linkFailed: 'The invoice link could not be created.',
    downloadFailed: 'The PDF could not be downloaded.',
  },
};
