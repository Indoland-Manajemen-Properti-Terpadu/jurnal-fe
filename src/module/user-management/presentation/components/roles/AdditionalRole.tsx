import React, { useState } from 'react';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { ActionIcon, Checkbox, Menu, rem, Stack, Table, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import { IconDots, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActiveBadge, InactiveBadge } from '@/components/Badge/Badge';
import { notifications } from '@mantine/notifications';
import { DeleteJournalEntryModal as DeleteTransactionModal } from '@/module/journal-entries';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';

const rowStyle = {
  borderColor: themeColors.gray[1],
  borderWidth: '1px',
  borderStyle: 'solid',
};

const headTableFont = {
  fontSize: 14,
  fontWeight: 500,
};

const AdditionalRoleTable: React.FC = () => {
  const { data: AdditionalRole, isError } = useRoles(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleDeleteTransaction = () => {
    notifications.show({
      color: themeColors.red[6],
      autoClose: 3000,
      title: 'Successfully Deleted Additional Role',
      message: `Role "${selectedRole}" has been deleted`,
    });
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  };

  const openDeleteModal = (roleId: string) => {
    setSelectedRole(roleId);
    setIsDeleteModalOpen(true);
  };

  if (isError) {
    return <Text c="red">Failed to load data.</Text>;
  }
  if (!AdditionalRole) {
    return <EmptyState />;
  }

  return (
    <Stack align="center">
      <Table
        highlightOnHover
        style={{
          borderColor: themeColors.gray[3],
          borderWidth: '1px',
          borderStyle: 'solid',
          borderTop: 0,
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th colSpan={1} ta="left" style={{ ...headTableFont, width: '5%' }}>
              <Checkbox />
            </Table.Th>
            <Table.Th colSpan={2} ta="left" style={{ ...headTableFont, width: '20%' }}>
              Role Name
            </Table.Th>
            <Table.Th colSpan={6} ta="center" style={{ ...headTableFont }}>
              Status
            </Table.Th>
            <Table.Th colSpan={1} ta="right" style={{ ...headTableFont, width: '5%' }}>
              Action
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {AdditionalRole.map((role) => (
            <Table.Tr key={role.id}>
              <Table.Td
                fz={14}
                colSpan={1}
                style={{ width: '5%', textAlign: 'left', fontWeight: 400 }}
              >
                <Checkbox />
              </Table.Td>
              <Table.Td
                fz={14}
                colSpan={2}
                style={{ width: '40%', textAlign: 'left', fontWeight: 400 }}
              >
                {role.name}
              </Table.Td>
              <Table.Td fz={14} colSpan={6} style={{ textAlign: 'center', fontWeight: 400 }}>
                {!role.isDefault ? <ActiveBadge /> : <InactiveBadge />}
              </Table.Td>
              <Table.Td
                fz={14}
                colSpan={1}
                style={{ width: '5%', textAlign: 'center', fontWeight: 400 }}
              >
                <Menu width={200} shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="light" color="gray" aria-label="Settings">
                      <IconDots size={16} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />}
                      component="a"
                    >
                      View Detail
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                      component="a"
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      c={themeColors.red[6]}
                      onClick={() => openDeleteModal(role.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {/* <Pagination total={2} withEdges size="sm" color={themeColors.primary[6]} /> */}
      <DeleteTransactionModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteTransaction}
      />
    </Stack>
  );
};

export default AdditionalRoleTable;
