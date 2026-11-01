import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  nextIdempotencyKey,
  type IdempotencyState,
} from '@/module/petty-cash/infrastructure/idempotency';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

/**
 * Keys of attempts whose outcome is still unknown. It lives outside the component so a form that
 * is closed and reopened after a dropped connection resends the same key and the server replays
 * the first answer instead of posting twice.
 */
const pending = new Map<string, { state: IdempotencyState; at: number }>();

/** A remembered key is dropped after this long, so an identical request hours later is a new one. */
export const KEY_TTL_MS = 10 * 60 * 1000;

const rememberedState = (actionKey: string): IdempotencyState | null => {
  const entry = pending.get(actionKey);
  if (!entry) return null;
  if (Date.now() - entry.at > KEY_TTL_MS) {
    pending.delete(actionKey);
    return null;
  }
  return entry.state;
};

/** Files are not serializable, so they enter the fingerprint by name, size and date. */
const fingerprintOf = (variables: unknown) =>
  JSON.stringify(variables ?? null, (_key, value: unknown) =>
    value instanceof File ? `${value.name}:${value.size}:${value.lastModified}` : value
  );

/** Forgets every remembered key; used by tests. */
export const resetIdempotencyKeys = () => pending.clear();

/**
 * A mutation that sends one `Idempotency-Key` per user intent (`actionKey` names the intent, for
 * example `voucher:create:<fundId>`).
 *
 * The backend remembers FAILED answers per key too: the same key with the same body replays the
 * failure, and the same key with a corrected body is refused (422 IDEMPOTENCY_KEY_REUSED). So a key
 * is kept only while the outcome is unknown (the connection dropped, no answer arrived); after any
 * answer, success or error, the next attempt gets a fresh key.
 */
export const useIdempotentMutation = <TData, TVariables>(
  actionKey: string,
  mutationFn: (variables: TVariables, idempotencyKey: string) => Promise<TData>,
  options: Omit<UseMutationOptions<TData, PettyCashError, TVariables>, 'mutationFn'> = {}
) =>
  useMutation<TData, PettyCashError, TVariables>({
    ...options,
    mutationFn: (variables) => {
      const state = nextIdempotencyKey(rememberedState(actionKey), fingerprintOf(variables));
      pending.set(actionKey, { state, at: Date.now() });
      return mutationFn(variables, state.key);
    },
    onSuccess: (...args) => {
      pending.delete(actionKey);
      return options.onSuccess?.(...args);
    },
    onError: (error, ...rest) => {
      if (error.kind !== 'network') pending.delete(actionKey);
      return options.onError?.(error, ...rest);
    },
  });
