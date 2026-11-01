import { useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconAlertCircle, IconArrowRight, IconCircleCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
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
      <Text size="sm" fw={600} mt="xs">
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
      mt="sm"
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
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const query = usePeriodEndCheck(date);
  const check = query.data;

  return (
    <ReportShell
      hint={t('reports.periodEnd.hint')}
      query={query}
      controls={
        <DatePickerInput
          label={t('reports.periodEnd.date')}
          value={date}
          onChange={(value) => value && setDate(value)}
          valueFormat="DD/MM/YYYY"
          w={{ base: '100%', sm: 220 }}
        />
      }
    >
      {check && (
        <Stack gap="md">
          <Alert
            color={check.hasOpenItems ? 'orange' : 'teal'}
            icon={
              check.hasOpenItems ? <IconAlertCircle size={18} /> : <IconCircleCheck size={18} />
            }
            radius="md"
          >
            {t(check.hasOpenItems ? 'reports.periodEnd.open' : 'reports.periodEnd.clean')}
          </Alert>
          {check.funds.map((entry) => (
            <Paper key={entry.fund.id} withBorder radius="md" p="md" bg="white">
              <Text fw={700}>
                {entry.fund.code} · {entry.fund.name}
              </Text>
              {entry.vouchers.length > 0 && (
                <Box mt="xs">
                  <Text size="sm" c="dimmed">
                    {t('reports.periodEnd.vouchers')}: {money(entry.voucherTotal)}
                  </Text>
                  {entry.vouchers.map((voucher) => (
                    <Text key={voucher.id} size="sm">
                      {voucher.voucherNumber} · {money(voucher.totalAmount)}
                    </Text>
                  ))}
                </Box>
              )}
              {entry.advances.length > 0 && (
                <Box mt="xs">
                  <Text size="sm" c="dimmed">
                    {t('reports.periodEnd.advances')}: {money(entry.advanceTotal)}
                  </Text>
                  {entry.advances.map((advance) => (
                    <Text key={advance.id} size="sm">
                      {advance.advanceNumber} · {advance.requesterName} ·{' '}
                      {money(advance.outstanding)}
                    </Text>
                  ))}
                </Box>
              )}
              {KNOWN_ACTIONS.includes(entry.suggestedAction) && (
                <NextStep action={entry.suggestedAction} fundId={entry.fund.id} />
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </ReportShell>
  );
}
