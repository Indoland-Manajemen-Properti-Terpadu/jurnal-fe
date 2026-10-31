import React, { useState } from 'react';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { ActionIcon, Checkbox, Menu, rem, Stack, Table, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import { IconDots, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { ActiveBadge, InactiveBadge } from '@/components/Badge/Badge';
import { notifications } from '@mantine/notifications';
import { DeleteJournalEntryModal as DeleteTransactionModal } from '@/module/journal-entries';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';

import { useTranslation } from '@/i18n';

const headTableFont = {
  fontSize: 14,
  fontWeight: 500,
};

const AdditionalRoleTable: React.FC = () => {
  const { t: tu } = useTranslation('userManagement');
  const { data: AdditionalRole, isError } = useRoles(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleDeleteTransaction = () => {
    notifications.show({
      color: themeColors.red[6],
      autoClose: 3000,
      title: tu('role.deletedTitle'),
      message: tu('role.deletedMessage', { name: selectedRole ?? '' }),
    });
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  };

  const openDeleteModal = (roleId: string) => {
    setSelectedRole(roleId);
    setIsDeleteModalOpen(true);
  };

  if (isError) {
    return <Text c="red">{tu('common.loadFailed')}</Text>;
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
              {tu('common.roleName')}
            </Table.Th>
            <Table.Th colSpan={6} ta="center" style={{ ...headTableFont }}>
              {tu('common.status')}
            </Table.Th>
            <Table.Th colSpan={1} ta="right" style={{ ...headTableFont, width: '5%' }}>
              {tu('common.action')}
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
                    <ActionIcon variant="light" color="gray" aria-label={tu('common.settings')}>
                      <IconDots size={16} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEye style={{ width: rem(14), height: rem(14) }} />}
                      component="a"
                    >
                      {tu('role.viewDetail')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                      component="a"
                    >
                      {tu('common.edit')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      c={themeColors.red[6]}
                      onClick={() => openDeleteModal(role.id)}
                    >
                      {tu('common.delete')}
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
