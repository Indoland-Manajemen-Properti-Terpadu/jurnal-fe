import { Badge, Stack, Table, Text } from '@mantine/core';
import { IconClipboardText, IconFileDescription, IconListDetails } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const DASH = '-';

/** The facts, the IOM and the lines of a request. */
export const RequestSummaryCard = ({ request }: Readonly<{ request: PurchaseRequest }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const { requester } = request;

  return (
    <Stack gap="lg">
      <SectionCard
        icon={IconClipboardText}
        title={t('requests.detail.infoTitle')}
        subtitle={t('requests.detail.infoSubtitle')}
      >
        <InfoGrid
          items={[
            { label: t('common.purpose'), value: request.purpose, span: 2 },
            {
              label: t('requests.detail.requester'),
              value: requester ? (
                <>
                  {requester.name}
                  {requester.title && (
                    <Text size="xs" c="dimmed">
                      {requester.title}
                    </Text>
                  )}
                </>
              ) : (
                DASH
              ),
            },
            { label: t('common.department'), value: request.department?.name },
            {
              label: t('requests.form.date'),
              value: formatDay(request.date, currentLanguage),
            },
            {
              label: t('requests.form.requiredDate'),
              value: formatDay(request.requiredDate, currentLanguage),
            },
            { label: t('common.memo'), value: request.memo, span: 2 },
          ]}
        />
      </SectionCard>

      <SectionCard
        icon={IconFileDescription}
        title={t('requests.detail.iomTitle')}
        subtitle={t('requests.detail.iomSubtitle')}
      >
        <InfoGrid
          items={[
            { label: t('requests.form.iomNumber'), value: request.iom.number },
            {
              label: t('requests.form.iomDate'),
              value: formatDay(request.iom.date, currentLanguage),
            },
          ]}
        />
      </SectionCard>

      <SectionCard
        icon={IconListDetails}
        title={t('requests.detail.itemsTitle')}
        subtitle={t('requests.detail.itemsCount', { count: request.items.length })}
      >
        <Table.ScrollContainer minWidth={520}>
          <Table verticalSpacing="sm">
            <Table.Thead bg="var(--jurnal-color-surface-hover)">
              <Table.Tr>
                <Table.Th>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t('requests.form.col.item')}
                  </Text>
                </Table.Th>
                <Table.Th ta="right">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t('requests.form.col.quantity')}
                  </Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {request.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={500} component="div">
                      {item.product?.name ?? (item.description || DASH)}
                      <Badge ml={8} size="xs" variant="light" color="gray" radius="sm">
                        {t(`requests.kind.${item.kind}`)}
                      </Badge>
                    </Text>
                    {item.product && item.description && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                    {item.specification && (
                      <Text size="xs" c="dimmed">
                        {item.specification}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td
                    ta="right"
                    style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                  >
                    <Text size="sm">
                      {formatQuantity(item.quantity)} {item.unit?.name ?? ''}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Text size="xs" c="dimmed">
          {t('requests.detail.noPriceHint')}
        </Text>
      </SectionCard>
    </Stack>
  );
};
