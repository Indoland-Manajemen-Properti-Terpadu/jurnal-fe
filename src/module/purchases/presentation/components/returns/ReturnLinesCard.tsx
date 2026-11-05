import { Table, Text } from '@mantine/core';
import { IconListDetails } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ReturnItem } from '@/module/purchases/domain/purchaseDocuments';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

export const ReturnLinesCard = ({ items }: Readonly<{ items: ReturnItem[] }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard icon={IconListDetails} title={t('returns.detail.linesTitle')}>
      <Table.ScrollContainer minWidth={420}>
        <Table verticalSpacing="sm" horizontalSpacing="sm">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {(['item', 'quantity', 'amount'] as const).map((key) => (
                <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`returns.detail.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text size="sm">{item.product?.name ?? item.description}</Text>
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">{formatQuantity(item.quantity)}</Text>
                </Table.Td>
                <Table.Td
                  ta="right"
                  style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                >
                  <Text size="sm" fw={500}>
                    {formatAmount(item.amount)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </SectionCard>
  );
};
