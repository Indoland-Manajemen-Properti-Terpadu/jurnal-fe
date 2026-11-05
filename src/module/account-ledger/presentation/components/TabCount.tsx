import { Text } from '@mantine/core';

/** The count next to a tab label, in parentheses; it inherits the tab colour, so it is white on the active pill. */
export const TabCount: React.FC<{ value: number }> = ({ value }) =>
  value > 0 ? (
    <Text span fz="var(--jurnal-text-xs)" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
      ({value})
    </Text>
  ) : null;
