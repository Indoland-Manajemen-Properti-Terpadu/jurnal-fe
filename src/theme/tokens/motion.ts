/** Transition durations. `fast` covers hover and focus feedback. */
export const durations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
} as const;

export const easings = {
  /** The CSS default; what existing hover transitions use. */
  standard: 'ease',
  /** Elements entering the screen: fast start, gentle stop. */
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Elements leaving the screen. */
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;
