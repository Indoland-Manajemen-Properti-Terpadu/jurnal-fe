type UserAccessType = 'AllUsers' | 'SpecialUsers' | 'CertainRoles';
type AccountType = 'SingleAccount' | 'HeaderAccount' | 'SubAccount';

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  category: string;
  debit?: number;
  credit?: number;
  typeTax?: string;
  description?: string;
  userAccess?: UserAccessType;
  accountType?: AccountType;
}

interface AddAccountFormData {
  accountName: string;
  accountNumber: string;
  category: string;
}
