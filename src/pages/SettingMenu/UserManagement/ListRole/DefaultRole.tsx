import React, { useEffect, useState } from 'react';
import { ActionIcon, Box, Button, Group, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import classes from './ListRole.module.css';
import defaultRole from '@/../public/mocks/Role.json';

const PAGE_SIZES = [5, 10, 20];

export default function DefaultRole() {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(defaultRole.slice(0, pageSize));
  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecords(defaultRole.slice(from, to));
  }, [page, pageSize]);

  return (
    <DataTable
      withTableBorder
      records={records}
      columns={[
        {
          accessor: 'roleName',
          title: 'Role Name',
          width: '100%',
          render: (record) => <Text className={classes.tableText}>{record.roleName}</Text>,
        },
        {
          accessor: 'actions',
          title: (
            <Box mr={12} ta="center">
              Row actions
            </Box>
          ),
          textAlign: 'center',
          render: (role) => (
            <Button leftSection={<IconInfoCircle size={14} />} disabled size="xs">
              View Detail
            </Button>
          ),
        },
      ]}
      totalRecords={defaultRole.length}
      recordsPerPage={pageSize}
      page={page}
      onPageChange={(p) => setPage(p)}
      recordsPerPageOptions={PAGE_SIZES}
      onRecordsPerPageChange={setPageSize}
      tabIndex={1}
      paginationText={({ from, to, totalRecords }) => `Records ${from} - ${to} of ${totalRecords}`}
      classNames={{ pagination: classes.pagination, root: classes.root }}
      defaultColumnProps={{
        // textAlign: 'center',
        noWrap: false,
        ellipsis: true,
        titleStyle: (theme) => ({ color: theme.colors.dark[5] }),
      }}

    />
    
  );
}
