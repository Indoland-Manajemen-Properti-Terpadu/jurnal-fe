import { Table, Text } from '@mantine/core';

/** A table heading in the small, dimmed, upper-case style every inventory table shares. */
export const columnHeader = (
  label: string,
  align?: 'right' | 'center',
  title?: string,
  key?: string
) => (
  <Table.Th key={key} ta={align} title={title} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);
