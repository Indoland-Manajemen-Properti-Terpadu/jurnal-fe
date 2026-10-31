export interface IdempotencyState {
  key: string;
  fingerprint: string;
}

export const createIdempotencyKey = () => crypto.randomUUID();

/**
 * One key per user intent. A retry of the same body reuses the key, so the server replays the
 * first answer instead of posting twice; a changed body gets a new key, because reusing a key with
 * another body is refused (`422 IDEMPOTENCY_KEY_REUSED`).
 */
export const nextIdempotencyKey = (
  current: IdempotencyState | null,
  fingerprint: string,
  create: () => string = createIdempotencyKey
): IdempotencyState =>
  current && current.fingerprint === fingerprint ? current : { key: create(), fingerprint };
