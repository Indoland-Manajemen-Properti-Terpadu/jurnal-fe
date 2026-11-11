/** What the invoice form needs to know about the customer it bills. */
export type CustomerSummary = {
  id: string;
  name: string;
  emails: string[];
  billingAddress: string;
};
