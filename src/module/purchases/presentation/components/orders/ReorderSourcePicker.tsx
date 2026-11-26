import {
  Alert,
  Anchor,
  Group,
  Loader,
  Pagination,
  Paper,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { ReorderSource } from '@/module/purchases/domain/purchaseReorder';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { routes } from '@/router/routes';

interface ReorderSourcePickerProps {
  sources: ReorderSource[];
  page: number;
  totalPages: number;
  loading: boolean;
  error: unknown;
  onPage: (page: number) => void;
  onPick: (id: string) => void;
}

export const ReorderSourcePicker = ({
  sources,
  page,
  totalPages,
  loading,
  error,
  onPage,
  onPick,
}: Readonly<ReorderSourcePickerProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const describe = usePurchaseErrorMessage();
  return (
    <>
      {loading && (
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      )}
      {Boolean(error) && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {describe(error)}
        </Alert>
      )}
      {!loading && !error && sources.length === 0 && (
        <Text c="dimmed" ta="center">
          {t('orders.reorder.noSources')}
        </Text>
      )}
      {sources.map((candidate) => {
        const card = (
          <Paper withBorder radius="md" p="md" bg={candidate.canReorder ? 'white' : 'gray.0'}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text fw={700} c={candidate.canReorder ? 'primary.8' : 'dimmed'}>
                {candidate.number}
              </Text>
              <Text fw={600}>{formatAmount(candidate.total)}</Text>
            </Group>
            <Text size="sm" mt={4}>
              {candidate.vendorName} · {candidate.itemNames.join(', ')}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDay(candidate.date, currentLanguage)}
            </Text>
            {!candidate.canReorder && (
              <Text size="sm" c="orange.8" mt="xs">
                {candidate.reorderBlockReason || t('orders.reorder.blocked')}{' '}
                <Anchor component={Link} to={routes.purchases.requestAdd}>
                  {t('orders.reorder.newRequest')}
                </Anchor>
              </Text>
            )}
          </Paper>
        );
        return candidate.canReorder ? (
          <UnstyledButton
            key={candidate.id}
            onClick={() => onPick(candidate.id)}
            style={{ width: '100%' }}
          >
            {card}
          </UnstyledButton>
        ) : (
          <div key={candidate.id}>{card}</div>
        );
      })}
      {totalPages > 1 && <Pagination total={totalPages} value={page} onChange={onPage} />}
    </>
  );
};
