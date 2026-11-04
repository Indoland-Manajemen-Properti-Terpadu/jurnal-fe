import { Text } from '@mantine/core';

/** The number next to a tab label; it keeps the tab colour so it reads on the active pill too. */
export const TabCount: React.FC<{ value: number }> = ({ value }) =>
  value > 0 ? (
    <Text
      span
      fz="var(--jurnal-text-xs)"
      fw={600}
      style={{ opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </Text>
  ) : null;
