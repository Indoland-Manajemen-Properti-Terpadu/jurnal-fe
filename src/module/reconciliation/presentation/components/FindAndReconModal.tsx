import { useEffect, useState } from 'react';
import { Badge, Button, Group, Input, Paper, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { MagnifyingGlass, PuzzlePieceIcon } from '@phosphor-icons/react';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import uploadTemplateImage from '@/assets/images/illustrations/reconcile.svg';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { canConfirmMatch, matchesBankDirection, selectedTotal } from '../../domain/matchRules';
import type { BankStatementData, JournalDetail } from '../../domain/reconciliation';
import { useJournalDetailsForRecon } from '../hooks/useJournalDetailsForRecon';
import DirectionBadge from './DirectionBadge';

interface FindAndReconModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (journals: JournalDetail[]) => void;
  selectedBankStatement: BankStatementData | null;
}

const headerText = (text: string) => (
  <Text size="sm" fw={600} c={themeColors.black[9]}>
    {text}
  </Text>
);

const matchesQuery = (item: JournalDetail, query: string): boolean =>
  !query ||
  Boolean(item.description && item.description.toLowerCase().includes(query)) ||
  Boolean(item.account?.name && item.account.name.toLowerCase().includes(query)) ||
  Boolean(
    item.account?.accountNumber && item.account.accountNumber.toLowerCase().includes(query)
  ) ||
  Boolean(item.transactionDate && dateFormatV1(item.transactionDate).toLowerCase().includes(query));

const matchesDay = (item: JournalDetail, selectedDate: Date | null): boolean => {
  if (!selectedDate || !item.transactionDate) return true;
  return new Date(item.transactionDate).toDateString() === new Date(selectedDate).toDateString();
};

