import React from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconChevronLeft, IconSearch } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n';
import type {
  ImportFilter,
  ImportPreviewRow,
} from '@/module/chart-of-accounts/domain/importPreview';

interface ImportPreviewStepProps {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: ImportPreviewRow[];
  filter: ImportFilter;
  onFilterChange: (filter: ImportFilter) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isCommitting: boolean;
  onBack: () => void;
  onCommit: () => void;
}

/** Step 2 of the import wizard: validation summary, filters and the preview table. */
export const ImportPreviewStep: React.FC<ImportPreviewStepProps> = ({
  totalRows,
  validCount,
  invalidCount,
  rows,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  isCommitting,
  onBack,
  onCommit,
}) => {
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Stack gap="md">
      {/* Metrics Bar */}
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="xs">
          <Badge color="gray" variant="light" size="sm">
            {t('settings.import.totalRows', { count: totalRows })}
          </Badge>
          <Badge color="teal" variant="filled" size="sm">
            {t('settings.import.readyCount', { count: validCount })}
          </Badge>
          {invalidCount > 0 && (
            <Badge color="red" variant="filled" size="sm">
              {t('settings.import.wrongCount', { count: invalidCount })}
            </Badge>
          )}
        </Group>

        <SegmentedControl
          size="xs"
          radius="md"
          value={filter}
          onChange={(val) => onFilterChange(val as ImportFilter)}
          data={[
            { label: t('settings.import.filterAll'), value: 'all' },
            { label: t('settings.import.filterValid', { count: validCount }), value: 'valid' },
            { label: t('settings.import.filterError', { count: invalidCount }), value: 'invalid' },
          ]}
        />
      </Group>

      {/* Error Notification Alert */}
      {invalidCount > 0 && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="orange"
          variant="light"
          radius="md"
          title={t('settings.import.warnTitle')}
        >
          {t('settings.import.warnBody', { wrong: invalidCount, valid: validCount })}
        </Alert>
      )}

      {/* Search Filter */}
      <TextInput
        placeholder={t('settings.import.searchPlaceholder')}
        leftSection={<IconSearch size={15} color="var(--mantine-color-dimmed)" />}
        size="sm"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
      />

      {/* Preview Table */}
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <ScrollArea.Autosize mah={320} type="always">
          <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
            <Table.Thead bg="gray.1">
              <Table.Tr>
                <Table.Th style={{ width: 130 }}>{t('settings.import.colNumber')}</Table.Th>
                <Table.Th>{t('settings.import.colName')}</Table.Th>
                <Table.Th style={{ width: 160 }}>{t('settings.import.colCategory')}</Table.Th>
                <Table.Th style={{ width: 130, textAlign: 'right' }}>
                  {t('settings.import.colBalance')}
                </Table.Th>
                <Table.Th style={{ width: 120, textAlign: 'center' }}>
                  {t('settings.import.colStatus')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                    <Text size="xs" c="dimmed">
                      {t('settings.import.noMatch')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows.map((row, idx) => (
                  <Table.Tr
                    key={`import-row-${idx}`}
                    style={{
                      backgroundColor: row.isValid ? undefined : 'var(--mantine-color-red-0)',
                    }}
                  >
                    <Table.Td fw={700} c={row.isValid ? 'dark.8' : 'red.9'}>
                      {row.item.accountNumber || '-'}
                    </Table.Td>
                    <Table.Td fw={600} c="dark.8">
                      {row.item.name || '-'}
                    </Table.Td>
                    <Table.Td c="dimmed">
                      {row.item.categoryName || row.item.categoryID || '-'}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }} fw={600}>
                      {formatCurrency(Number(row.item.amount) || 0)}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      {row.isValid ? (
                        <Badge color="teal" size="xs" variant="light">
                          {t('settings.import.valid')}
                        </Badge>
                      ) : (
                        <Tooltip
                          label={
                            row.errors && row.errors.length > 0
                              ? row.errors.join(', ')
                              : t('settings.import.invalidFormat')
                          }
                          withArrow
                          multiline
                          w={220}
                        >
                          <Badge
                            color="red"
                            size="xs"
                            variant="filled"
                            style={{ cursor: 'pointer' }}
                          >
                            {t('settings.import.error')}
                          </Badge>
                        </Tooltip>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      </Paper>

      <Group justify="space-between" align="center" mt="sm">
        <Button
          variant="default"
          size="sm"
          radius="md"
          leftSection={<IconChevronLeft size={16} />}
          onClick={onBack}
          disabled={isCommitting}
        >
          {t('settings.import.changeFile')}
        </Button>

        <Button
          color="primary"
          size="sm"
          radius="md"
          rightSection={<IconCheck size={16} />}
          onClick={onCommit}
          loading={isCommitting}
          disabled={validCount === 0}
        >
          {t('settings.import.commit', { count: validCount })}
        </Button>
      </Group>
    </Stack>
  );
};
