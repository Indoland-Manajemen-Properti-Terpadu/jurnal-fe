export interface AddAccountPayload {
  name?: string;
  accountNumber?: string;
  category?: string;
  isBankAndCash?: boolean;
  taxType: string;
  isAllUser?: boolean;
  allowedUsers?: string[];
  allowedRoles?: string[];
}
