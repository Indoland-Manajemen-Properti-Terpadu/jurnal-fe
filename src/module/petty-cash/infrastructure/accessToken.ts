import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

const unauthorized = () => new PettyCashError({ kind: 'unauthorized' });

/**
 * The signed-in user's id is the `sub` claim of the access token the shared client already sends.
 * `GET /v1/users/get-id` is not an option: it answers 403 for a user without user-management
 * rights, which is exactly who petty cash needs to restrict. The token is only read here, never
 * trusted for authorization: the backend still enforces every right.
 */
export const readUserIdFromToken = (token: string | null): string => {
  const payload = token?.split('.')[1];
  if (!payload) throw unauthorized();

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const { sub } = JSON.parse(atob(padded)) as { sub?: unknown };
    if (typeof sub === 'string' && sub !== '') return sub;
  } catch {
    // a malformed token is handled like a missing one
  }
  throw unauthorized();
};
