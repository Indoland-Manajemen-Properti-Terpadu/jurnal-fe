export interface AddAccountPayload {
  name: string;
  accountNumber: string;
  category: string;
  isBankAndCash?: boolean;
  isContra?: boolean;
  desc?: string;
  taxType?: string;
  isAllUser: boolean;
  allowedUsers?: string[];
  allowedRoles?: string[];
  headAccountId?: string;
  subAccountId?: string;
}
