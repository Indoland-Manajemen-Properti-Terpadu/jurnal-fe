import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthentications';
import { readUserIdFromToken } from '@/module/petty-cash/infrastructure/accessToken';

/** Id of the signed-in user (token subject); it keys every petty cash query. */
export const usePettyCashScope = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMemo(() => {
    try {
      return readUserIdFromToken(accessToken);
    } catch {
      return 'anonymous';
    }
  }, [accessToken]);
};
