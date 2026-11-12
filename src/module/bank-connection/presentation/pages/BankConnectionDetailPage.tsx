import { Alert, Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowLeft, IconPlugConnected } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import type { BankConnection } from '@/module/bank-connection/domain/connection';
import { connectionErrorKey } from '@/module/bank-connection/domain/errorKey';
import { isLive } from '@/module/bank-connection/domain/connectionStatus';
import { ConnectedView } from '@/module/bank-connection/presentation/components/ConnectedView';
import { ConnectionStatusPill } from '@/module/bank-connection/presentation/components/ConnectionStatusPill';
import { ConnectionStepper } from '@/module/bank-connection/presentation/components/ConnectionStepper';
import { ConnectionTimeline } from '@/module/bank-connection/presentation/components/ConnectionTimeline';
import { MessagePanel } from '@/module/bank-connection/presentation/components/MessagePanel';
import { SignPanel } from '@/module/bank-connection/presentation/components/SignPanel';
import {
  useBankConnection,
  useConnectionEvents,
} from '@/module/bank-connection/presentation/hooks/useBankConnectionQueries';
import {
  useCancelConnection,
  useSignConnection,
} from '@/module/bank-connection/presentation/hooks/useBankConnectionMutations';

/** One connection, whatever step it is on: the panel changes with the status. */
export default function BankConnectionDetailPage() {
  const { t } = useTranslation('bankConnection');
  const navigate = useNavigate();
  const { connectionId } = useParams();
  const query = useBankConnection(connectionId);
  const events = useConnectionEvents(connectionId);
  const sign = useSignConnection();
  const cancel = useCancelConnection();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const connection = query.data;
  const editPath = routes.bankConnection.edit.replace(':connectionId', connectionId ?? '');
  const newRequestPath = (item: BankConnection) =>
    `${routes.bankConnection.main}?accountId=${item.accountId}`;
  const fail = (error: Parameters<typeof connectionErrorKey>[0]) =>
    notifications.show({ color: 'red', message: t(connectionErrorKey(error)) });

  const panel = (item: BankConnection) => {
    if (isLive(item.status)) return <ConnectedView connection={item} />;
    switch (item.status) {
      case 'DRAFT':
        return (
          <MessagePanel
            illustration="fix"
            title={t('detail.draft.title')}
            body={t('detail.draft.body')}
            actions={<Button onClick={() => navigate(editPath)}>{t('detail.draft.action')}</Button>}
          />
        );
      case 'NEEDS_REVISION':
        return (
          <MessagePanel
            illustration="fix"
            title={t('detail.revision.title')}
            body={t('detail.revision.body')}
            actions={
              <Button onClick={() => navigate(editPath)}>{t('detail.revision.action')}</Button>
            }
          >
            {item.reason && (
              <Alert color="orange" radius="md" title={t('detail.revision.reasonLabel')}>
                {item.reason}
              </Alert>
            )}
          </MessagePanel>
        );
      case 'SUBMITTED':
      case 'IN_REVIEW':
        return (
          <MessagePanel
            illustration="review"
            title={t('detail.review.title')}
            body={t('detail.review.body')}
            actions={
              confirmingCancel ? (
                <Group gap="xs">
                  <Text fz="sm">{t('detail.review.cancelConfirm')}</Text>
                  <Button
                    color="red"
                    size="xs"
                    loading={cancel.isPending}
                    onClick={() => cancel.mutate(item.id, { onError: fail })}
                  >
                    {t('detail.review.cancelYes')}
                  </Button>
                  <Button variant="default" size="xs" onClick={() => setConfirmingCancel(false)}>
                    {t('detail.review.cancelNo')}
                  </Button>
                </Group>
              ) : (
                <Button variant="default" color="red" onClick={() => setConfirmingCancel(true)}>
                  {t('detail.review.cancel')}
                </Button>
              )
            }
          />
        );
      case 'AWAITING_SIGNATURE':
        return (
          <SignPanel
            connection={item}
            signing={sign.isPending}
            onSign={() => sign.mutate(item.id, { onError: fail })}
          />
        );
      case 'SIGNED':
        return (
          <MessagePanel
            illustration="review"
            title={t('detail.waitBank.title')}
            body={t('detail.waitBank.body')}
          />
        );
      case 'REJECTED':
        return (
          <MessagePanel
            illustration="stop"
            title={t('detail.rejected.title')}
            body={t('detail.rejected.body')}
            actions={
              <Button onClick={() => navigate(newRequestPath(item))}>
                {t('detail.rejected.action')}
              </Button>
            }
          >
            {item.reason && (
              <Alert color="red" radius="md">
                {item.reason}
              </Alert>
            )}
          </MessagePanel>
        );
      case 'REVOKED':
        return (
          <MessagePanel
            illustration="plug"
            title={t('detail.revoked.title')}
            body={t('detail.revoked.body')}
            actions={
              <Button onClick={() => navigate(newRequestPath(item))}>
                {t('detail.revoked.action')}
              </Button>
            }
          />
        );
      default:
        return (
          <MessagePanel
            illustration="empty"
            title={t('detail.cancelled.title')}
            body={t('detail.cancelled.body')}
            actions={
              <Button onClick={() => navigate(newRequestPath(item))}>
                {t('detail.cancelled.action')}
              </Button>
            }
          />
        );
    }
  };

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconPlugConnected}
            title={connection?.bankName || t('detail.title')}
            description={connection ? connection.accountNumberMasked : t('detail.title')}
            actions={
              <Group gap="sm">
                {connection && <ConnectionStatusPill status={connection.status} />}
                <Button
                  variant="default"
                  radius="md"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate(routes.bankCash.main)}
                >
                  {t('backToCashBank')}
                </Button>
              </Group>
            }
          />

          {query.isLoading && <Skeleton height={220} radius="md" />}

          {query.error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
              <Stack gap="xs" align="flex-start">
                <span>
                  {query.error.kind === 'notFound' ? t('detail.notFound') : t('detail.loadError')}
                </span>
                {query.error.kind !== 'notFound' && (
                  <Button size="xs" variant="light" color="red" onClick={() => query.refetch()}>
                    {t('retry')}
                  </Button>
                )}
              </Stack>
            </Alert>
          )}

          {connection && (
            <>
              <ConnectionStepper status={connection.status} />
              {panel(connection)}
              <Paper withBorder radius="md" p="lg" bg="white">
                <Text fw={600} mb="sm">
                  {t('detail.history')}
                </Text>
                <ConnectionTimeline events={events.data ?? []} />
              </Paper>
            </>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
