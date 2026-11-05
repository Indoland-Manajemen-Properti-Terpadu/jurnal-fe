export interface AddAccountPayload {
  name: string;
  accountNumber: string;
  category: string;
  isBankAndCash?: boolean;
  isContra?: boolean;
  desc?: string;
  /** Tax id; `null` clears it on update. */
  defaultTax?: string | null;
  isAllUser: boolean;
  allowedUsers?: string[];
  allowedRoles?: string[];
  headAccountId?: string;
  subAccountId?: string;
}
