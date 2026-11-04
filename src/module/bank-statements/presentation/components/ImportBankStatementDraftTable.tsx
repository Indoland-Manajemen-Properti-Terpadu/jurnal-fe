import {
  ActionIcon,
  Group,
  Text,
  TextInput,
  Modal,
  Stack,
  Button,
  Flex,
  Tooltip,
} from '@mantine/core';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { formatCurrency } from '@/utils/formatCurrency';
import { EmptyState } from '@/components/EmptyState';
import { IconCalendar, IconPencil, IconTrash } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useState } from 'react';
import { DateInput } from '@mantine/dates';
import { format, parse } from 'date-fns';
import { useTranslation } from '@/i18n';
import { useBankStatementStore } from '../store/useBankStatementStore';
import { BankStatementPreviewItem } from '../../domain/importPreview';
import { filledSides } from '../../domain/importDraft';
import { validateImportRow } from '../../domain/importValidation';
import type { DuplicateReason } from '../../domain/statementSummary';

interface ImportBankStatementDraftTableProps {
  records: BankStatementPreviewItem[];
  selectedRecords?: BankStatementPreviewItem[];
  onSelectedRecordsChange?: (records: BankStatementPreviewItem[]) => void;
  /** Rows that repeat another row, by `rowIndex`. */
  duplicates?: Map<number, DuplicateReason>;
}

/** A plain number is formatted; anything else (`1.000.000,50`) is shown as typed, so it is not read as `1`. */
const amountOrRaw = (value: string): string => {
  if (!value) return '-';
  return /^\d+(\.\d+)?$/.test(value.trim()) ? formatCurrency(Number(value)) : value;
};

const headTableStyle = {
  fontSize: 'var(--jurnal-text-sm)',
  fontWeight: 500,
  color: themeColors.black[9],
};

