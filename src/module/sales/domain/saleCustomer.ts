import type { Sale } from './sale';

/** What the invoice form needs to know about the customer it bills. */
export type CustomerSummary = {
  id: string;
  name: string;
  emails: string[];
  billingAddress: string;
};

type ContactDetails = { emails: string[]; billingAddress: string };

/**
 * The invoice detail response carries the customer's name only. Fills the email and the billing
 * address from the contact, and never replaces what the invoice already has.
 */
export const withContactDetails = (sale: Sale, contact: ContactDetails): Sale => {
  if (!sale.customer) return sale;
  const emails = sale.customer.emails?.some(Boolean) ? sale.customer.emails : contact.emails;
  const billingAddress = sale.customer.billingAddress || contact.billingAddress;
  return { ...sale, customer: { ...sale.customer, emails, billingAddress } };
};
