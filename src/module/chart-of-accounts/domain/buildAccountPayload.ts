import type { AddAccountPayload } from './addAccountPayload';

export interface AccountFormValues {
  name: string;
  accountNumber: string;
  category: string;
  /** Id of the default tax (`/v1/taxes`); empty when none. */
  defaultTax: string;
  isBankAndCash: boolean;
  isContra: boolean;
  desc: string;
}

export interface AccountPlacement {
  accountType: string;
  /** Head account (create) or parent account (edit) of a Sub account. */
  parentId: string | null;
  /** Sub account linked to a Header account. */
  childId: string | null;
  accessScope: string;
  specialUsers: string[];
  certainRoles: string[];
}

/** Same payload for create and update. A Header account is always visible to all users. */
export const buildAccountPayload = (
  values: AccountFormValues,
  placement: AccountPlacement,
  options: { includeBankCash?: boolean } = {}
): AddAccountPayload => {
  const payload: AddAccountPayload = {
    name: values.name.trim(),
    accountNumber: values.accountNumber.trim(),
    category: values.category,
    defaultTax: values.defaultTax || null,
    ...(options.includeBankCash === false ? {} : { isBankAndCash: values.isBankAndCash }),
    isContra: values.isContra,
    desc: values.desc.trim() || undefined,
    isAllUser: true,
  };

  if (placement.accountType === 'HeaderAccount') {
    if (placement.childId) payload.subAccountId = placement.childId;
  } else {
    if (placement.accountType === 'SubAccount' && placement.parentId) {
      payload.headAccountId = placement.parentId;
    }
    payload.isAllUser = placement.accessScope === 'AllUsers';
    if (!payload.isAllUser) {
      if (placement.accessScope === 'SpecialUsers') {
        payload.allowedUsers = placement.specialUsers;
      } else if (placement.accessScope === 'CertainRoles') {
        payload.allowedRoles = placement.certainRoles;
      }
    }
  }

  return payload;
};
