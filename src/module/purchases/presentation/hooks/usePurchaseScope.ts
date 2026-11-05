import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthentications';

/** Subject of the access token (the signed-in user); keys every purchasing query. */
const readSubject = (token: string | null | undefined): string => {
  if (!token) return 'anonymous';
  try {
    const payload = token.split('.')[1] ?? '';
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { sub } = JSON.parse(json) as { sub?: unknown };
    return typeof sub === 'string' && sub ? sub : 'anonymous';
  } catch {
    return 'anonymous';
  }
};

export const usePurchaseScope = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMemo(() => readSubject(accessToken), [accessToken]);
};
