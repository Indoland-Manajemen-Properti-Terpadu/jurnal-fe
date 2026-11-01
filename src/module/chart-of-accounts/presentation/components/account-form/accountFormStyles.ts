/**
 * Shared input styles to guarantee 100% pixel-aligned side-by-side 2-column form inputs.
 */
export const SYMMETRIC_INPUT_STYLES = {
  label: {
    display: 'inline-block',
    fontWeight: 600,
    fontSize: 'var(--jurnal-text-sm)',
    lineHeight: 1.4,
    marginBottom: 2,
    whiteSpace: 'nowrap' as const,
  },
  description: {
    fontSize: 'var(--jurnal-text-xs)',
    lineHeight: 1.35,
    minHeight: 16,
    marginBottom: 6,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  input: {
    height: 38,
    fontSize: 'var(--jurnal-text-sm)',
    fontWeight: 500,
  },
};
