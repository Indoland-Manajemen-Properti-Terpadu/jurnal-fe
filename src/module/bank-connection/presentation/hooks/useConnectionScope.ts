import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthentications';
import { readTokenSubject } from '@/module/bank-connection/domain/tokenSubject';

/** Id of the signed-in user; it keys every bank connection query so a cache is never shown to another user. */
export const useConnectionScope = (): string => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMemo(() => readTokenSubject(accessToken), [accessToken]);
};
