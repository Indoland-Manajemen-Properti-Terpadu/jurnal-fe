import type { ReactNode } from 'react';
import {
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertTriangle, IconArrowUpRight, IconCheck, IconX } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  MANUAL_CHECKS,
  confirmedCount,
  type CheckStatus,
  type ManualCheck,
} from '@/module/period-closing/domain/closingReadiness';
import type { CloseBooksWizard } from '@/module/period-closing/presentation/hooks/useCloseBooksWizard';
import { formatDay, formatMoney } from '@/module/period-closing/presentation/periodFormat';
import { StepCard } from './StepCard';

const STATUS_LOOK: Record<Exclude<CheckStatus, 'loading'>, { color: string; icon: ReactNode }> = {
  pass: { color: 'teal', icon: <IconCheck size={16} /> },
  warn: { color: 'orange', icon: <IconAlertTriangle size={16} /> },
  fail: { color: 'red', icon: <IconX size={16} /> },
};

interface AutoCheckProps {
  status: CheckStatus;
  title: string;
  body: string;
  action?: ReactNode;
}

function AutoCheck({ status, title, body, action }: Readonly<AutoCheckProps>) {
  const { t } = useTranslation('periodClosing');
  const look = status === 'loading' ? null : STATUS_LOOK[status];
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      {look ? (
        <ThemeIcon size={28} radius="xl" variant="light" color={look.color}>
          {look.icon}
        </ThemeIcon>
      ) : (
        <ThemeIcon size={28} radius="xl" variant="light" color="gray">
          <Loader size={14} color="gray" />
        </ThemeIcon>
      )}
      <Stack gap={4} style={{ flex: 1 }}>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {status === 'loading' ? t('wizard.readiness.checking') : body}
        </Text>
        {action}
      </Stack>
    </Group>
  );
}

const MANUAL_COPY: Record<ManualCheck, { title: string; body: string }> = {
  bankReconciled: { title: 'wizard.readiness.bankTitle', body: 'wizard.readiness.bankBody' },
  adjustmentsPosted: { title: 'wizard.readiness.adjustTitle', body: 'wizard.readiness.adjustBody' },
  transactionsRecorded: {
    title: 'wizard.readiness.recordedTitle',
    body: 'wizard.readiness.recordedBody',
  },
};

/** Step 2: what the system checked, and what only the user can confirm before closing. */
export function ClosingReadinessStep({ wizard }: Readonly<{ wizard: CloseBooksWizard }>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const { readiness, trialBalance, retainedEarnings } = wizard;
  const end = formatDay(wizard.range.endDate, currentLanguage);
  const totals = trialBalance.data?.totals.closing;
  const done = confirmedCount(readiness.confirmations);

  const balanceBody = () => {
    if (trialBalance.isError || !totals) return t('wizard.readiness.balanceError');
    return readiness.trialBalance === 'pass'
      ? t('wizard.readiness.balancePass', { amount: formatMoney(totals.debit) })
      : t('wizard.readiness.balanceWarn', {
          debit: formatMoney(totals.debit),
          credit: formatMoney(totals.credit),
        });
  };

  return (
    <StepCard
      step={2}
      title={t('wizard.readiness.title')}
      description={t('wizard.readiness.subtitle', { end })}
    >
      <Stack gap="lg">
        <Stack gap="sm">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            {t('wizard.readiness.autoTitle')}
          </Text>
          <Paper withBorder radius="md" p="md">
            <Stack gap="md">
              <AutoCheck
                status={readiness.retainedEarnings}
                title={t('wizard.readiness.retainedTitle')}
                body={
                  readiness.retainedEarnings === 'pass' && retainedEarnings
                    ? t('wizard.readiness.retainedPass', {
                        account: [retainedEarnings.accountNumber, retainedEarnings.name]
                          .filter(Boolean)
                          .join(' · '),
                      })
                    : t('wizard.readiness.retainedFail')
                }
                action={
                  readiness.retainedEarnings === 'fail' && (
                    <Button
                      component={Link}
                      to={routes.settings.accountMapping}
                      size="xs"
                      variant="light"
                      color="red"
                      w="fit-content"
                      rightSection={<IconArrowUpRight size={14} />}
                    >
                      {t('wizard.readiness.retainedAction')}
                    </Button>
                  )
                }
              />
              <AutoCheck
                status={readiness.trialBalance}
                title={t('wizard.readiness.balanceTitle')}
                body={balanceBody()}
                action={
                  trialBalance.isError && (
                    <Button
                      size="xs"
                      variant="default"
                      w="fit-content"
                      onClick={() => trialBalance.refetch()}
                    >
                      {t('wizard.worksheet.retry')}
                    </Button>
                  )
                }
              />
            </Stack>
          </Paper>
        </Stack>

        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              {t('wizard.readiness.manualTitle')}
            </Text>
            <Badge
              variant="light"
              color={done === MANUAL_CHECKS.length ? 'teal' : 'gray'}
              radius="sm"
              tt="none"
            >
              {t('wizard.readiness.manualProgress', { done, total: MANUAL_CHECKS.length })}
            </Badge>
          </Group>
          {MANUAL_CHECKS.map((check) => (
            <Paper
              key={check}
              withBorder
              radius="md"
              p="md"
              bg={readiness.confirmations[check] ? 'teal.0' : 'white'}
            >
              <Checkbox
                checked={readiness.confirmations[check]}
                onChange={(event) => wizard.toggleConfirmation(check, event.currentTarget.checked)}
                color="teal"
                label={
                  <Text span size="sm" fw={600}>
                    {t(MANUAL_COPY[check].title, { end })}
                  </Text>
                }
                description={t(MANUAL_COPY[check].body)}
              />
              {check === 'bankReconciled' && wizard.cashBankAccounts.length > 0 && (
                <Group gap="xs" wrap="wrap" mt="xs" pl={32}>
                  <Text size="xs" c="dimmed">
                    {t('wizard.readiness.bankAccounts')}
                  </Text>
                  {wizard.cashBankAccounts.map((account) => (
                    <Anchor
                      key={account.id}
                      component={Link}
                      to={routes.accountLedger.cashBank.replace(':idAccount', account.id)}
                      target="_blank"
                      size="xs"
                    >
                      {account.accountNumber} {account.name}
                    </Anchor>
                  ))}
                </Group>
              )}
            </Paper>
          ))}
        </Stack>
      </Stack>
    </StepCard>
  );
}
