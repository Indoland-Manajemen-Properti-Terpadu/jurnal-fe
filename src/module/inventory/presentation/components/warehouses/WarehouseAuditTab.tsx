import { Alert, Button, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconHistory } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import type { AuditEntry } from '@/module/inventory/domain/warehouse';
import { resolveAuditChange, type AuditLookups } from '@/module/inventory/domain/warehouseAudit';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  entries: AuditEntry[];
  loading: boolean;
  failed: boolean;
  people: Record<string, string>;
  products: Record<string, string>;
  onRetry: () => void;
};

const header = (label: string) => (
  <Table.Th style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

/** Who changed what and when, with names where the service logs ids. */
export function WarehouseAuditTab({
  entries,
  loading,
  failed,
  people,
  products,
  onRetry,
}: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const lookups: AuditLookups = {
    people,
    products,
    unknownPerson: t('detail.audit.unknownPerson'),
  };

  /** The translation of a key, or the fallback when the key is not translated (`t` answers the path). */
  const translated = (key: string, fallback: string) => {
    const label = t(key);
    return label === `warehouses.${key}` ? fallback : label;
  };

  const fieldLabel = (field: string) => translated(`detail.audit.fields.${field}`, field);

  const valueText = (field: string, value: string | null) => {
    if (value === null) return t('detail.audit.blank');
    if (value === 'true') return t('detail.audit.yes');
    if (value === 'false') return t('detail.audit.no');
    if (field === 'status') return translated(`detail.audit.statusValues.${value}`, value);
    return value;
  };

  const lineOf = (entry: AuditEntry) =>
    entry.changes.map((change, index) => {
      const resolved = resolveAuditChange(change, lookups);
      const params = {
        field: fieldLabel(resolved.field),
        from: valueText(resolved.field, resolved.from),
        to: valueText(resolved.field, resolved.to),
      };
      return (
        <Text key={`${entry.id}-${index}`} size="sm">
          {resolved.subject
            ? t('detail.audit.changeFor', { ...params, subject: resolved.subject })
            : t('detail.audit.change', params)}
        </Text>
      );
    });

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: 3 }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={3}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (failed && entries.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={3}>
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              <Group justify="space-between" wrap="wrap" gap="sm">
                <Text size="sm">{t('loadFailed.title')}</Text>
                <Button size="xs" variant="default" onClick={onRetry}>
                  {t('loadFailed.retry')}
                </Button>
              </Group>
            </Alert>
          </Table.Td>
        </Table.Tr>
      );
    }
    if (entries.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={3} p={0}>
            <EmptyState
              title={t('detail.audit.empty')}
              description=""
              icon={<IconHistory size={36} stroke={1.5} />}
              py={40}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    return entries.map((entry) => (
      <Table.Tr key={entry.id}>
        <Table.Td style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
          <Text size="sm">{dateFormatV1(entry.at, 'D MMM YYYY, HH.mm')}</Text>
        </Table.Td>
        <Table.Td style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
          <Text size="sm">{entry.userName || '-'}</Text>
        </Table.Td>
        <Table.Td>
          <Stack gap={2}>{lineOf(entry)}</Stack>
        </Table.Td>
      </Table.Tr>
    ));
  };

  return (
    <DataTableFrame minWidth={560} hover={false}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {header(t('detail.audit.time'))}
          {header(t('detail.audit.user'))}
          {header(t('detail.audit.changes'))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderBody()}</Table.Tbody>
    </DataTableFrame>
  );
}
