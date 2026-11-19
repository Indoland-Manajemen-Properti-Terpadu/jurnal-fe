import { Anchor, Badge, Divider, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleReturn } from '@/module/sales/domain/saleReturn';

const num = { fontVariantNumeric: 'tabular-nums' } as const;

const TotalRow = ({ label, value, strong }: { label: string; value: number; strong?: boolean }) => (
  <Group justify="space-between">
    <Text size="sm" fw={strong ? 700 : 400} c={strong ? undefined : 'dimmed'}>
      {label}
    </Text>
    <Text size="sm" fw={strong ? 700 : 500} style={num}>
      {formatIDR(value)}
    </Text>
  </Group>
);

/** The lines a return takes back and how the total is worked out. */
export function ReturnLinesCard({ ret }: Readonly<{ ret: SaleReturn }>) {
  const { t } = useTranslation('salesReturns');
  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group justify="space-between" mb="md">
        <Text fw={700}>{t('detail.linesTitle')}</Text>
        <Text size="sm" c="dimmed">
          {t('detail.linesCount', { count: String(ret.items.length) })}
        </Text>
      </Group>
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th w={50}>{t('detail.colNo')}</Table.Th>
              <Table.Th>{t('detail.colItem')}</Table.Th>
              <Table.Th ta="right">{t('detail.colQuantity')}</Table.Th>
              <Table.Th ta="right">{t('detail.colTax')}</Table.Th>
              <Table.Th ta="right">{t('detail.colAmount')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ret.items.map((item, index) => (
              <Table.Tr key={item.id || index}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {item.product?.name || item.description || '–'}
                  </Text>
                  {item.description && item.description !== item.product?.name && (
                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right" style={num}>
                  {item.quantity}
                </Table.Td>
                <Table.Td ta="right" style={num}>
                  {item.taxAmount ? formatIDR(item.taxAmount) : '–'}
                </Table.Td>
                <Table.Td ta="right" style={num}>
                  {formatIDR(item.amount)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Divider my="md" />
      <Stack gap={6} maw={360} ml="auto">
        <TotalRow label={t('detail.net')} value={ret.net} />
        {ret.discountAmount > 0 && (
          <TotalRow label={t('detail.discount')} value={ret.discountAmount} />
        )}
        {ret.taxAmount > 0 && <TotalRow label={t('detail.tax')} value={ret.taxAmount} />}
        {ret.withholdingAmount > 0 && (
          <TotalRow label={t('detail.withholding')} value={ret.withholdingAmount} />
        )}
        <Divider />
        <TotalRow strong label={t('detail.total')} value={ret.finalAmount} />
        {ret.appliedToInvoice > 0 && (
          <TotalRow label={t('detail.appliedToInvoice')} value={ret.appliedToInvoice} />
        )}
      </Stack>
    </Paper>
  );
}

interface ReturnCreditCardProps {
  ret: SaleReturn;
  /** Whether the user may take a use of credit back. */
  canCancelApplication: boolean;
  onCancelApplication: (applicationId: string) => void;
}

/** What is left of the credit, and every use of it with a way to take an unused one back. */
export function ReturnCreditCard({
  ret,
  canCancelApplication,
  onCancelApplication,
}: Readonly<ReturnCreditCardProps>) {
  const { t } = useTranslation('salesReturns');
  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Text fw={700} mb="sm">
        {t('detail.creditTitle')}
      </Text>
      <Stack gap={6}>
        <TotalRow strong label={t('detail.creditRemaining')} value={ret.creditRemaining} />
        <TotalRow label={t('detail.creditUsed')} value={ret.creditUsed} />
        <TotalRow label={t('detail.refunded')} value={ret.refundAmount} />
      </Stack>
      <Divider my="md" />
      <Text size="sm" fw={600} mb="xs">
        {t('detail.applicationsTitle')}
      </Text>
      {ret.applications.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('detail.applicationsEmpty')}
        </Text>
      ) : (
        <Stack gap="xs">
          {ret.applications.map((application) => (
            <Group key={application.id} justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={0}>
                <Text size="sm" fw={600}>
                  {application.saleNumber || '–'}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatDate(application.appliedAt)}
                </Text>
              </Stack>
              <Stack gap={2} align="flex-end">
                <Text size="sm" style={num}>
                  {formatIDR(application.amount)}
                </Text>
                {application.voided ? (
                  <Badge size="xs" color="gray" variant="light">
                    {t('detail.applicationVoided')}
                  </Badge>
                ) : (
                  canCancelApplication && (
                    <Anchor
                      component="button"
                      type="button"
                      size="xs"
                      c="red.7"
                      onClick={() => onCancelApplication(application.id)}
                    >
                      {t('actions.cancelApplication')}
                    </Anchor>
                  )
                )}
              </Stack>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export const ReturnMemoCard = ({ ret }: Readonly<{ ret: SaleReturn }>) => {
  const { t } = useTranslation('salesReturns');
  if (!ret.memo) return null;
  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Text fw={700} mb={4}>
        {t('detail.memo')}
      </Text>
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {ret.memo}
      </Text>
    </Paper>
  );
};
