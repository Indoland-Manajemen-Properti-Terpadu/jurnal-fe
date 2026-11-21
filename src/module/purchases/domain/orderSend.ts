import type { SendOrderInput } from '@/module/purchases/domain/purchaseInputs';

export type SendMode = 'mark' | 'email';

export interface SendValues {
  mode: SendMode;
  to: string;
  cc: string[];
  note: string;
}

export type SendIssue = 'toInvalid' | 'toRequired' | 'ccInvalid';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * An email goes to the address typed here, or to the vendor's own address when none is typed. With
 * neither the service answers that the vendor has no email, so the dialog says so before sending.
 */
export const validateSend = (
  values: SendValues,
  vendorEmails: string[]
): { to?: SendIssue; cc?: SendIssue } => {
  if (values.mode !== 'email') return {};
  const errors: { to?: SendIssue; cc?: SendIssue } = {};
  const to = values.to.trim();
  if (to && !EMAIL.test(to)) errors.to = 'toInvalid';
  else if (!to && vendorEmails.length === 0) errors.to = 'toRequired';
  if (values.cc.some((address) => !EMAIL.test(address.trim()))) errors.cc = 'ccInvalid';
  return errors;
};

/** The body of the send call; a blank note and an empty copy list are left out. */
export const sendOrderInput = (values: SendValues): SendOrderInput => {
  const note = values.note.trim();
  if (values.mode === 'mark') return { sendEmail: false, ...(note ? { note } : {}) };
  const to = values.to.trim();
  const cc = values.cc.map((address) => address.trim());
  return {
    sendEmail: true,
    ...(to ? { to } : {}),
    ...(cc.length > 0 ? { cc } : {}),
    ...(note ? { note } : {}),
  };
};
