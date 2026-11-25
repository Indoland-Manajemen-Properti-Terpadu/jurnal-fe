/** Where a page was opened from, so its "back" link can lead there instead of to its own list. */
export interface BackState {
  backTo: string;
  backLabel: string;
}

export const backStateOf = (backTo: string, backLabel: string): BackState => ({
  backTo,
  backLabel,
});

/**
 * Reads the state a link carried. Only an address inside the app is accepted, so a state that was
 * built by hand cannot send the person to another site.
 */
export const readBackState = (state: unknown): BackState | null => {
  if (typeof state !== 'object' || state === null) return null;
  const { backTo, backLabel } = state as Record<string, unknown>;
  if (typeof backTo !== 'string' || typeof backLabel !== 'string') return null;
  if (!backTo.startsWith('/') || backTo.startsWith('//') || backLabel.trim() === '') return null;
  return { backTo, backLabel };
};
