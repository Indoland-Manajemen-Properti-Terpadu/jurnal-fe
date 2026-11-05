import { Badge, Stack, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

/** Header facts and the item lines of a request. */
export const RequestSummaryCard = ({ request }: Readonly<{ request: PurchaseRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <Stack gap="lg">
      <SectionCard icon={IconClipboardText} title={t('requests.detail.infoTitle')}>
        <InfoGrid
          items={[
            { label: t('requests.form.date'), value: formatDay(request.date, currentLanguage) },
            {
              label: t('requests.form.requiredDate'),
              value: formatDay(request.requiredDate, currentLanguage),
            },
            { label: t('common.department'), value: request.department },
            { label: t('common.purpose'), value: request.purpose },
            {
              label: t('requests.detail.procurement'),
              value: (
                <Badge variant="light" color="gray" radius="sm">
                  {t(`requests.form.mode.${request.mode}`)}
                </Badge>
              ),
            },
            { label: t('common.memo'), value: request.memo },
          ]}
        />
      </SectionCard>

      <SectionCard
        icon={IconListDetails}
        title={t('requests.detail.itemsTitle')}
        subtitle={t('requests.detail.itemsCount', { count: request.items.length })}
      >
        <Table.ScrollContainer minWidth={420}>
          <Table verticalSpacing="sm">
            <Table.Thead bg="var(--jurnal-color-surface-hover)">
              <Table.Tr>
                {[
                  ['product', undefined],
                  ['quantity', 'right'],
                ].map(([key, align]) => (
                  <Table.Th key={key} ta={align as 'right' | undefined}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {t(`common.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {request.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item.product?.name ?? (item.description || '-')}
                    </Text>
                    {item.product && item.description && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td
                    ta="right"
                    style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                  >
                    <Text size="sm">
                      {formatQuantity(item.quantity)} {item.unitName ?? ''}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </SectionCard>
    </Stack>
  );
};
