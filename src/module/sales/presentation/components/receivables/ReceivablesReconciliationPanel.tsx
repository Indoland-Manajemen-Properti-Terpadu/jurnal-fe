import { Alert, Badge, Button, Divider, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { ReceivablesOverview } from '@/module/sales/domain/saleReceivables';
import { formatCount, formatDate } from '@/module/sales/domain/saleFormat';
import { routes } from '@/router/routes';
import { formatMoneyAt } from '@/utils/formatMoney';

export function ReceivablesReconciliationPanel({
  overview,
  loading,
  asOf,
}: Readonly<{
  overview?: ReceivablesOverview;
  loading: boolean;
  asOf: string;
}>) {
  const { t } = useTranslation('salesReceivables');
  const reconciliation = overview?.reconciliation;
  const matched = reconciliation?.status === 'MATCHED';
  const precision = overview?.precision ?? 2;
  const isToday = asOf === overview?.asOf;
  const forward = reconciliation?.forward;
  const receivableHead = reconciliation?.accounts.find((account) => account.accountNumber === '1-10100');
  const ledgerPath = receivableHead
    ? routes.accountLedger.nonCashBank.replace(':idAccount', receivableHead.id)
    : routes.reports.generalLedger;

  return (
    <Paper withBorder radius="lg" p="lg" bg="white" h="100%">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
          <div>
            <Title order={3} fz="sm">
              {t('reconciliation.title')}
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              {t('reconciliation.dateLabel', { date: formatDate(asOf) })}
            </Text>
          </div>
          <Button
            component={Link}
            to={ledgerPath}
            variant="default"
            size="compact-xs"
            rightSection={<IconChevronRight size={13} />}
            radius="xl"
          >
            {t('reconciliation.ledgerLink')}
          </Button>
        </Group>

        {loading ? (
          <Stack gap="sm">
            <Skeleton height={36} width="65%" />
            <Skeleton height={18} />
            <Skeleton height={18} />
            <Skeleton height={18} />
          </Stack>
        ) : reconciliation && forward ? (
          <Stack gap="sm">
            <div>
              <Group gap="xs" align="center" wrap="wrap">
                <Text fz={24} fw={700} c="var(--jurnal-color-text-primary)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoneyAt(reconciliation.invoiceBalance, precision)}
                </Text>
                <Badge
                  color={matched ? 'green' : 'orange'}
                  variant="light"
                  size="sm"
                  leftSection={matched ? <IconCheck size={11} /> : undefined}
                  tt="none"
                >
                  {t(matched ? 'reconciliation.matched' : 'reconciliation.difference')}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {t(isToday ? 'reconciliation.invoiceBalanceToday' : 'reconciliation.invoiceBalanceAsOf')}
              </Text>
            </div>
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between" gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">{t('reconciliation.totalInvoices')}</Text>
                <Text size="sm" fw={500} ta="right" style={{ whiteSpace: 'nowrap' }}>
                  {formatMoneyAt(overview?.summary.total.amount ?? 0, precision)}
                </Text>
              </Group>
              <Group justify="space-between" gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {forward.invoiceCount == null
                    ? t('reconciliation.futureTransactions')
                    : t('reconciliation.futureInvoices', {
                        count: formatCount(forward.invoiceCount),
                      })}
                </Text>
                <Text size="sm" fw={500} ta="right" style={{ whiteSpace: 'nowrap' }}>
                  {forward.adjustment ? (forward.adjustment > 0 ? '+ ' : '− ') : ''}
                  {formatMoneyAt(Math.abs(forward.adjustment), precision)}
                </Text>
              </Group>
              <Group justify="space-between" gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {t('reconciliation.ledgerBalance', {
                    count: formatCount(reconciliation.accounts.length),
                  })}
                </Text>
                <Text size="sm" fw={500} ta="right" style={{ whiteSpace: 'nowrap' }}>
                  {formatMoneyAt(reconciliation.ledgerBalance, precision)}
                </Text>
              </Group>
              {!matched && (
                <Group justify="space-between" gap="xs" wrap="nowrap">
                  <Text size="xs" c="dimmed">{t('reconciliation.differenceLabel')}</Text>
                  <Text size="sm" fw={700} c="orange.7" ta="right">
                    {formatMoneyAt(reconciliation.difference, precision)}
                  </Text>
                </Group>
              )}
            </Stack>
          </Stack>
        ) : (
          <Alert color="orange" title={t('reconciliation.loadError')}>
            <Text size="sm">{t('reconciliation.loadErrorDescription')}</Text>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
