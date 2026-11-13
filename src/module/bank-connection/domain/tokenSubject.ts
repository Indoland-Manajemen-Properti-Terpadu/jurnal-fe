/**
 * The signed-in user's id, the `sub` claim of the access token the shared client already sends. It
 * only keys the cache so one user never sees another's bank data; the backend enforces every right.
 */
export const readTokenSubject = (token: string | null): string => {
  const payload = token?.split('.')[1];
  if (!payload) return 'anonymous';
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const { sub } = JSON.parse(atob(padded)) as { sub?: unknown };
    return typeof sub === 'string' && sub !== '' ? sub : 'anonymous';
  } catch {
    return 'anonymous';
  }
};
