import { useEffect, useState } from 'react';

/** Hierarchy and access state shared by the add and edit account forms. */
export const useAccountPlacementState = () => {
  const [accountType, setAccountType] = useState<string>('SingleAccount');
  const [parentId, setParentId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [accessScope, setAccessScope] = useState<string>('AllUsers');
  const [specialUsers, setSpecialUsers] = useState<string[]>([]);
  const [certainRoles, setCertainRoles] = useState<string[]>([]);

  // Changing the account type drops the selection that no longer applies
  useEffect(() => {
    if (accountType === 'SingleAccount') {
      setParentId(null);
      setChildId(null);
    } else if (accountType === 'SubAccount') {
      setChildId(null);
    } else if (accountType === 'HeaderAccount') {
      setParentId(null);
    }
  }, [accountType]);

  return {
    accountType,
    setAccountType,
    parentId,
    setParentId,
    childId,
    setChildId,
    accessScope,
    setAccessScope,
    specialUsers,
    setSpecialUsers,
    certainRoles,
    setCertainRoles,
  };
};
