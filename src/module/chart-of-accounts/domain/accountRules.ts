import { getCategoryPrefix } from '@/lib/accounting/accountTypes';
import { isDebitNormal } from '@/lib/accounting/normalBalance';
import type { CategoryAccountModel } from './categoryAccount';

export { getCategoryPrefix };

export type AccountType = 'SingleAccount' | 'SubAccount' | 'HeaderAccount';
export type AccessScope = 'AllUsers' | 'SpecialUsers' | 'CertainRoles';

/** I6: a new account name needs at least this many characters (edit only requires one). */
export const MIN_CREATE_NAME_LENGTH = 3;

/** Validators return an i18n key of the `chartOfAccounts` namespace, or null when the value is valid. */
export type ValidationKey =
  | 'validation.nameMin'
  | 'validation.nameRequired'
  | 'validation.codeRequired'
  | 'validation.codePrefix'
  | 'validation.categoryRequired';

export const validateCreateName = (value: string): ValidationKey | null =>
  value.trim().length < MIN_CREATE_NAME_LENGTH ? 'validation.nameMin' : null;

export const validateEditName = (value: string): ValidationKey | null =>
  value.trim().length === 0 ? 'validation.nameRequired' : null;

export const validateAccountCode = (value: string): ValidationKey | null =>
  value.trim().length === 0 ? 'validation.codeRequired' : null;

/** The first digit of an account code is the class of its category (1 assets to 8 other expenses). */
export const codeMatchesCategory = (
  code: string,
  category?: Pick<CategoryAccountModel, 'categoryID' | 'name'>
): boolean => !category || !code.trim() || code.trim().startsWith(getCategoryPrefix(category));

export const validateAccountCodePrefix = (
  code: string,
  category?: Pick<CategoryAccountModel, 'categoryID' | 'name'>
): ValidationKey | null => (codeMatchesCategory(code, category) ? null : 'validation.codePrefix');

export const validateAccountCategory = (value: string): ValidationKey | null =>
  !value ? 'validation.categoryRequired' : null;

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

/** A Header account is always visible to all users; Single and Sub accounts choose their access. */
export const accountHasAccessChoice = (accountType: string): boolean =>
  accountType !== 'HeaderAccount';

/** I6: a Sub account needs its head account; an account with a restricted scope needs members. */
export const isHierarchyAndAccessValid = ({
  accountType,
  headAccountId,
  accessScope,
  specialUsersCount,
  certainRolesCount,
}: HierarchyAccessInput): boolean => {
  if (accountType === 'SubAccount' && !headAccountId) return false;
  if (accountHasAccessChoice(accountType)) {
    if (accessScope === 'SpecialUsers' && specialUsersCount === 0) return false;
    if (accessScope === 'CertainRoles' && certainRolesCount === 0) return false;
  }
  return true;
};

/** I7: locked accounts cannot be selected for bulk actions. */
export const isAccountSelectable = (account: { isLocked?: boolean | string }): boolean =>
  !account.isLocked;

export type DeleteBlockReason = 'locked' | 'hasSubAccounts' | 'hasBalance';

/**
 * I7: why an account cannot be deleted, or null when it can. A locked account, an account with
 * sub accounts and an account carrying a balance are kept (archive them instead): the backend
 * deletes them without a word, together with their sub accounts.
 */
export const deleteBlockReason = (account: {
  isLocked?: boolean | string;
  subAccount?: unknown[];
  amount?: number;
}): DeleteBlockReason | null => {
  if (account.isLocked) return 'locked';
  if ((account.subAccount?.length ?? 0) > 0) return 'hasSubAccounts';
  if (Math.abs(Number(account.amount) || 0) >= 0.005) return 'hasBalance';
  return null;
};

export const canDeleteAccount = (account: Parameters<typeof deleteBlockReason>[0]): boolean =>
  deleteBlockReason(account) === null;

/** I7: locked accounts cannot be archived. */
export const canArchiveAccount = (account: { isLocked?: boolean | string }): boolean =>
  !account.isLocked;

/** I7: a locked account cannot be edited at all. */
export const canEditAccount = (account: { isLocked?: boolean | string }): boolean =>
  !account.isLocked;
