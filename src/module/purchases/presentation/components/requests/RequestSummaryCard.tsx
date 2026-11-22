import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Anchor, Group, Stack, Table, Text } from '@mantine/core';
import {
  IconClipboardText,
  IconFileDescription,
  IconListDetails,
  IconPaperclip,
} from '@tabler/icons-react';
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
        label
        flush
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
            {
              label: t('requests.detail.route'),
              value: request.procurement.route
                ? t(`procurement.route.${request.procurement.route}`)
                : t('requests.detail.routePending'),
            },
            { label: t('requests.detail.requesterNote'), value: request.memo, span: 2 },
          ]}
        />
      </SectionCard>

      <SectionCard
        icon={IconFileDescription}
        label
        flush
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
        {request.iom.attachments.length > 0 && (
          <Stack
            gap={6}
            px="lg"
            py="md"
            style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
          >
            {request.iom.attachments.map((file) => (
              <Group key={file.id} gap={8} wrap="nowrap">
                <IconPaperclip size={14} />
                <Anchor href={file.url} target="_blank" rel="noreferrer" size="sm" truncate>
                  {file.name}
                </Anchor>
              </Group>
            ))}
          </Stack>
        )}
      </SectionCard>

      <SectionCard
        icon={IconListDetails}
        flush
        title={t('requests.detail.itemsTitle')}
        subtitle={t('requests.detail.itemsCount', { count: request.items.length })}
      >
        <Table.ScrollContainer type="native" minWidth={520}>
          <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                <Table.Th>
                  <Text size="xs" fw={700} c="dark.7">
                    {t('requests.form.col.item')}
                  </Text>
                </Table.Th>
                <Table.Th ta="right">
                  <Text size="xs" fw={700} c="dark.7">
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
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t(`requests.kind.${item.kind}`)}
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
        <Text
          size="xs"
          c="dimmed"
          px="lg"
          py="sm"
          style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
        >
          {t('requests.detail.noPriceHint')}
        </Text>
      </SectionCard>
    </Stack>
  );
};