export const FindAndReconModal: React.FC<FindAndReconModalProps> = ({
  opened,
  onClose,
  onConfirm,
  selectedBankStatement,
}) => {
  const { t } = useTranslation('reconciliation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: journalDetails = [], isLoading } = useJournalDetailsForRecon(
    selectedBankStatement?.id || null
  );
  const [selectedRecords, setSelectedRecords] = useState<JournalDetail[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset selected records when modal opens/closes or bank statement changes
  useEffect(() => {
    setSelectedRecords([]);
    setSearchQuery('');
    setSelectedDate(null);
  }, [selectedBankStatement?.id, opened]);

  const bankAmount = selectedBankStatement?.amount || 0;
  const query = searchQuery.toLowerCase();
  // Match debit with debit and credit with credit
  const filteredTransaction = journalDetails.filter(
    (item) =>
      matchesQuery(item, query) &&
      matchesDay(item, selectedDate) &&
      matchesBankDirection(bankAmount, item)
  );

  const totalNominal = Math.abs(bankAmount);
  const selectedNominal = selectedTotal(selectedRecords);
  const shortageNominal = totalNominal - selectedNominal;
  const excessNominal = selectedNominal - totalNominal;
  const canConfirm = selectedRecords.length > 0 && canConfirmMatch(selectedNominal, totalNominal);

  const columns: DataTableColumn<JournalDetail>[] = [
    {
      accessor: 'description',
      title: headerText(t('modal.columns.description')),
      render: (element) => (
        <Text
          size="sm"
          c={themeColors.primary[6]}
          fw={500}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          {element.description || '-'}
        </Text>
      ),
    },
    {
      accessor: 'transactionDate',
      title: headerText(t('modal.columns.date')),
      render: (element) => (
        <Text size="sm" c={themeColors.black[9]}>
          {element.transactionDate ? dateFormatV1(element.transactionDate) : '-'}
        </Text>
      ),
    },
    {
      accessor: 'debit',
      title: headerText(t('modal.columns.debit')),
      render: (element) => (
        <Text size="sm" c={themeColors.black[9]}>
          {formatCurrency(element.debit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'credit',
      title: headerText(t('modal.columns.credit')),
      render: (element) => (
        <Text size="sm" c={themeColors.black[9]}>
          {formatCurrency(element.credit || 0)}
        </Text>
      ),
    },
  ];

  const handleConfirm = () => {
    if (canConfirm) {
      setShowConfirmation(true);
    }
  };

  const handleActualConfirm = () => {
    onConfirm(selectedRecords);
    setShowConfirmation(false);
    onClose();
  };

  const footerAmount = (label: string, value: string, color?: string) => (
    <Group gap={4}>
      <Text size="sm" fw={500} c={themeColors.black[9]}>
        {label}
      </Text>
      <Text size="sm" fw={700} c={color ?? themeColors.black[9]}>
        {value}
      </Text>
    </Group>
  );

  return (
    <>
      <CustomConfirmModal
        size="65rem"
        opened={opened}
        onClose={onClose}
        withCloseButton
        title={
          <Text fw={700} fz="var(--jurnal-text-lg)" c={themeColors.black[9]}>
            {t('modal.title')}
          </Text>
        }
        labels={{
          confirm: (
            <Button
              variant="filled"
              bg={canConfirm ? themeColors.primary[5] : themeColors.gray[2]}
              onClick={handleConfirm}
              leftSection={<PuzzlePieceIcon size={16} weight="duotone" />}
              disabled={!canConfirm}
              style={{ color: canConfirm ? 'white' : themeColors.gray[5] }}
            >
              <Group gap={6}>
                {t('actions.reconcile')}
                {selectedRecords.length > 0 && (
                  <Badge color={themeColors.primary[8]} variant="filled" size="sm">
                    {selectedRecords.length}
                  </Badge>
                )}
              </Group>
            </Button>
          ),
          cancel: (
            <Button
              variant="filled"
              bg={themeColors.blue[0]}
              c={themeColors.blue[6]}
              onClick={onClose}
            >
              {t('actions.cancel')}
            </Button>
          ),
        }}
      >
        <Stack gap="md">
          {selectedBankStatement && (
            <Paper withBorder p="md" radius="sm" bg="white">
              <Stack gap="xs">
                <Text size="xs" fw={600} c={themeColors.black[9]}>
                  {t('header.bankStatement')}
                </Text>
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    <Text size="xs" c={themeColors.gray[6]}>
                      {dateFormatV1(selectedBankStatement.date)}
                    </Text>
                    <Text size="sm" fw={600} c={themeColors.black[9]}>
                      {selectedBankStatement.description}
                    </Text>
                  </Stack>
                  <Stack align="flex-end" gap={4}>
                    <DirectionBadge received={selectedBankStatement.amount > 0} />
                    <Text size="sm" fw={700} c={themeColors.black[9]}>
                      {formatCurrency(Math.abs(selectedBankStatement.amount))}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Paper>
          )}

          <Text fw={600} size="sm" c={themeColors.black[9]}>
            {t('modal.searchJournal')}
          </Text>

          <Group grow>
            <Input
              placeholder={t('modal.searchPlaceholder')}
              leftSection={<MagnifyingGlass size={16} color={themeColors.gray[6]} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              styles={{ input: { color: themeColors.black[9] } }}
            />
            <DatePickerInput
              placeholder={t('modal.allDates')}
              leftSection={<IconCalendar size={18} color={themeColors.gray[6]} />}
              value={selectedDate}
              onChange={(val) => setSelectedDate(val as Date | null)}
              clearable
              styles={{ input: { color: themeColors.black[9] } }}
            />
          </Group>

          <DataTable
            withTableBorder
            borderRadius="sm"
            fz="sm"
            columns={columns}
            records={filteredTransaction}
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
            minHeight={200}
            fetching={isLoading}
            loaderColor="primary"
            styles={{
              header: { color: themeColors.black[9] },
            }}
          />

          <Group justify="space-between" mt="sm">
            <Group gap="lg">
              {footerAmount(t('modal.total'), formatCurrency(totalNominal))}
              {footerAmount(t('modal.selected'), formatCurrency(selectedNominal))}
              {footerAmount(
                t('modal.shortage'),
                formatCurrency(Math.max(0, shortageNominal)),
                shortageNominal > 0 ? themeColors.red[7] : themeColors.green[6]
              )}
              {footerAmount(
                t('modal.excess'),
                formatCurrency(Math.max(0, excessNominal)),
                excessNominal > 0 ? themeColors.red[7] : themeColors.green[6]
              )}
            </Group>
          </Group>
        </Stack>
      </CustomConfirmModal>

      <ConfirmModal
        opened={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleActualConfirm}
        title={t('confirm.title')}
        message={t('confirm.message')}
        helperText={t('confirm.helper')}
        confirmLabel={t('actions.reconcile')}
        cancelLabel={t('actions.cancel')}
        imageSrc={uploadTemplateImage}
        confirmButtonProps={{
          bg: themeColors.primary[5],
          leftSection: <PuzzlePieceIcon size={16} weight="duotone" />,
        }}
      />
    </>
  );
};
