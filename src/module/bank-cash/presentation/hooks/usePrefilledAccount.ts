import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resolvePrefill } from '@/module/bank-cash/domain/accountPrefill';

/**
 * The account a form starts with, from `?<param>=`. It is applied once, after the offered list has
 * loaded, so a slow load never shows a refusal; an account the list does not offer is refused.
 */
export const usePrefilledAccount = (
  param: 'fromAccountId' | 'toAccountId',
  selectable: { id: string }[],
  ready: boolean
) => {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const applied = useRef(false);

  useEffect(() => {
    if (!ready || applied.current) return;
    applied.current = true;
    const resolved = resolvePrefill(searchParams.get(param) || '', selectable);
    setValue(resolved.accountId);
    setBlocked(resolved.blocked);
  }, [ready, selectable, searchParams, param]);

  return { value, setValue, blocked };
};
