import type { ReactNode } from 'react';
import { Text } from '@mantine/core';
import classes from '@/module/purchases/presentation/components/shared/InfoGrid.module.css';

export interface InfoItem {
  label: string;
  value: ReactNode;
  /** A dimmed line under the value. */
  sub?: ReactNode;
  /** 2 spans the full width of the grid. */
  span?: 1 | 2;
}

/**
 * Facts as bordered cells, two columns from tablet width, as in the reference web: a small label
 * over a bold value. Put it in a `flush` card so the lines run to the edges.
 */
export const InfoGrid = ({ items }: Readonly<{ items: InfoItem[] }>) => (
  <div className={classes.grid}>
    {items.map(({ label, value, sub, span }) => (
      <div key={label} className={classes.cell} data-span={span === 2 ? 'full' : undefined}>
        <Text fz="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text fz="md" fw={700} component="div" lh={1.35}>
          {value === null || value === undefined || value === '' ? '-' : value}
        </Text>
        {sub && (
          <Text fz="xs" c="dimmed" component="div">
            {sub}
          </Text>
        )}
      </div>
    ))}
  </div>
);
