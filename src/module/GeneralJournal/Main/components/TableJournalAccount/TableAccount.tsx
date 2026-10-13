import { DataTable, DataTableRowExpansionProps } from 'mantine-datatable';
import { Anchor, Group, Text, Title, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import clsx from 'clsx';
import {
  AllRoleBadge,
  InactiveBadge,
  KeyStatusLockBagde,
  KeyStatusOpenBagde,
} from '@/components/Badge/Badge';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import classes from '../../pages/GeneralJournal.module.css';
import useAccountStore from '@/store/useAccountLedger';
import EmptyState from '@/components/EmptyState/EmptyTable';
import defaultEmptyImage from '@/assets/img/Empty-Data.svg';

type TableAccountsProps = {
  data: JournalAccounts[];
  error?: boolean;
  loading?: boolean;
  selectedCategory: string | null;
  searchQuery: string;
};

const HeadTableFont = {
  fontSize: 14,
  fontWeight: 500,
};

const ColumnTableFont = {
  fontSize: 14,
  fontWeight: 400,
};
const TableAccounts = ({
  data,
  error,
  loading,
  selectedCategory,
  searchQuery,
}: TableAccountsProps) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<JournalAccounts[]>([]);
  const { selectedRecords, setSelectedRecords } = useAccountStore();
  const [expandedAccountIds, setExpandedAccountIds] = useState<string[]>([]);

  const filteredData = data.filter((item) => {
    const isCategoryMatch = selectedCategory ? item.category?.name === selectedCategory : true;
    const isSearchMatch = [
      item.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      (item.subAccount || []).some((subItem) =>
        [subItem.accountNumber?.toLowerCase(), subItem.name?.toLowerCase()].some((field) =>
          field?.includes(searchQuery.toLowerCase())
        )
      ),
    ].some(Boolean);
    return isCategoryMatch && isSearchMatch;
  });

  useEffect(() => {
    setRecords(filteredData);
  }, [data, selectedCategory, searchQuery]);

  const columns = [
    {
      accessor: 'accountNumber',
      title: <Title style={HeadTableFont}>Code</Title>,
      width: 200,
      render: ({ id = '', subAccount, accountNumber }: JournalAccounts) => (
        <Group justify="space-between">
          <Text style={ColumnTableFont} c={themeColors.black[9]}>
            {accountNumber}
          </Text>
          <IconChevronDown
            className={clsx(classes.icon, classes.expandIcon, {
              [classes.expandIconRotated]: expandedAccountIds.includes(id),
            })}
            visibility={(subAccount ?? []).length > 0 ? 'visible' : 'hidden'}
          />
        </Group>
      ),
    },
    {
      accessor: 'isLocked',
      title: <Title style={HeadTableFont}>Kunci</Title>,
      width: 120,
      render: (item: JournalAccounts) => (
        <>{item.isLocked ? <KeyStatusLockBagde /> : <KeyStatusOpenBagde />}</>
      ),
    },
    {
      accessor: 'name',
      title: <Title style={HeadTableFont}>Nama Akun</Title>,
      width: 250,
      render: (item: JournalAccounts) => (
        <Group gap="xs" wrap="nowrap">
          <Anchor
            underline="never"
            onClick={() => {
              const path = item.isBankAndCash
                ? routes.generalJournal.detailAccount
                : routes.generalJournal.detailAccountNonCB;
              navigate(path.replace(':idAccount', item.id!!));
            }}
            className={classes.accountNameColumn}
          >
            <Text c={themeColors.primary[6]} className={classes.accountNameColumn}>
              {item.name}
            </Text>
          </Anchor>
          {item.isArchived && (
            <Badge color="gray" variant="filled" size="sm" radius="sm">
              Diarsipkan
            </Badge>
          )}
        </Group>
      ),
    },
    {
      accessor: 'category',
      title: <Title style={HeadTableFont}>Kategori</Title>,
      width: 150,
      render: (item: any) => (
        <Text c={themeColors.black[9]} className={classes.categoryColumn}>
          {item.category?.name}
        </Text>
      ),
    },
    {
      accessor: 'isDebit',
      title: <Title style={HeadTableFont}>Posisi Saldo</Title>,
      width: 120,
      render: (item: any) => (
        <Text c={themeColors.black[9]} className={classes.categoryColumn}>
          {item.category?.isDebit === true ? 'Debit' : 'Kredit'}
        </Text>
      ),
    },
    {
      accessor: 'isAllUser',
      title: <Title style={HeadTableFont}>Akses</Title>,
      width: 120,
      render: (item: JournalAccounts) => (
        <>{item.isAllUser ? <AllRoleBadge /> : <InactiveBadge />}</>
      ),
    },
    {
      accessor: 'tax',
      title: <Title style={HeadTableFont}>Pajak</Title>,
      width: 80,
      render: (item: JournalAccounts) => <Text c="dark">{item.tax ?? '-'}</Text>,
    },
    {
      accessor: 'balance',
      title: (
        <Title style={HeadTableFont} ta="right">
          Balance
        </Title>
      ),
      width: 160,
      render: (item: JournalAccounts) => (
        <Text c="dark" ta="right">
          {item.amount >= 0
            ? formatCurrency(item.amount ?? 0)
            : `(${formatCurrency(Math.abs(item.amount ?? 0))})`}
        </Text>
      ),
    },
  ];

  const subAccountColumns = columns.map((col) => {
    if (col.accessor === 'accountNumber') {
      return {
        ...col,
        render: ({ id = '', subAccount, accountNumber }: JournalAccounts) => (
          <div style={{ paddingLeft: '16px' }}>
            <Group justify="space-between">
              <Text style={ColumnTableFont} c={themeColors.black[9]}>
                {accountNumber}
              </Text>
              <IconChevronDown
                className={clsx(classes.icon, classes.expandIcon, {
                  [classes.expandIconRotated]: expandedAccountIds.includes(id),
                })}
                visibility={(subAccount ?? []).length > 0 ? 'visible' : 'hidden'}
              />
            </Group>
          </div>
        ),
      };
    }
    if (col.accessor === 'isLocked') {
      return {
        ...col,
        render: (item: JournalAccounts) => (
          <div style={{ paddingLeft: '16px' }}>
            {item.isLocked ? <KeyStatusLockBagde /> : <KeyStatusOpenBagde />}
          </div>
        ),
      };
    }
    if (col.accessor === 'name') {
      return {
        ...col,
        render: (item: JournalAccounts) => (
          <div style={{ paddingLeft: '16px' }}>
            <Group gap="xs" wrap="nowrap">
              <Anchor
                underline="never"
                onClick={() => {
                  const path = item.isBankAndCash
                    ? routes.generalJournal.detailAccount
                    : routes.generalJournal.detailAccountNonCB;
                  navigate(path.replace(':idAccount', item.id!!));
                }}
                className={classes.accountNameColumn}
              >
                <Text c={themeColors.primary[6]} className={classes.accountNameColumn}>
                  {item.name}
                </Text>
              </Anchor>
              {item.isArchived && (
                <Badge color="gray" variant="filled" size="sm" radius="sm">
                  Diarsipkan
                </Badge>
              )}
            </Group>
          </div>
        ),
      };
    }
    return col;
  });

  const expansionContent = ({ record }: { record: JournalAccounts }) => (
    <DataTable
      noHeader
      records={record.subAccount}
      rowStyle={() => () => ({ backgroundColor: themeColors.gray[0] })}
      columns={subAccountColumns}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      isRecordSelectable={(record) => !record.isLocked}
    />
  );

  const rowExpansion: DataTableRowExpansionProps<JournalAccounts> = {
    allowMultiple: true,
    expanded: { recordIds: expandedAccountIds, onRecordIdsChange: setExpandedAccountIds },
    content: expansionContent,
  };


  return records.length === 0 ? (
    <EmptyState
      title="There is no data account available yet"
      imageSrc={defaultEmptyImage}
      imageAlt="No data found"
    />
  ) : (
    <DataTable
      withTableBorder
      records={records}
      columns={columns}
      rowExpansion={rowExpansion}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      isRecordSelectable={(record) => !record.isLocked}
      borderRadius="md"
    />
  );
};

export default TableAccounts;
