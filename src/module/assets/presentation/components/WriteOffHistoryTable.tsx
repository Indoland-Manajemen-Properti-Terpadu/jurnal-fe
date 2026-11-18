import { useState } from 'react';
import {
  Anchor,
  Badge,
  Group,
  Pagination,
  ScrollArea,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconFileCertificate, IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { WriteOffStatus } from '@/module/assets/domain/writeOff';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { WRITE_OFF_STATUS_COLOR } from '@/module/assets/presentation/components/writeOffStatusMeta';
import { useWriteOffs } from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { useDecimalPrecision } from '@/module/settings';
import { routes } from '@/router/routes';

const PAGE_SIZE = 10;
const COLUMNS = 6;
const STATUS_TABS: (WriteOffStatus | 'all')[] = ['all', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'];

/** Every report of the site, filterable by status and number. */
export function WriteOffHistoryTable() {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const [status, setStatus] = useState<WriteOffStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debounced] = useDebouncedValue(search.trim(), 300);
  const list = useWriteOffs({
    page,
    limit: PAGE_SIZE,
    status: status === 'all' ? undefined : status,
    search: debounced || undefined,
  });
  const rows = list.data?.items ?? [];
  const totalPages = list.data?.pagination.totalPages ?? 0;

  const body = () => {
    if (list.isLoading) {
      return Array.from({ length: 3 }, (_, index) => (
        <Table.Tr key={index}>
          <Table.Td colSpan={COLUMNS}>
            <Skeleton h={18} />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (rows.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMNS}>
            <EmptyState
              icon={<IconFileCertificate size={28} />}
              title={t('historyEmptyTitle')}
              description={t('historyEmptyBody')}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    return rows.map((report) => (
      <Table.Tr key={report.id}>
        <Table.Td>
          <Anchor
            component={Link}
            to={routes.assets.writeOffDetail.replace(':id', report.id)}
            fw={600}
            size="sm"
          >
            {report.number}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Text size="sm" lineClamp={1}>
            {report.snapshot.name}
          </Text>
          <Text size="xs" c="dimmed">
            {report.snapshot.code}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{t(`type_${report.type}`)}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{formatAssetDate(report.incidentDate)}</Text>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatAssetMoney(report.proceedsAmount, precision)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge
            size="sm"
            radius="sm"
            variant="light"
            color={WRITE_OFF_STATUS_COLOR[report.status]}
          >
            {t(`status_${report.status}`)}
          </Badge>
        </Table.Td>
      </Table.Tr>
    ));
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Tabs
          value={status}
          onChange={(next) => {
            setStatus((next as WriteOffStatus | 'all') ?? 'all');
            setPage(1);
          }}
          color="primary"
          variant="pills"
          radius="md"
        >
          <Tabs.List>
            {STATUS_TABS.map((value) => (
              <Tabs.Tab key={value} value={value}>
                {value === 'all' ? t('historyAll') : t(`status_${value}`)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <TextInput
          placeholder={t('historySearch')}
          aria-label={t('historySearch')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
          w={{ base: '100%', sm: 260 }}
          radius="md"
        />
      </Group>
      <ScrollArea type="auto">
        <Table verticalSpacing="sm" highlightOnHover miw={720}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('colNumber')}</Table.Th>
              <Table.Th>{t('colAsset')}</Table.Th>
              <Table.Th>{t('colType')}</Table.Th>
              <Table.Th>{t('colDate')}</Table.Th>
              <Table.Th ta="right">{t('colReceived')}</Table.Th>
              <Table.Th>{t('colStatus')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{body()}</Table.Tbody>
        </Table>
      </ScrollArea>
      {totalPages > 1 && (
        <Group justify="flex-end">
          <Pagination value={page} onChange={setPage} total={totalPages} radius="md" size="sm" />
        </Group>
      )}
    </Stack>
  );
}

export default WriteOffHistoryTable;
