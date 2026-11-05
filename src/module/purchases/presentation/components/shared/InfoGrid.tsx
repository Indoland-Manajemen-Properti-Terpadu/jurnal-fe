import type { ReactNode } from 'react';
import { SimpleGrid, Text } from '@mantine/core';

export interface InfoItem {
  label: string;
  value: ReactNode;
  /** 2 spans the full width of the grid. */
  span?: 1 | 2;
}

/** Facts as a small label over a value, two columns from tablet width. */
export const InfoGrid = ({ items }: Readonly<{ items: InfoItem[] }>) => (
  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
    {items.map(({ label, value, span }) => (
      <div key={label} style={span === 2 ? { gridColumn: '1 / -1' } : undefined}>
        <Text fz="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text fz="sm" fw={500} component="div">
          {value === null || value === undefined || value === '' ? '-' : value}
        </Text>
      </div>
    ))}
  </SimpleGrid>
);
