import { useState } from 'react';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { unwrapAccountDetail, useDetailAccount } from '@/module/chart-of-accounts';
import type { BankConnection } from '@/module/bank-connection/domain/connection';
import { connectionErrorKey } from '@/module/bank-connection/domain/errorKey';
import { ageOf, balanceGap } from '@/module/bank-connection/domain/statementBalance';
import {
  useRevokeConnection,
  useSyncConnection,
} from '@/module/bank-connection/presentation/hooks/useBankConnectionMutations';
import { useSyncRuns } from '@/module/bank-connection/presentation/hooks/useBankConnectionQueries';
import {
  formatDay,
  formatMoment,
} from '@/module/bank-connection/presentation/components/formatMoment';
import { RefreshUsage } from '@/module/bank-connection/presentation/components/RefreshUsage';
import { MessagePanel } from '@/module/bank-connection/presentation/components/MessagePanel';

function Figure({ label, value, hint }: Readonly<{ label: string; value: string; hint?: string }>) {
  return (
    <Stack gap={2} p="lg" style={{ minWidth: 0 }}>
      <Text fz={12} c="dimmed">
        {label}
      </Text>
      <Text fz={26} fw={700} lh={1.15} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
      {hint && (
        <Text fz={12} c="dimmed">
          {hint}
        </Text>
      )}
    </Stack>
  );
}

