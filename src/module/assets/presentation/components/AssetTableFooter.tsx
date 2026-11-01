import { Group, Pagination, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

export type AssetTableFooterProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function AssetTableFooter({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: Readonly<AssetTableFooterProps>) {
  const { t } = useTranslation('assets');
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <Group justify="space-between" align="center" wrap="wrap" mt="xs">
      <Text size="xs" c="dimmed">
        {t('paginationShowing')}{' '}
        <Text span fw={600} c="dark.7">
          {Math.min((page - 1) * pageSize + 1, totalItems)}
        </Text>{' '}
        -{' '}
        <Text span fw={600} c="dark.7">
          {Math.min(page * pageSize, totalItems)}
        </Text>{' '}
        {t('paginationOf')}{' '}
        <Text span fw={600} c="dark.7">
          {totalItems}
        </Text>{' '}
        {t('paginationUnits')}
      </Text>

      {totalPages > 1 && (
        <Pagination
          value={page}
          onChange={onPageChange}
          total={totalPages}
          radius="md"
          size="sm"
          color="primary"
        />
      )}
    </Group>
  );
}

export default AssetTableFooter;
