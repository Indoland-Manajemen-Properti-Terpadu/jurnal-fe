import { Alert, Box, Divider, Drawer, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { voucherBreakdown } from '@/module/petty-cash/domain/pettyCashView';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { VoucherActions } from '@/module/petty-cash/presentation/components/VoucherActions';
import { VoucherAttachmentsPanel } from '@/module/petty-cash/presentation/components/VoucherAttachmentsPanel';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { usePettyCashVoucher } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  fund: PettyCashFund;
  /** Kept while the drawer slides closed, so the body does not blank out during the transition. */
  voucherId: string | null;
  opened: boolean;
  onClose: () => void;
}

const KNOWN_WARNING_CODES = ['DUPLICATE_RECEIPT_NUMBER'];

const money = (amount: number) => formatCurrency(amount, false);

function Field({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  if (!value) return null;
  return (
    <Box>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={600}>
        {value}
      </Text>
    </Box>
  );
}

const warningText = (
  warning: { code: string; message: string },
  language: string,
  t: (key: string) => string
) => {
  if (language === 'id' && warning.message) return warning.message;
  return KNOWN_WARNING_CODES.includes(warning.code)
    ? t(`drawer.warningCodes.${warning.code}`)
    : t('drawer.warningGeneric');
};

export function VoucherDetailDrawer({ fund, voucherId, opened, onClose }: Readonly<Props>) {
  const { t, currentLanguage } = useTranslation('pettyCash');
  const query = usePettyCashVoucher(voucherId ?? undefined);
  const voucher = query.data;
  const totals = voucher ? voucherBreakdown(voucher.lines, voucher.totalAmount) : null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={
        <Group gap="sm">
          <Text fw={700}>{voucher?.voucherNumber ?? t('drawer.title')}</Text>
          {voucher && <PettyCashStatusBadge kind="voucher" status={voucher.status} />}
        </Group>
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      {query.isLoading && (
        <Stack gap="sm">
          <Skeleton height={20} />
          <Skeleton height={20} width="70%" />
          <Skeleton height={120} />
        </Stack>
      )}

      {query.isError && (
        <QueryErrorState
          title={t('drawer.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      {voucher && totals && (
        <Stack gap="lg">
          {voucher.warnings.length > 0 && (
            <Alert
              color="orange"
              variant="light"
              radius="md"
              icon={<IconAlertTriangle size={16} />}
              title={t('drawer.warnings')}
            >
              {voucher.warnings.map((warning) => (
                <Text key={`${warning.code}-${warning.message}`} size="sm">
                  {warningText(warning, currentLanguage, t)}
                </Text>
              ))}
            </Alert>
          )}

          <Group grow align="flex-start">
            <Field label={t('drawer.beneficiary')} value={voucher.beneficiary} />
            <Field label={t('drawer.date')} value={dateFormatV1(voucher.transactionDate)} />
          </Group>
          <Group grow align="flex-start">
            <Field label={t('drawer.receipt')} value={voucher.receiptNumber} />
            <Field label={t('drawer.taxInvoice')} value={voucher.taxInvoiceNumber} />
          </Group>
          <Field label={t('drawer.vendorTaxId')} value={voucher.vendorTaxId} />
          <Field label={t('drawer.description')} value={voucher.description} />

          <Box>
            <Text fw={700} mb="xs">
              {t('drawer.lines')}
            </Text>
            <Table.ScrollContainer minWidth={420}>
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('drawer.lineAccount')}</Table.Th>
                    <Table.Th ta="right">{t('drawer.lineNet')}</Table.Th>
                    <Table.Th ta="right">{t('drawer.lineTax')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {voucher.lines.map((line) => (
                    <Table.Tr key={line.lineNo}>
                      <Table.Td>
                        {line.expenseAccount && (
                          <Text size="sm" fw={600}>
                            {line.expenseAccount.accountNumber} · {line.expenseAccount.name}
                          </Text>
                        )}
                        {line.description && (
                          <Text size="xs" c="dimmed">
                            {line.description}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">{money(line.amount)}</Table.Td>
                      <Table.Td ta="right">
                        {line.tax ? (
                          <>
                            {money(line.taxAmount)}
                            <Text size="xs" c="dimmed">
                              {line.tax.name}
                            </Text>
                          </>
                        ) : (
                          '-'
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Stack gap={4} mt="sm">
              {totals.reconciles && (
                <>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t('drawer.net')}
                    </Text>
                    <Text size="sm">{money(totals.net)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {t('drawer.tax')}
                    </Text>
                    <Text size="sm">{money(totals.tax)}</Text>
                  </Group>
                </>
              )}
              <Divider />
              <Group justify="space-between">
                <Text fw={700}>{t('drawer.total')}</Text>
                <Text fw={700}>{money(voucher.totalAmount)}</Text>
              </Group>
              {totals.reconciles && (
                <Text size="xs" c="dimmed">
                  {t('drawer.taxNote')}
                </Text>
              )}
            </Stack>
          </Box>

          <VoucherAttachmentsPanel voucher={voucher} fund={fund} />

          <Box>
            <Text fw={700} mb="xs">
              {t('drawer.history')}
            </Text>
            <Stack gap="xs">
              <Field label={t('drawer.createdBy')} value={voucher.requestedBy?.name} />
              <Field
                label={t('drawer.submittedAt')}
                value={voucher.submittedAt ? dateFormatV1(voucher.submittedAt) : null}
              />
              <Field label={t('drawer.approvedBy')} value={voucher.approvedBy?.name} />
              {/* The backend keeps the old reasons after a voucher leaves REJECTED or VOID. */}
              <Field
                label={t('drawer.rejectedReason')}
                value={voucher.status === 'REJECTED' ? voucher.rejectedReason : null}
              />
              <Field
                label={t('drawer.voidReason')}
                value={voucher.status === 'VOID' ? voucher.voidReason : null}
              />
            </Stack>
          </Box>
          <VoucherActions voucher={voucher} fund={fund} onChanged={onClose} />
        </Stack>
      )}
    </Drawer>
  );
}
