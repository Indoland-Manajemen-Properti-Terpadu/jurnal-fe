import { useMemo } from 'react';

interface AccountRef {
  id: string;
  accountNumber: string;
  name: string;
}

interface Source {
  usersData?: { results?: { id?: string; name?: string; email?: string }[] };
  rolesData?: { id?: string; name?: string }[];
  possibleHeadAccounts?: AccountRef[];
  possibleSubAccounts?: AccountRef[];
  /** Selected head (create) or parent (edit) account id. */
  parentId: string | null;
  /** Selected sub (create) or child (edit) account id. */
  childId: string | null;
}

const accountOption = (acc: AccountRef) => ({
  value: acc.id,
  label: `[${acc.accountNumber}] ${acc.name}`,
});

/** Dropdown options and live-preview labels shared by the add and edit account forms. */
export const useAccountFormOptions = ({
  usersData,
  rolesData,
  possibleHeadAccounts,
  possibleSubAccounts,
  parentId,
  childId,
}: Source) => {
  const userOptions = useMemo(
    () =>
      usersData?.results?.map((u) => ({
        value: u.id || '',
        label: u.email ? `${u.name || u.email} (${u.email})` : u.id || '',
      })) || [],
    [usersData]
  );

  const roleOptions = useMemo(
    () =>
      rolesData?.map((r) => ({
        value: r.id || '',
        label: r.name || 'Unnamed Role',
      })) || [],
    [rolesData]
  );

  const headAccountOptions = useMemo(
    () => possibleHeadAccounts?.map(accountOption) || [],
    [possibleHeadAccounts]
  );

  const subAccountOptions = useMemo(
    () => possibleSubAccounts?.map(accountOption) || [],
    [possibleSubAccounts]
  );

  const parentAccountLabel = useMemo(() => {
    if (!parentId) return undefined;
    return headAccountOptions.find((opt) => opt.value === parentId)?.label;
  }, [parentId, headAccountOptions]);

  const childAccountLabel = useMemo(() => {
    if (!childId) return undefined;
    return subAccountOptions.find((opt) => opt.value === childId)?.label;
  }, [childId, subAccountOptions]);

  return {
    userOptions,
    roleOptions,
    headAccountOptions,
    subAccountOptions,
    parentAccountLabel,
    childAccountLabel,
  };
};
