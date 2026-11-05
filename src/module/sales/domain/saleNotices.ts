export interface SendNotice {
  level: 'success' | 'warning';
  /** Key under `sales.notify`. */
  key: 'sent' | 'resent' | 'emailNotSent';
}

interface SendOutcome {
  emailRequested: boolean;
  emailSent: boolean;
  /** The invoice was already issued; only the email was sent again. */
  resend: boolean;
}

/**
 * What to tell the user after issuing an invoice or resending its email. Issuing always says so,
 * and a failed email is an extra warning (the invoice is saved either way). A failed resend has
 * nothing to confirm, so it only warns.
 */
export const sendNotices = ({ emailRequested, emailSent, resend }: SendOutcome): SendNotice[] => {
  const emailFailed = emailRequested && !emailSent;
  if (resend) {
    return emailFailed
      ? [{ level: 'warning', key: 'emailNotSent' }]
      : [{ level: 'success', key: 'resent' }];
  }
  const notices: SendNotice[] = [{ level: 'success', key: 'sent' }];
  if (emailFailed) notices.push({ level: 'warning', key: 'emailNotSent' });
  return notices;
};
