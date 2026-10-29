import type { AccountFormValues } from './buildAccountPayload';

type MemberRef = string | { id?: string; _id?: string };

interface RawAccountDetail {
  name?: string;
  accountNumber?: string;
  category?: { id?: string };
  categoryId?: string;
  taxType?: string;
  isBankAndCash?: boolean;
  isContra?: boolean;
  isLocked?: boolean;
  desc?: string;
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

const memberId = (member: MemberRef): string | undefined =>
  typeof member === 'string' ? member : member.id || member._id;

/** Form state for editing an existing account. Unset fields leave the current state untouched. */
export const mapAccountDetailToFormState = (data: RawAccountDetail): AccountFormState => {
  const state: AccountFormState = {
    values: {
      name: data.name || '',
      accountNumber: data.accountNumber || '',
      category: data.category?.id || data.categoryId || '',
      taxType: data.taxType || '',
      isBankAndCash: Boolean(data.isBankAndCash),
      isContra: Boolean(data.isContra),
      desc: data.desc || '',
    },
    accountType: 'SingleAccount',
  };

  if (data.headAccountId) {
    state.accountType = 'SubAccount';
    state.parentId = data.headAccountId;
  } else if (data.subAccountId) {
    state.accountType = 'HeaderAccount';
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
