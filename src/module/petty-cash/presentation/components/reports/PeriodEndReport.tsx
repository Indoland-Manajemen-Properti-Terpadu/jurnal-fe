import { useState } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { DetailSection, LineItems } from '@/module/petty-cash/presentation/components/DetailKit';
import { DocumentNotice } from '@/module/petty-cash/presentation/components/DocumentDrawer';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { usePeriodEndCheck } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const KNOWN_ACTIONS = ['REIMBURSE', 'SETTLE'];

/** The suggested next step, as a button where this user can take it and as plain text otherwise. */
function NextStep({ action, fundId }: Readonly<{ action: string; fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const access = usePettyCashAccess();
  const label = t(`reports.periodEnd.action.${action}`);
  const canAct = action === 'REIMBURSE' ? access.can('JP-PC-RMB', 'create') : true;

  if (!canAct) {
    return (
      <Text size="sm" fw={600}>
        {label}
      </Text>
    );
  }
  const target =
    action === 'REIMBURSE'
      ? routes.pettyCash.replenishmentAdd.replace(':fundId', fundId)
      : `${routes.pettyCash.main}?fund=${fundId}&tab=advances`;
  return (
    <Button
      size="xs"
      variant="light"
      rightSection={<IconArrowRight size={14} />}
      onClick={() => navigate(target)}
    >
      {label}
    </Button>
  );
}

const money = (amount: number) => formatCurrency(amount, false);

/** What is still open at a closing date, fund by fund, with the next step for each. */
export function PeriodEndReport() {
  const { t } = useTranslation('pettyCash');
  const [date, setDate] = useState(todayWib());
  const query = usePeriodEndCheck(date);
  const check = query.data;

  return (
    <ReportShell
      title={t('reports.sections.periodEnd')}
      hint={t('reports.periodEnd.hint')}
      query={query}
    >
      <DatePickerInput
        aria-label={t('reports.periodEnd.date')}
        leftSection={
          <Text size="xs" c="dimmed" pl={4}>
            {t('reports.periodEnd.date')}
          </Text>
        }
        leftSectionWidth={120}
        value={date}
        onChange={(value) => value && setDate(value)}
        valueFormat="DD/MM/YYYY"
        w={{ base: '100%', sm: 270 }}
      />
      {check && (
        <Stack gap="md">
          <DocumentNotice tone={check.hasOpenItems ? 'warning' : 'info'}>
            {t(check.hasOpenItems ? 'reports.periodEnd.open' : 'reports.periodEnd.clean')}
          </DocumentNotice>
          {check.funds.map((entry) => (
            <DetailSection
              key={entry.fund.id}
              title={`${entry.fund.code} · ${entry.fund.name}`}
              aside={
                KNOWN_ACTIONS.includes(entry.suggestedAction) ? (
                  <NextStep action={entry.suggestedAction} fundId={entry.fund.id} />
                ) : undefined
              }
            >
              <Stack gap="md">
                {entry.vouchers.length > 0 && (
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.4}>
                        {t('reports.periodEnd.vouchers')}
                      </Text>
                      <Text size="sm" fw={700}>
                        {money(entry.voucherTotal)}
                      </Text>
                    </Group>
                    <LineItems
                      items={entry.vouchers.map((voucher) => ({
                        key: voucher.id,
                        title: voucher.voucherNumber,
                        amount: money(voucher.totalAmount),
                      }))}
                    />
                  </Stack>
                )}
                {entry.advances.length > 0 && (
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.4}>
                        {t('reports.periodEnd.advances')}
                      </Text>
                      <Text size="sm" fw={700}>
                        {money(entry.advanceTotal)}
                      </Text>
                    </Group>
                    <LineItems
                      items={entry.advances.map((advance) => ({
                        key: advance.id,
                        title: advance.advanceNumber,
                        subtitle: advance.requesterName,
                        amount: money(advance.outstanding),
                      }))}
                    />
                  </Stack>
                )}
              </Stack>
            </DetailSection>
          ))}
        </Stack>
      )}
    </ReportShell>
  );
}
