import { useRef } from 'react';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  nextIdempotencyKey,
  type IdempotencyState,
} from '@/module/petty-cash/infrastructure/idempotency';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';

/** Files are not serializable, so they enter the fingerprint by name, size and date. */
const fingerprintOf = (variables: unknown) =>
  JSON.stringify(variables ?? null, (_key, value: unknown) =>
    value instanceof File ? `${value.name}:${value.size}:${value.lastModified}` : value
  );

/**
 * A mutation that sends one `Idempotency-Key` per user intent: a retry after a failure reuses it
 * (the server replays instead of posting twice), a success clears it for the next intent.
 * Callers still disable the submit button while `isPending` to block double clicks.
 */
export const useIdempotentMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables, idempotencyKey: string) => Promise<TData>,
  options: Omit<UseMutationOptions<TData, PettyCashError, TVariables>, 'mutationFn'> = {}
) => {
  const keyRef = useRef<IdempotencyState | null>(null);

  return useMutation<TData, PettyCashError, TVariables>({
    ...options,
    mutationFn: (variables) => {
      keyRef.current = nextIdempotencyKey(keyRef.current, fingerprintOf(variables));
      return mutationFn(variables, keyRef.current.key);
    },
    onSuccess: (...args) => {
      keyRef.current = null;
      return options.onSuccess?.(...args);
    },
  });
};
