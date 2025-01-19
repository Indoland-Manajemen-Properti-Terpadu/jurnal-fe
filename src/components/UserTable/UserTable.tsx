import React, { useEffect, useMemo, useState } from 'react';
import { DataTable, DataTableProps, DataTableSortStatus, DataTableColumn } from 'mantine-datatable';
import {
  ActionIcon,
  Avatar,
  Badge,
  Flex,
  Group,
  HoverCard,
  MantineColor,
  Modal,
  MultiSelect,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import sortBy from 'lodash/sortBy';
import { IconCloudDownload, IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react';
import { ErrorAlert } from '@/components';
import { Users, UserStatus } from '@/types';
import { useDebouncedValue } from '@mantine/hooks';
import { openConfirmModal } from '@mantine/modals';
import { capitalize } from '@/utils/Capitalize';
import classes from './UserTable.module.css';
import { ActiveBadge } from '../StatusBadge/ActiveBagde';
import { InactiveBadge } from '../StatusBadge/InactiveBagde';

const PAGE_SIZES = [5, 10, 20];
const ICON_SIZE = 18;

type UserTableProps = {
  data: Users[];
  error?: React.ReactNode;
  loading?: boolean;
};

const  UserTable = ({ data, error, loading }: UserTableProps) => {
  const actionDelete = () =>
    openConfirmModal({
      title: 'Delete this user',
      centered: true,
      children: (
        <Text size="sm" c="black">
          Are you sure you want to delete this user? This action is destructive and you will have to
          contact support to restore your data.
        </Text>
      ),
      withCloseButton: false,
      labels: { confirm: 'Delete Users', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Confirmed'),
    });

  const theme = useMantineTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [selectedRecords, setSelectedRecords] = useState<Users[]>([]);
  const [records, setRecords] = useState<Users[]>(data.slice(0, pageSize));
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'full_name',
    direction: 'asc',
  });
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const statuses = useMemo(() => {
    const statuses = new Set(data.map((e) => e.status));
    return [...statuses];
  }, [data]);

  const columns: DataTableProps<Users>['columns'] = [
    {
      accessor: 'full_name',
      title: 'Full Name',
      width: '40%',
      render: ({ full_name, email }: any) => {
        const firstName = full_name.split(' ')[0],
          lastName = full_name.split(' ')[1];

        return (
          <HoverCard shadow="md" openDelay={500} closeDelay={500}>
            <HoverCard.Target>
              <Flex component={UnstyledButton} gap="xs" align="center">
                <Avatar
                  src={null}
                  alt={`${firstName} ${lastName}`}
                  variant="filled"
                  radius="xl"
                  color={theme.colors[theme.primaryColor][7]}
                >
                  {`${Array.from(firstName)[0]}`}
                  {`${Array.from(lastName)[0]}`}
                </Avatar>
                <Stack gap={1}>
                  <Text className={classes.tableText} fw={600}>
                    {full_name}
                  </Text>
                  <Text className={classes.tableText} fz="sm">
                    {email}
                  </Text>
                </Stack>
              </Flex>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Stack gap="xs">
                <Text className={classes.tableText} fz="sm">
                  First name: {firstName}
                </Text>
                <Text className={classes.tableText} fz="sm">
                  Last name: {lastName}
                </Text>
                <Text className={classes.tableText} fz="sm">
                  Email: {email}
                </Text>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        );
      },
      sortable: true,
      filter: (
        <TextInput
          label="Full Name"
          description="Show users whose names include the specified text"
          placeholder="Search customer..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
      ),
      filtering: query !== '',
    },

    {
      accessor: 'role',
      title: 'Role Access',
      render: (item: Users) => (
        // <Group gap="sm">
        <Flex component={UnstyledButton} gap="xs" align="center">
          {item.role.slice(0, 2).map((role) => (
            <Badge
              key={role}
              variant="light"
              color="rgba(0, 0, 0, 1)"
              radius="sm"
              className={classes.badgeText}
            >
              {capitalize(role)}
            </Badge>
          ))}
          {item.role.length > 2 && (
            <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 96 }} radius="sm">
              More {item.role.length - 2}+
            </Badge>
          )}
          </Flex>
      ),
    },
    {
      accessor: 'type_user',
      title: 'Type User',
      render: (item: any) => <Text className={classes.tableText}>{item.type_user}</Text>,
    },
    {
      accessor: 'status',
      title: 'Status',
      sortable: true,
      render: (item: Users) => (
        <>
          {item.status === 'Active' && <ActiveBadge />}
          {item.status === 'Inactive' && <InactiveBadge />}
        </>
      ),
      filter: (
        <MultiSelect
          label="Status"
          description="Show all products with status"
          data={statuses}
          value={selectedStatuses}
          placeholder="Search statuses…"
          onChange={setSelectedStatuses}
          leftSection={<IconSearch size={16} />}
          clearable
          searchable
        />
      ),
      filtering: selectedStatuses.length > 0,
    },
    {
      accessor: 'action',
      title: 'Actions',
      render: (item: any) => (
        <Group gap="sm">
          <Tooltip label="Edit Users">
            <ActionIcon variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
              <IconEdit size={ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Users">
            <ActionIcon
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              onClick={actionDelete}
            >
              <IconTrash size={ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const d = sortBy(data, sortStatus.columnAccessor) as Users[];
    const dd = sortStatus.direction === 'desc' ? d.reverse() : d;
    let filtered = dd.slice(from, to) as Users[];

    if (debouncedQuery || selectedStatuses.length) {
      filtered = data
        .filter(({ full_name, status }) => {
          if (
            debouncedQuery !== '' &&
            !full_name.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
          ) {
            return false;
          }

          // @ts-ignore
          if (selectedStatuses.length && !selectedStatuses.some((s) => s === status)) {
            return false;
          }
          return true;
        })
        .slice(from, to);
    }

    setRecords(filtered);
  }, [sortStatus, data, page, pageSize, debouncedQuery, selectedStatuses]);

  return error ? (
    <ErrorAlert title="Error loading Users" message={error.toString()} />
  ) : (
    <DataTable
      minHeight={200}
      verticalSpacing="sm"
      striped={true}
      highlightOnHover={true}
       // @ts-ignore
      columns={columns}
      records={records}
      selectedRecords={selectedRecords}
      // @ts-ignore
      onSelectedRecordsChange={setSelectedRecords}
      totalRecords={debouncedQuery || selectedStatuses.length > 0 ? records.length : data.length}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={(p) => setPage(p)}
      recordsPerPageOptions={PAGE_SIZES}
      onRecordsPerPageChange={setPageSize}
      sortStatus={sortStatus}
      onSortStatusChange={setSortStatus}
      fetching={loading}
      loaderType="bars"
      loaderBackgroundBlur={2}
      classNames={{ pagination: classes.pagination, root: classes.root }}
    />
  );
};

export default UserTable;
