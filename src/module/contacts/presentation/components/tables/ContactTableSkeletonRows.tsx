import { Box, Group, Skeleton, Table } from '@mantine/core';

export function ContactTableSkeletonRows({ count }: Readonly<{ count: number }>) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${idx}`}>
          <Table.Td>
            <Group gap="sm">
              <Skeleton circle height={38} />
              <Box style={{ flex: 1 }}>
                <Skeleton height={14} width="60%" mb={4} />
                <Skeleton height={10} width="40%" />
              </Box>
            </Group>
          </Table.Td>
          <Table.Td>
            <Skeleton height={18} width={80} radius="xl" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width="70%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width="60%" mb={4} />
            <Skeleton height={10} width="45%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width="50%" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={24} width={60} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}
