import {
  Alert,
  Button,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconClock, IconPlus, IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { PaymentTerm } from '@/module/settings/domain/paymentTerm';
import type { PaymentTermPage } from '@/module/settings/infrastructure/paymentTermMapper';
import { PaymentTermRow } from './PaymentTermRow';

type Props = {
  data?: PaymentTermPage;
  loading: boolean;
  failed: boolean;
  hasFilters: boolean;
  /** Id of the term whose status is being changed. */
  statusPendingId?: string;
  onRetry: () => void;
  onResetFilters: () => void;
  onAddNew: () => void;
  onPageChange: (page: number) => void;
  onEdit: (term: PaymentTerm) => void;
  onToggleStatus: (term: PaymentTerm) => void;
  onDelete: (term: PaymentTerm) => void;
};

const COLUMN_COUNT = 6;
const SKELETON_ROWS = 5;

/** The term table with its loading, empty, error and page footer states; the frame never unmounts. */
export function PaymentTermTable({
  data,
  loading,
  failed,
  hasFilters,
  statusPendingId,
  onRetry,
  onResetFilters,
  onAddNew,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const header = (label: string, minWidth: number, center?: boolean) => (
    <Table.Th ta={center ? 'center' : undefined} miw={minWidth} style={{ whiteSpace: 'nowrap' }}>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {label}
      </Text>
    </Table.Th>
  );

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={COLUMN_COUNT}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }

    if (failed && items.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMN_COUNT}>
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              <Group justify="space-between" wrap="wrap" gap="sm">
                <Text size="sm">{st('paymentTerm.loadError')}</Text>
                <Button size="xs" variant="default" onClick={onRetry}>
                  {st('paymentTerm.retry')}
                </Button>
              </Group>
            </Alert>
          </Table.Td>
        </Table.Tr>
      );
    }

    if (items.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMN_COUNT} p={0}>
            {hasFilters ? (
              <EmptyState
                title={st('paymentTerm.noResultsTitle')}
                description={st('paymentTerm.noResultsDescription')}
                icon={<IconSearch size={36} stroke={1.5} />}
                actionLabel={st('paymentTerm.resetFilter')}
                onAction={onResetFilters}
                py={48}
              />
            ) : (
              <EmptyState
                title={st('paymentTerm.emptyTitle')}
                description={st('paymentTerm.emptyDescription')}
                icon={<IconClock size={36} stroke={1.5} />}
                actionLabel={st('paymentTerm.createFirst')}
                actionIcon={<IconPlus size={14} />}
                onAction={onAddNew}
                py={48}
              />
            )}
          </Table.Td>
        </Table.Tr>
      );
    }

    return items.map((term) => (
      <PaymentTermRow
        key={term.id}
        term={term}
        statusPending={statusPendingId === term.id}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
    ));
  };

  const totalPages = pagination ? Math.max(pagination.totalPages, 1) : 1;

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={744}>
          <Table verticalSpacing="sm" horizontalSpacing="sm" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {header(st('paymentTerm.colName'), 150)}
                {header(st('paymentTerm.colAppliesTo'), 120)}
                {header(st('paymentTerm.colPayment'), 110)}
                {header(st('paymentTerm.colBilling'), 180)}
                {header(st('paymentTerm.colStatus'), 112)}
                {header(st('common.actions'), 72, true)}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderBody()}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {pagination && items.length > 0 && !loading && (
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="xs" c="dimmed">
            {st('paymentTerm.paginationShowing')}{' '}
            <Text span fw={600} c="dark.7">
              {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
            </Text>{' '}
            -{' '}
            <Text span fw={600} c="dark.7">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </Text>{' '}
            {st('paymentTerm.paginationOf')}{' '}
            <Text span fw={600} c="dark.7">
              {pagination.total}
            </Text>{' '}
            {st('paymentTerm.paginationUnits')}
          </Text>
          {totalPages > 1 && (
            <Pagination
              value={pagination.page}
              onChange={onPageChange}
              total={totalPages}
              radius="md"
              size="sm"
              color="primary"
            />
          )}
        </Group>
      )}
    </Stack>
  );
}

export default PaymentTermTable;
