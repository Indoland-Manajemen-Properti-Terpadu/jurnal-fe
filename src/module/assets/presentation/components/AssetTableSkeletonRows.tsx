import { Box, Group, Skeleton, Table } from '@mantine/core';

const SKELETON_ROWS = 5;

export function AssetTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
        <Table.Tr key={`skel-asset-${idx}`}>
          <Table.Td>
            <Group gap="sm" wrap="nowrap">
              <Skeleton circle height={38} width={38} />
              <Box style={{ flex: 1 }}>
                <Skeleton height={14} width="70%" radius="sm" mb={6} />
                <Skeleton height={10} width="40%" radius="sm" />
              </Box>
            </Group>
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={90} radius="sm" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={16} width="80%" radius="sm" ml="auto" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={16} width="70%" radius="sm" ml="auto" />
          </Table.Td>
          <Table.Td>
            <Skeleton height={20} width={70} radius="sm" mx="auto" />
          </Table.Td>
          <Table.Td>
            <Skeleton circle height={28} width={28} mx="auto" />
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  );
}

export default AssetTableSkeletonRows;
