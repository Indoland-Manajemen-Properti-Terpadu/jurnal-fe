/**
 * Shared input styles to guarantee 100% pixel-aligned side-by-side 2-column form inputs.
 */
export const SYMMETRIC_INPUT_STYLES = {
  label: {
    display: 'inline-block',
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1.4,
    marginBottom: 2,
    whiteSpace: 'nowrap' as const,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 1.35,
    minHeight: 16,
    marginBottom: 6,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  input: {
    height: 38,
    fontSize: 13.5,
    fontWeight: 500,
  },
};