/** A connection that has been active: the two balances side by side, the sync, the permission and the way out. */
export function ConnectedView({ connection }: Readonly<{ connection: BankConnection }>) {
  const { t, currentLanguage } = useTranslation('bankConnection');
  const navigate = useNavigate();
  const { accountDetail } = useDetailAccount(connection.accountId);
  const runs = useSyncRuns(connection.id, true);
  const sync = useSyncConnection();
  const revoke = useRevokeConnection();
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const bookBalance = unwrapAccountDetail(accountDetail)?.amount;
  const statement = connection.statementBalance;
  const gap =
    typeof statement === 'number' && typeof bookBalance === 'number'
      ? balanceGap(statement, bookBalance)
      : null;
  const canSync = connection.status === 'ACTIVE' || connection.status === 'ERROR';
  const failedCode = runs.data?.find((run) => run.status === 'FAILED')?.errorCode;

  const startSync = () =>
    sync.mutate(connection.id, {
      onSuccess: () =>
        notifications.show({ color: 'teal', message: t('detail.active.syncStarted') }),
      onError: (error) =>
        notifications.show({ color: 'red', message: t(connectionErrorKey(error)) }),
    });

  const lastSynced = connection.lastSyncedAt
    ? t('detail.active.lastSynced', {
        age: (() => {
          const age = ageOf(connection.lastSyncedAt);
          return t(`age.${age.unit}`, { count: age.value });
        })(),
      })
    : t('detail.active.neverSynced');

  return (
    <Stack gap="lg">
      {connection.status === 'SUSPENDED' && (
        <MessagePanel
          illustration="pause"
          title={t('detail.suspended.title')}
          body={t('detail.suspended.body')}
        />
      )}
      {connection.status === 'ERROR' && (
        <MessagePanel
          illustration="plug"
          title={t('detail.failed.title')}
          body={t('detail.failed.body')}
        >
          {failedCode && (
            <Text fz="sm" fw={600}>
              {t('detail.failed.code', { code: failedCode })}
            </Text>
          )}
        </MessagePanel>
      )}
      {connection.status === 'EXPIRED' && (
        <MessagePanel
          illustration="expire"
          title={t('detail.expired.title')}
          body={t('detail.expired.body')}
          actions={
            <Button
              onClick={() =>
                navigate(`${routes.bankConnection.main}?accountId=${connection.accountId}`)
              }
            >
              {t('detail.expired.action')}
            </Button>
          }
        />
      )}

      <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={0}>
          <Figure
            label={t('detail.active.statementBalance')}
            value={typeof statement === 'number' ? formatCurrency(statement) : '—'}
            hint={
              typeof statement === 'number' && connection.statementBalanceAsOf
                ? t('detail.active.statementBalanceAsOf', {
                    date: formatMoment(connection.statementBalanceAsOf, currentLanguage),
                  })
                : t('detail.active.noBalanceYet')
            }
          />
          <Box style={{ borderLeft: '1px solid var(--mantine-color-gray-2)' }}>
            <Figure
              label={t('detail.active.bookBalance')}
              value={typeof bookBalance === 'number' ? formatCurrency(bookBalance) : '—'}
              hint={t('detail.active.bookBalanceHint')}
            />
          </Box>
          <Box style={{ borderLeft: '1px solid var(--mantine-color-gray-2)' }}>
            <Figure
              label={t('detail.active.gap')}
              value={gap ? formatCurrency(gap.amount) : '—'}
              hint={
                gap
                  ? gap.isZero
                    ? t('detail.active.gapNone')
                    : t('detail.active.gapHint')
                  : undefined
              }
            />
          </Box>
        </SimpleGrid>
      </Paper>

      <Group justify="space-between" gap="md">
        <Text fz="sm" c="dimmed" role="status">
          {lastSynced}
        </Text>
        <Group gap="sm">
          <Button
            variant="default"
            onClick={() =>
              navigate(
                `${routes.accountLedger.cashBank.replace(':idAccount', connection.accountId)}?tab=reconciliation`
              )
            }
          >
            {t('detail.active.openReconciliation')}
          </Button>
          {canSync && (
            <Button onClick={startSync} loading={sync.isPending}>
              {sync.isPending ? t('detail.active.syncing') : t('detail.active.syncNow')}
            </Button>
          )}
        </Group>
      </Group>

      {connection.refreshUsage && <RefreshUsage usage={connection.refreshUsage} />}

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper withBorder radius="md" p="lg" bg="white">
          <Text fw={600}>{t('detail.active.consentTitle')}</Text>
          <Text fz="sm" c="dimmed" mt={6}>
            {connection.consentExpiresAt
              ? t('detail.active.consentUntil', {
                  date: formatDay(connection.consentExpiresAt, currentLanguage),
                })
              : t('detail.active.consentNone')}
          </Text>
        </Paper>
        <Paper withBorder radius="md" p="lg" bg="white">
          <Text fw={600} mb="xs">
            {t('detail.active.runsTitle')}
          </Text>
          {(runs.data ?? []).length === 0 ? (
            <Text fz="sm" c="dimmed">
              {t('detail.active.runsEmpty')}
            </Text>
          ) : (
            <Stack gap="xs" component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
              {(runs.data ?? []).slice(0, 5).map((run) => (
                <li key={run.id}>
                  <Text fz="sm">
                    {formatMoment(run.startedAt, currentLanguage)} ·{' '}
                    <b>
                      {run.status === 'FAILED'
                        ? t('detail.active.runFailed')
                        : t('detail.active.runAdded', { count: run.added })}
                    </b>
                  </Text>
                  <Text fz={12} c="dimmed">
                    {t(`detail.active.trigger.${run.trigger}`)}
                  </Text>
                </li>
              ))}
            </Stack>
          )}
        </Paper>
      </SimpleGrid>

      <Paper withBorder radius="md" p="lg" bg="gray.0">
        <Group justify="space-between" gap="md">
          <Box>
            <Text fw={600}>{t('detail.active.disconnectTitle')}</Text>
            <Text fz="sm" c="dimmed">
              {t('detail.active.disconnectBody')}
            </Text>
          </Box>
          {confirmingDisconnect ? (
            <Group gap="xs">
              <Text fz="sm">{t('detail.active.disconnectConfirm')}</Text>
              <Button
                color="red"
                size="xs"
                loading={revoke.isPending}
                onClick={() =>
                  revoke.mutate(
                    { id: connection.id },
                    {
                      onError: (error) =>
                        notifications.show({ color: 'red', message: t(connectionErrorKey(error)) }),
                    }
                  )
                }
              >
                {t('detail.active.disconnectYes')}
              </Button>
              <Button variant="default" size="xs" onClick={() => setConfirmingDisconnect(false)}>
                {t('detail.active.disconnectNo')}
              </Button>
            </Group>
          ) : (
            <Button
              color="red"
              variant="outline"
              size="xs"
              onClick={() => setConfirmingDisconnect(true)}
            >
              {t('detail.active.disconnect')}
            </Button>
          )}
        </Group>
      </Paper>
    </Stack>
  );
}
