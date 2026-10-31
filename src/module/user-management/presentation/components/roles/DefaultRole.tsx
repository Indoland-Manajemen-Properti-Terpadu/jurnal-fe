import React from "react";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { ActionIcon, Loader, Pagination, Stack, Table, Text } from "@mantine/core";
import { themeColors } from "@/theme";
import { IconInfoCircle } from "@tabler/icons-react";
import { GetDefaultRole } from "@/module/user-management/infrastructure/Role.service";

const headTableStyle = {
  bg: themeColors.primary[0],
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
  borderCollapse: 'collapse' as const,
};


const headTableFont = {
  fontSize: 14,
  fontWeight: 500
}

const DefaultRoleTable: React.FC = () => {
  const { data: DefaultRole, isError } = GetDefaultRole();

  if (isError) {
    return <Loader c="red">Failed to load data.</Loader>;
  }
  if (!DefaultRole) {
    return <EmptyState />;
  }

  return (
    <Stack align='center'>
      <Table highlightOnHover style={{
        borderColor: themeColors.gray[3],
        borderWidth: '1px',
        borderStyle: 'solid',
        borderTop: 0
      }}>
        <Table.Thead >
          <Table.Tr >
            <Table.Th colSpan={10} ta='left' style={{ ...headTableFont, width: '40%' }} >Role Name</Table.Th>
            <Table.Th colSpan={2} ta='center' style={{ ...headTableFont, width: '5%' }} >Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {DefaultRole.map((role) => (
            <Table.Tr key={role.id} >
              <Table.Td fz={14} colSpan={10} style={{ width: '40%', textAlign: "left", fontWeight: 400 }}>
                {role.name}
              </Table.Td>
              <Table.Td fz={14} colSpan={2} style={{ width: '5%', textAlign: "center", fontWeight: 400 }}>
                <ActionIcon variant="light" color="gray" aria-label="Settings">
                  <IconInfoCircle size={16} stroke={1.5} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {/* <Pagination total={2} withEdges size='sm' color={themeColors.primary[6]} /> */}
    </Stack >
  );
};

export default DefaultRoleTable;