const ImportBankStatementDraftTable = ({
  records,
  selectedRecords,
  onSelectedRecordsChange,
  duplicates,
}: ImportBankStatementDraftTableProps) => {
  const { t } = useTranslation('bankStatements');
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editData, setEditData] = useState<BankStatementPreviewItem | null>(null);
  const [originalData, setOriginalData] = useState<BankStatementPreviewItem | null>(null);
  const { updateItem, deleteItem } = useBankStatementStore();

  const handleEditClick = (item: BankStatementPreviewItem) => {
    setEditData({ ...item });
    setOriginalData(item);
    setEditModalOpened(true);
  };

  const isChanged = Boolean(
    originalData &&
    editData &&
    (originalData.Description !== editData.Description ||
      originalData.TransactionDate !== editData.TransactionDate ||
      originalData.Received !== editData.Received ||
      originalData.Spent !== editData.Spent)
  );

  const { hasReceived, hasSpent } = filledSides(editData);
  // An edited row is valid only when it passes the same rules as the preview.
  const editErrors = editData ? validateImportRow(editData) : [];

  const handleFieldChange = (
    field: 'Description' | 'TransactionDate' | 'Received' | 'Spent',
    value: string
  ) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleSaveChange = () => {
    if (editData) {
      updateItem(editData.rowIndex, {
        ...editData,
        isValid: true,
        errors: [],
        isDateValid: true,
        isReceivedValid: true,
        isSpentValid: true,
        isDescriptionValid: true,
      });
      setEditModalOpened(false);
      setEditData(null);
    }
  };

  const handleDelete = (rowIndex: number) => {
    deleteItem(rowIndex);
  };

  const columns: DataTableColumn<BankStatementPreviewItem>[] = [
    {
      accessor: 'Description',
      title: <Text style={headTableStyle}>{t('draftTable.description')}</Text>,
      render: (element) => (
        <Stack gap={2}>
          <Text
            size="sm"
            fz="var(--jurnal-text-sm)"
            fw={400}
            c={!element.isDescriptionValid ? themeColors.red[6] : themeColors.black[9]}
          >
            {element.Description || '-'}
          </Text>
          {duplicates?.has(element.rowIndex) && (
            <Text fz="var(--jurnal-text-xs)" c="orange.8">
              {t(`importDraft.duplicates.${duplicates.get(element.rowIndex)}`)}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: 'TransactionDate',
      title: (
        <Text style={headTableStyle} ta="center">
          {t('draftTable.date')}
        </Text>
      ),
      render: (element) => (
        <Text
          size="sm"
          fz="var(--jurnal-text-sm)"
          fw={400}
          c={!element.isDateValid ? themeColors.red[6] : themeColors.black[9]}
          ta="center"
        >
          {element.TransactionDate || '-'}
        </Text>
      ),
    },
    {
      accessor: 'Received',
      title: <Text style={headTableStyle}>{t('draftTable.received')}</Text>,
      render: (element) => (
        <Text
          size="sm"
          fz="var(--jurnal-text-sm)"
          fw={400}
          c={!element.isReceivedValid ? themeColors.red[6] : themeColors.black[9]}
        >
          {amountOrRaw(element.Received)}
        </Text>
      ),
    },
    {
      accessor: 'Spent',
      title: <Text style={headTableStyle}>{t('draftTable.sent')}</Text>,
      render: (element) => (
        <Text
          size="sm"
          fz="var(--jurnal-text-sm)"
          fw={400}
          c={!element.isSpentValid ? themeColors.red[6] : themeColors.black[9]}
        >
          {amountOrRaw(element.Spent)}
        </Text>
      ),
    },
    {
      accessor: 'action',
      title: (
        <Text style={headTableStyle} ta="center">
          {t('draftTable.action')}
        </Text>
      ),
      render: (element) => (
        <Group gap="xs" justify="center">
          <Tooltip label={t('draftTable.editTitle')}>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={t('draftTable.editTitle')}
              onClick={() => handleEditClick(element)}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('importDraft.deleteSelected', { count: 1 })}>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={t('importDraft.deleteSelected', { count: 1 })}
              onClick={() => handleDelete(element.rowIndex)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <DataTable
        withTableBorder
        borderRadius="md"
        minHeight={300}
        highlightOnHover
        fz="sm"
        verticalAlign="center"
        columns={columns}
        records={records}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={onSelectedRecordsChange}
        emptyState={
          <EmptyState
            title={t('table.noMatchTitle')}
            description={t('table.noMatchDescription')}
            py={32}
          />
        }
        rowStyle={(record) => ({
          backgroundColor: !record.isValid ? 'var(--mantine-color-red-0)' : 'inherit',
        })}
        styles={{
          root: { borderColor: 'var(--mantine-color-gray-2)' },
        }}
      />

      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title={
          <Text fw={600} c={themeColors.black[9]}>
            {t('draftTable.editTitle')}
          </Text>
        }
        centered
      >
        <Stack gap="md">
          <TextInput
            label={t('draftTable.nameLabel')}
            placeholder={t('draftTable.namePlaceholder')}
            value={editData?.Description || ''}
            onChange={(e) => handleFieldChange('Description', e.currentTarget.value)}
          />
          <DateInput
            label={t('draftTable.dateLabel')}
            placeholder={t('draftTable.datePlaceholder')}
            valueFormat="DD/MM/YYYY"
            rightSection={<IconCalendar size={16} />}
            value={
              editData?.TransactionDate
                ? parse(editData.TransactionDate, 'dd/MM/yyyy', new Date())
                : null
            }
            onChange={(e) => handleFieldChange('TransactionDate', e ? format(e, 'dd/MM/yyyy') : '')}
          />
          <Group grow align="flex-start">
            <TextInput
              label={t('draftTable.received')}
              placeholder="0"
              value={editData?.Received || ''}
              onChange={(e) => handleFieldChange('Received', e.currentTarget.value)}
              disabled={hasSpent}
            />
            <TextInput
              label={t('draftTable.sent')}
              placeholder="0"
              value={editData?.Spent || ''}
              onChange={(e) => handleFieldChange('Spent', e.currentTarget.value)}
              disabled={hasReceived}
            />
          </Group>
          {editErrors.length > 0 && (
            <Stack gap={2}>
              {editErrors.map((error) => (
                <Text key={error.code} fz="var(--jurnal-text-xs)" c="red.7">
                  {t(`importDraft.errors.${error.code}`, { fields: error.detail ?? '' })}
                </Text>
              ))}
            </Stack>
          )}
          <Flex justify="flex-end" gap="sm" mt="md">
            <Button variant="default" onClick={() => setEditModalOpened(false)}>
              {t('draftTable.cancel')}
            </Button>
            <Button
              color="primary"
              onClick={handleSaveChange}
              leftSection={<IconPencil size={16} />}
              disabled={!isChanged || editErrors.length > 0}
            >
              {t('draftTable.save')}
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </>
  );
};

export default ImportBankStatementDraftTable;
