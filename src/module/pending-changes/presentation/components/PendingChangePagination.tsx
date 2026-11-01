import { Group, Pagination, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PendingChangePagination as PaginationInfo } from '../../domain/pendingChange';

type PendingChangePaginationProps = {
  pagination: PaginationInfo;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export default function PendingChangePagination({
  pagination,
  page,
  pageSize,
  onChange,
}: PendingChangePaginationProps) {
  const { t } = useTranslation('pendingChanges');

  return (
    <Group justify="space-between" mt="md" wrap="wrap">
      <Text size="xs" c="dimmed">
        {t('showingRange', {
          from: (page - 1) * pageSize + 1,
          to: Math.min(page * pageSize, pagination.total),
          total: pagination.total,
        })}
      </Text>
      <Pagination
        total={pagination.totalPages}
        value={page}
        onChange={onChange}
        size="sm"
        radius="md"
        color="primary"
      />
    </Group>
  );
}
