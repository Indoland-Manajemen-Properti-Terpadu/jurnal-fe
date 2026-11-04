import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';
import classes from './SummaryBar.module.css';

export type SummaryTone = 'success' | 'warning' | 'danger' | 'muted';

export interface SummaryItem {
  key: string;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Only a status figure has a tone; it adds a small dot before the value. */
  tone?: SummaryTone;
}

interface SummaryBarProps {
  items: SummaryItem[];
  /** Cells per row on a wide screen; they stack on a narrow one. */
  columns?: 3 | 4;
}

/**
 * The figures that describe one thing, as one surface with hairline dividers instead of
 * separate cards. Colour is only for a status dot; the numbers stay one neutral colour.
 */
export const SummaryBar: React.FC<SummaryBarProps> = ({ items, columns = 4 }) => (
  <div className={classes.bar} data-columns={columns}>
    {items.map((item) => (
      <div key={item.key} className={classes.cell}>
        <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
          {item.label}
        </Text>
        <Group gap={8} wrap="nowrap" mt={4}>
          {item.tone && <span className={classes.dot} data-tone={item.tone} />}
          <Text className={classes.value} fz="var(--jurnal-text-xl)" fw={700} c="dark.8" lh={1.2}>
            {item.value}
          </Text>
        </Group>
        {item.hint && (
          <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={4}>
            {item.hint}
          </Text>
        )}
      </div>
    ))}
  </div>
);
