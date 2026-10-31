import React from 'react';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { ActionIcon, Loader, Stack, Table } from '@mantine/core';
import { themeColors } from '@/theme';
import { IconInfoCircle } from '@tabler/icons-react';
import { useDefaultRoles } from '@/module/user-management/presentation/hooks/useRoles';

import { useTranslation } from '@/i18n';

const headTableFont = {
  fontSize: 'var(--jurnal-text-sm)',
  fontWeight: 500,
};

const DefaultRoleTable: React.FC = () => {
  const { t: tu } = useTranslation('userManagement');
  const { data: DefaultRole, isError } = useDefaultRoles();

  if (isError) {
    return <Loader c="red">{tu('common.loadFailed')}</Loader>;
  }
  if (!DefaultRole) {
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
            <Table.Th colSpan={10} ta="left" style={{ ...headTableFont, width: '40%' }}>
              {tu('common.roleName')}
            </Table.Th>
            <Table.Th colSpan={2} ta="center" style={{ ...headTableFont, width: '5%' }}>
              {tu('common.action')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {DefaultRole.map((role) => (
            <Table.Tr key={role.id}>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={10}
                style={{ width: '40%', textAlign: 'left', fontWeight: 400 }}
              >
                {role.name}
              </Table.Td>
              <Table.Td
                fz="var(--jurnal-text-sm)"
                colSpan={2}
                style={{ width: '5%', textAlign: 'center', fontWeight: 400 }}
              >
                <ActionIcon variant="light" color="gray" aria-label={tu('common.settings')}>
                  <IconInfoCircle size={16} stroke={1.5} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {/* <Pagination total={2} withEdges size='sm' color={themeColors.primary[6]} /> */}
    </Stack>
  );
};

export default DefaultRoleTable;
