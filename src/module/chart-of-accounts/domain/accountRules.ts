import { getCategoryPrefix } from '@/lib/accounting/accountTypes';
import { isDebitNormal } from '@/lib/accounting/normalBalance';
import type { CategoryAccountModel } from './categoryAccount';

export { getCategoryPrefix };

export type AccountType = 'SingleAccount' | 'SubAccount' | 'HeaderAccount';
export type AccessScope = 'AllUsers' | 'SpecialUsers' | 'CertainRoles';

/** I6: a new account name needs at least this many characters (edit only requires one). */
export const MIN_CREATE_NAME_LENGTH = 3;

export const validateCreateName = (value: string): string | null =>
  value.trim().length < MIN_CREATE_NAME_LENGTH ? 'Nama akun minimal 3 karakter' : null;

export const validateEditName = (value: string): string | null =>
  value.trim().length === 0 ? 'Nama akun wajib diisi' : null;

export const validateAccountCode = (value: string): string | null =>
  value.trim().length === 0 ? 'Kode akun wajib diisi' : null;

export const validateAccountCategory = (value: string): string | null =>
  !value ? 'Kategori akun wajib dipilih' : null;

export const hasValidName = (name: string, minLength: number): boolean =>
  name.trim().length >= minLength;

export const hasAccountCode = (code: string): boolean => code.trim().length > 0;

/** I6: cash/bank flag follows the category: code `KB`, or a name containing "kas" or "bank". */
export const isCashBankCategory = (cat?: Pick<CategoryAccountModel, 'categoryID' | 'name'>) => {
  if (!cat) return false;
  const name = (cat.name || '').toLowerCase();
  return cat.categoryID === 'KB' || name.includes('kas') || name.includes('bank');
};

/** I5: effective normal side of an account: the category flag (debit when unset), flipped by contra. */
export const resolveEffectiveDebit = (categoryIsDebit: boolean | undefined, isContra: boolean) =>
  isDebitNormal({ isDebit: categoryIsDebit ?? true, isContra });

export interface HierarchyAccessInput {
  accountType: string;
  headAccountId: string | null;
  accessScope: string;
  specialUsersCount: number;
  certainRolesCount: number;
}

/** I6: a Sub account needs its head account; a single account with a restricted scope needs members. */
export const isHierarchyAndAccessValid = ({
  accountType,
  headAccountId,
  accessScope,
  specialUsersCount,
  certainRolesCount,
}: HierarchyAccessInput): boolean => {
  if (accountType === 'SubAccount' && !headAccountId) return false;
  if (accountType === 'SingleAccount') {
    if (accessScope === 'SpecialUsers' && specialUsersCount === 0) return false;
    if (accessScope === 'CertainRoles' && certainRolesCount === 0) return false;
  }
  return true;
};

/** I7: locked accounts cannot be selected for bulk actions. */
export const isAccountSelectable = (account: { isLocked?: boolean | string }): boolean =>
  !account.isLocked;

/** I7: locked accounts cannot be deleted. */
export const canDeleteAccount = (account: { isLocked?: boolean | string }): boolean =>
  !account.isLocked;

/** I7: locked accounts cannot be archived. */
export const canArchiveAccount = (account: { isLocked?: boolean | string }): boolean =>
  !account.isLocked;

/** I7: the category (and the hierarchy) of a locked account cannot be changed. */
export const canChangeCategory = (isLocked: boolean): boolean => !isLocked;
