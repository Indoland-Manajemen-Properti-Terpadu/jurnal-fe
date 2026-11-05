import type { AccountFormValues } from './buildAccountPayload';

type MemberRef = string | { id?: string; _id?: string };

interface RawAccountDetail {
  name?: string;
  accountNumber?: string;
  category?: { id?: string };
  categoryId?: string;
  /** The detail endpoint sends the tax as `{ id, name, rate, taxCode }`. */
  defaultTax?: { id?: string } | string | null;
  isBankAndCash?: boolean;
  isContra?: boolean;
  isLocked?: boolean;
  desc?: string;
  /** `master` for a top level account, `sub` for a child. */
  level?: string;
  /** Children of this account. */
  subAccount?: { id?: string }[];
  /** Parent of a Sub account; `null` for a top level account. */
  headerAccount?: { id?: string; name?: string; accountNumber?: string } | null;
  headAccountId?: string;
  subAccountId?: string;
  isAllUser?: boolean;
  allowedUsers?: MemberRef[];
  allowedRoles?: MemberRef[];
}

export interface AccountFormState {
  values: AccountFormValues;
  accountType: string;
  parentId?: string;
  childId?: string;
  accessScope?: string;
  specialUsers?: string[];
  certainRoles?: string[];
}

/** The detail endpoint answers either the account or `{ data: account }`. */
export const unwrapAccountDetail = (detail: unknown): RawAccountDetail | undefined => {
  if (!detail) return undefined;
  const inner = (detail as { data?: RawAccountDetail }).data;
  return inner || (detail as RawAccountDetail);
};

const defaultTaxId = (tax: RawAccountDetail['defaultTax']): string =>
  (typeof tax === 'string' ? tax : tax?.id) || '';

const memberId = (member: MemberRef): string | undefined =>
  typeof member === 'string' ? member : member.id || member._id;

/** Form state for editing an existing account. Unset fields leave the current state untouched. */
export const mapAccountDetailToFormState = (data: RawAccountDetail): AccountFormState => {
  const state: AccountFormState = {
    values: {
      name: data.name || '',
      accountNumber: data.accountNumber || '',
      category: data.category?.id || data.categoryId || '',
      defaultTax: defaultTaxId(data.defaultTax),
      isBankAndCash: Boolean(data.isBankAndCash),
      isContra: Boolean(data.isContra),
      desc: data.desc || '',
    },
    accountType: 'SingleAccount',
  };

  const parentId = data.headerAccount?.id || data.headAccountId;
  if (parentId || data.level === 'sub') {
    state.accountType = 'SubAccount';
    state.parentId = parentId;
  } else if (data.subAccountId || (data.subAccount?.length ?? 0) > 0) {
    state.accountType = 'HeaderAccount';
    // Existing children are already linked, so none is preselected to link again.
    state.childId = data.subAccountId;
  }

  if (data.isAllUser) {
    state.accessScope = 'AllUsers';
  } else if (data.allowedUsers && data.allowedUsers.length > 0) {
    state.accessScope = 'SpecialUsers';
    state.specialUsers = data.allowedUsers.map(memberId) as string[];
  } else if (data.allowedRoles && data.allowedRoles.length > 0) {
    state.accessScope = 'CertainRoles';
    state.certainRoles = data.allowedRoles.map(memberId) as string[];
  }

  return state;
};
