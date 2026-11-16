export interface SendNotice {
  level: 'success' | 'warning';
  /** Key under `sales.notify`. */
  key: 'sent' | 'resent' | 'emailNotSent' | 'emailNotSentReason';
  /** The server's own reason a failed email gave, for `emailNotSentReason`. */
  reason?: string;
}

interface SendOutcome {
  emailRequested: boolean;
  emailSent: boolean;
  /** Why the server could not send the email, when it said. */
  emailError?: string;
  /** The invoice was already issued; only the email was sent again. */
  resend: boolean;
}

/**
 * What to tell the user after issuing an invoice or resending its email. Issuing always says so,
 * and a failed email is an extra warning (the invoice is saved either way). A failed resend has
 * nothing to confirm, so it only warns.
 */
export const sendNotices = ({
  emailRequested,
  emailSent,
  emailError,
  resend,
}: SendOutcome): SendNotice[] => {
  const emailFailed = emailRequested && !emailSent;
  const reason = emailError?.trim();
  const failure: SendNotice = reason
    ? { level: 'warning', key: 'emailNotSentReason', reason }
    : { level: 'warning', key: 'emailNotSent' };
  if (resend) {
    return emailFailed ? [failure] : [{ level: 'success', key: 'resent' }];
  }
  const notices: SendNotice[] = [{ level: 'success', key: 'sent' }];
  if (emailFailed) notices.push(failure);
  return notices;
};
