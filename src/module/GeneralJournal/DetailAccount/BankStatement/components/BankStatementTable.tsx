// components/BankStatementTable.tsx
import {
  Anchor,
  Button,
  Center,
  Container,
  Stack,
  Text,
  Title,
  Group,
  Input,
  Flex,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { BankStatementModelV2, Result } from '../types/BankStatementModel';
import { dateFormatV1 } from '@/utils/FormatDate';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { themeColors } from '@/theme';
import BadgeStatusReconciled from './BadgeStatus';
import { useQueryClient } from '@tanstack/react-query';
import { getBankStatement } from '../services/ListBankStatement.service';
import ImportBankStatementModal from './ImportBankStatementModal';
import { useState } from 'react';
import { CloudArrowUp, Trash } from '@phosphor-icons/react';

interface BankStatementTableProps {
  selectedRecords: Result[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<Result[]>>;
}

export default function BankStatementTable({
  selectedRecords,
  setSelectedRecords,
}: BankStatementTableProps) {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  let { data: bankStatement, isLoading, isError } = getBankStatement(idAccount!);

  const rawRecords = bankStatement?.results || bankStatement?.resultTransaction || [];
  const records = rawRecords.filter((r): r is Result => r !== null);
  const isEmpty = records.length === 0;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] });
  };

  const filteredRecords = records.filter((r) => {
    const searchTarget = `${r.transactionName || ''} ${r.description || ''}`.toLowerCase();
    const matchSearch = !searchQuery || searchTarget.includes(searchQuery.toLowerCase());
    const matchDate = selectedDate
      ? r.transactionDate
        ? dayjs(r.transactionDate).isSame(selectedDate, 'day')
        : false
      : true;
    return matchSearch && matchDate;
  });

  if (isLoading)
    return (
      <Center h={200}>
        <Text>Loading bank statement...</Text>
      </Center>
    );

  if (isError || isEmpty)
    return (
      <>
        <JournalEmptyState
          onButtonClick={handleOpenModal}
          title="Belum Ada Bank Statement"
          description="Bank statement belum tersedia. Silakan import bank statement untuk mulai melakukan rekonsiliasi."
          buttonLabel="Import Bank Statement"
          buttonIcon={<CloudArrowUp size={16} />}
        />
        <ImportBankStatementModal
          idAccount={idAccount!}
          onContinue={handleRefresh}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </>
    );

  const columns = [
    {
      accessor: 'transactionName',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Deskripsi Transaksi
        </Text>
      ),
      render: (element: Result) => (
        <Anchor underline="never" onClick={() => navigate(`/transaction/${element.id}`)}>
          <Text c={themeColors.primary[6]} size="sm">
            {element.transactionName}
          </Text>
        </Anchor>
      ),
    },
    {
      accessor: 'transactionDate',
      title: (
        <Text size="sm" fz={14} fw={500} ta="center" c={themeColors.black[9]}>
          Tanggal
        </Text>
      ),
      render: (element: Result) => (
        <Text size="sm" fz={14} fw={400} c={themeColors.black[9]} ta="center">
          {element.transactionDate ? dateFormatV1(element.transactionDate) : '-'}
        </Text>
      ),
    },
    {
      accessor: 'receive',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Terima (Dalam Rp){' '}
        </Text>
      ),
      render: (element: Result) => (
        <Text size="sm" fz={14} fw={400} c={themeColors.black[9]}>
          {formatCurrency(element.debit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'sent',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Kirim (Dalam Rp)
        </Text>
      ),
      render: (element: Result) => (
        <Text size="sm" fz={14} fw={400} c={themeColors.black[9]}>
          {formatCurrency(element.credit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'balance',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          Saldo (Dalam Rp)
        </Text>
      ),
      render: (element: Result) => (
        <Text size="sm" fz={14} fw={400} c={themeColors.black[9]}>
          {formatCurrency(element.debit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'reconciled',
      title: (
        <Text size="sm" fz={14} fw={500} ta="center" c={themeColors.black[9]}>
          Status
        </Text>
      ),
      render: (element: Result) => (
        <Center>
          <BadgeStatusReconciled reconciled={!!element.reconciled} />
        </Center>
      ),
    },
    {
      accessor: 'action',
      title: (
        <Text size="xs" fz={14} fw={500} ta="center" c={themeColors.black[9]}>
          Aksi
        </Text>
      ),
      render: (element: Result) => (
        <Center>
          <Button variant="subtle" size="xs" color={themeColors.gray[6]}>
            <Trash size={18} color={themeColors.gray[6]} weight="duotone" />
          </Button>
        </Center>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: 'column', sm: 'row' }}
        gap="md"
      >
        <Group gap="sm" style={{ flex: 1 }}>
          <Input
            placeholder="Search by transaction number or name"
            size="xs"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '300px' }}
          />
          <DatePickerInput
            placeholder="Date"
            valueFormat="DD/MM/YYYY"
            highlightToday
            size="xs"
            value={selectedDate}
            onChange={(val: any) => setSelectedDate(val)}
            clearable={!!selectedDate}
            rightSection={!selectedDate ? <IconCalendar size={16} /> : null}
            style={{ width: '200px' }}
          />
        </Group>
        <Button
          size="xs"
          color={themeColors.primary[5]}
          leftSection={<CloudArrowUp size={16} />}
          onClick={handleOpenModal}
        >
          Impor Rekening Koran
        </Button>
      </Flex>

      <DataTable
        withTableBorder
        borderRadius="md"
        highlightOnHover
        fz="sm"
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        columns={columns}
        records={filteredRecords}
        styles={{
          root: { borderColor: '#E9ECEF' },
        }}
      />

      <ImportBankStatementModal
        idAccount={idAccount!}
        onContinue={handleRefresh}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Stack>
  );
}
