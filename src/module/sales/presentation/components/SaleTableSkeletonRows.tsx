import { Skeleton, Table } from '@mantine/core';

export function SaleTableSkeletonRows({ count }: Readonly<{ count: number }>) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`sale-skeleton-${idx}`}>
          <Table.Td>
            <Skeleton height={16} width={130} mb={4} />
            <Skeleton height={11} width={80} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={16} width={140} mb={4} />
            <Skeleton height={11} width={110} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width={90} />
          </Table.Td>
          <Table.Td>
            <Skeleton height={14} width={90} />
          </Table.Td>
          <Table.Td ta="right">
            <Skeleton height={16} width={100} ml="auto" />
          </Table.Td>
          <Table.Td ta="right">
            <Skeleton height={16} width={100} ml="auto" />
          </Table.Td>
          <Table.Td ta="center">
            <Skeleton height={20} width={80} mx="auto" radius="sm" />
          </Table.Td>
          <Table.Td ta="center">
            <Skeleton height={28} width={28} mx="auto" radius="md" />
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}
