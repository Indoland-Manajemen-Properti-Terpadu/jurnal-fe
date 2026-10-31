import React, { useMemo, useState } from 'react';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import {
  ActionIcon,
  Avatar,
  Flex,
  Grid,
  Group,
  HoverCard,
  Menu,
  rem,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { openConfirmModal } from '@mantine/modals';
import { gradientColors, themeColors } from '@/theme';
import { ActiveBadge, InactiveBadge } from '@/components/Badge/Badge';
import EmptyState from '@/components/EmptyState/EmptyTable';
import defaultEmptyImage from '@/assets/img/Empty-Data.svg';
import UserAction from '@/module/user-management/presentation/components/user-table/UserAction';
import LoadingErrorState from '@/module/user-management/presentation/components/user-table/ErrorHandlingUserTable';
import { AllUserModel, Result } from '@/module/user-management/domain/userTypes';
import { navigate } from '@/router';
import { routes } from '@/router/routes';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';

type UserTableProps = {
  data: AllUserModel;
  isError?: boolean;
  isLoading?: boolean;
};
const ICON_SIZE = {
  width: rem(14),
  height: rem(14)
}

const UserTable = ({ data = { results: [] }, isError, isLoading }: UserTableProps) => {
  const [selectedRecords, setSelectedRecords] = useState<Result[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);

  const results = data.results || [];

  const filteredData = useMemo(() => {
    let filtered = results;

    if (debouncedQuery) {
      filtered = filtered.filter((user) =>
        user.name?.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
      );
    }
    return filtered;
  }, [results, debouncedQuery]);


  const actionDelete = () =>
    openConfirmModal({
      title: 'Delete this user',
      centered: true,
      children: (
        <Text size="sm" c="black">
          Are you sure you want to delete this user? This action is destructive and you will have to contact support to restore your data.
        </Text>
      ),
      withCloseButton: false,
      labels: { confirm: 'Delete User', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Confirmed'),
    });

  const columns: DataTableProps<Result>['columns'] = [
    {
      accessor: 'name',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Full Name
        </Text>
      ),
      render: ({ name, email }) => (
        <HoverCard openDelay={200} closeDelay={200} width={300} >
          <HoverCard.Target>
            <Flex component={UnstyledButton} gap="xs" align="center">
              <Avatar
                src={null}
                alt={name}
                variant="gradient"
                radius="xl"
                gradient={gradientColors.gradient}
              >
                {name?.charAt(0)}
              </Avatar>
              <Stack gap={1}>
                <Text fz={14} fw={400} c={themeColors.black[9]} tt='capitalize'>
                  {name}
                </Text>
                <Text fz={12} fw={400} c={themeColors.gray[6]}>
                  {email}
                </Text>
              </Stack>
            </Flex>
          </HoverCard.Target>
          <HoverCard.Dropdown >
            <Stack gap={2}>
              <Group grow justify='space-between'>
                <Grid>
                  <Grid.Col span={4}>
                    <Text c={themeColors.gray[6]} fz={10}>First Name</Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Text c={themeColors.gray[6]} fz={10} ta='left'>: {name?.split(' ')[0]}</Text>
                  </Grid.Col>
                </Grid>
              </Group>
              <Group grow justify='space-between'>
                <Grid>
                  <Grid.Col span={4}>
                    <Text c={themeColors.gray[6]} fz={10}>Last Name</Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Text c={themeColors.gray[6]} fz={10} ta='left'>: {name?.split(' ')[1] ?? '-'}</Text>
                  </Grid.Col>
                </Grid>
              </Group>
              <Group grow justify='space-between'>
                <Grid>
                  <Grid.Col span={4}>
                    <Text c={themeColors.gray[6]} fz={10}>Email</Text>
                  </Grid.Col>
                  <Grid.Col span={8}>
                    <Text c={themeColors.gray[6]} fz={10} ta='left'>: {email}</Text>
                  </Grid.Col>
                </Grid>
              </Group>
            </Stack>
          </HoverCard.Dropdown>
        </HoverCard>
      ),
    },
    {
      accessor: 'role',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Role Access
        </Text>
      ),
      render: ({ role }) => (
        <Text fz={14} fw={400} c={themeColors.black[9]} tt="capitalize">
          {role ?? 'N/A'}
        </Text>
      ),
    },
    {
      accessor: 'role',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Type User
        </Text>
      ),
      render: ({ role }) => (
        <Text fz={14} fw={400} c={themeColors.black[9]} tt="capitalize">
          {role ?? 'N/A'}
        </Text>
      ),
    },
    {
      accessor: 'isEmailVerified',
      title: (
        <Text size="sm" fz={14} fw={500} ta="center" c={themeColors.black[9]}>
          Status
        </Text>
      ),
      render: ({ isEmailVerified }) => (
        <Text ta="center">{isEmailVerified ? <ActiveBadge /> : <InactiveBadge />}</Text>
      ),
    },
    {
      accessor: 'action',
      textAlign: 'center',
      title: (
        <Text size="sm" fz={14} fw={500} ta="center" c={themeColors.black[9]}>
          Actions
        </Text>
      ),
      render: (item) =>
        <Menu>
          <Menu.Target>
            <ActionIcon variant="light" color="gray" aria-label="Settings">
              <IconDots style={{ width: '70%', height: '70%' }} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit style={ICON_SIZE} />}
              onClick={() => navigate(routes.userManagement.editUser, { state: { email: item.email!! } })}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              leftSection={<IconTrash style={ICON_SIZE} />}
              onClick={actionDelete}
              c={themeColors.red[6]}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
    },
  ];

  return (
    <>
      <LoadingErrorState isLoading={isLoading} isError={isError} />
      {results.length === 0 ? (
        <EmptyState
          title="There are no users available yet"
          imageSrc={defaultEmptyImage}
          imageAlt="No data found"
        />
      ) : (
        <DataTable
          withTableBorder
          borderRadius="md"
          verticalSpacing="sm"
          mt="md"
          highlightOnHover
          columns={columns}
          records={filteredData}
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
        />
      )}
    </>
  );
};

export default UserTable;
