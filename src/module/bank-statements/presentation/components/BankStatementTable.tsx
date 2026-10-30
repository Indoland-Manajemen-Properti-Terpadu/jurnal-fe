import { Anchor, Button, Center, Stack, Text, Group, Input, Flex } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router';
import { DataTable } from 'mantine-datatable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/FormatDate';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { themeColors } from '@/theme';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CloudArrowUp, Trash } from '@phosphor-icons/react';
import BadgeStatusReconciled from './BadgeStatus';
import { useBankStatement } from '../hooks/useBankStatement';
import ImportBankStatementModal from './ImportBankStatementModal';
import { Result } from '../../domain/bankStatement';

interface BankStatementTableProps {
  selectedRecords: Result[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<Result[]>>;
}

export default function BankStatementTable({
  selectedRecords,
  setSelectedRecords,
}: BankStatementTableProps) {
  const { t } = useTranslation('bankStatements');
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: bankStatement, isLoading, isError } = useBankStatement(idAccount!);

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

  if (isLoading) {
    return (
      <Center h={200}>
        <Text>{t('table.loading')}</Text>
      </Center>
    );
  }

  if (isError || isEmpty) {
    return (
      <>
        <JournalEmptyState
          onButtonClick={handleOpenModal}
          title={t('table.emptyTitle')}
          description={t('table.emptyDescription')}
          buttonLabel={t('table.emptyButton')}
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
  }

  const columns = [
    {
      accessor: 'transactionName',
      title: (
        <Text size="sm" fz={14} fw={500} c={themeColors.black[9]}>
          {t('table.columns.description')}
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
          {t('table.columns.date')}
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
          {t('table.columns.received')}
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
          {t('table.columns.sent')}
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
          {t('table.columns.balance')}
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
          {t('table.columns.status')}
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
          {t('table.columns.action')}
        </Text>
      ),
      render: () => (
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
            placeholder={t('table.searchPlaceholder')}
            size="xs"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '300px' }}
          />
          <DatePickerInput
            placeholder={t('table.datePlaceholder')}
            valueFormat="DD/MM/YYYY"
            highlightToday
            size="xs"
            value={selectedDate}
            onChange={setSelectedDate}
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
          {t('table.importButton')}
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
