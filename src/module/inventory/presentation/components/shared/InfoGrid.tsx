import type { ReactNode } from 'react';
import { Text } from '@mantine/core';
import classes from '@/module/inventory/presentation/components/shared/InfoGrid.module.css';

export interface InfoItem {
  label: string;
  value: ReactNode;
  /** A dimmed line under the value. */
  sub?: ReactNode;
  /** Spans the whole row. */
  full?: boolean;
  /** The value is a placeholder ("Belum ditunjuk"), drawn dimmed. */
  muted?: boolean;
}

/**
 * Facts as bordered cells, a small label over a bold value, as in the reference web. Put it in a
 * `flush` card so the lines run to the edges.
 */
export const InfoGrid = ({
  items,
  columns = 2,
}: Readonly<{ items: InfoItem[]; columns?: 2 | 3 }>) => (
  <div className={classes.grid} data-columns={columns}>
    {items.map(({ label, value, sub, full, muted }) => (
      <div key={label} className={classes.cell} data-span={full ? 'full' : undefined}>
        <Text fz="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text
          fz="md"
          fw={muted ? 500 : 700}
          c={muted ? 'dimmed' : 'dark.9'}
          component="div"
          lh={1.35}
          mt={2}
        >
          {value === null || value === undefined || value === '' ? '-' : value}
        </Text>
        {sub && (
          <Text fz="xs" c="dimmed" component="div" mt={2}>
            {sub}
          </Text>
        )}
      </div>
    ))}
  </div>
);
