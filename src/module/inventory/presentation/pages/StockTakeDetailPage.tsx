import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconClipboardCheck,
  IconClipboardList,
  IconHistory,
  IconLock,
  IconPlayerPlay,
  IconScale,
  IconSend,
  IconX,
  IconBan,
  IconPrinter,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { ApiError } from '@/lib/http/apiError';
import { opnameActions, submitReadiness } from '@/module/inventory/domain/stockOpname';
import type { OpnameStep } from '@/module/inventory/infrastructure/opnameApi';
import {
  DetailFrame,
  PageFrame,
  type FrameMenuItem,
} from '@/module/inventory/presentation/components/shared/DetailFrame';
import { useOpnamePrint } from '@/module/inventory/presentation/components/stockTake/useOpnamePrint';
import { OpnameCountTab } from '@/module/inventory/presentation/components/stockTake/OpnameCountTab';
import { OpnameHistoryTab } from '@/module/inventory/presentation/components/stockTake/OpnameHistoryTab';
import { OpnameInfoCard } from '@/module/inventory/presentation/components/stockTake/OpnameInfoCard';
import { OpnameReasonDialog } from '@/module/inventory/presentation/components/stockTake/OpnameReasonDialog';
import { OpnameStages } from '@/module/inventory/presentation/components/stockTake/OpnameStages';
import { OpnameStatusBadge } from '@/module/inventory/presentation/components/stockTake/OpnameStatusBadge';
import { OpnameSummaryTab } from '@/module/inventory/presentation/components/stockTake/OpnameSummaryTab';
import { WarehouseConfirmDialog } from '@/module/inventory/presentation/components/warehouses/WarehouseActionDialogs';
import {
  useOpname,
  useOpnameJournalPreview,
  useOpnameMutations,
  useOpnameRights,
  useStockTakeErrorMessage,
} from '@/module/inventory/presentation/hooks/useOpnames';
import { routes } from '@/router/routes';
import { dateFormatV1 } from '@/utils/formatDate';

type Dialog = 'start' | 'submit' | 'approve' | 'reject' | 'cancel' | 'delete' | null;
type Tab = 'count' | 'summary' | 'history';

const BACK = routes.inventory.stockTake;

/** One count: its stages, the products to count, the difference it causes, and its history. */
export default function StockTakeDetailPage() {
  const { t } = useTranslation('stockTake');
  const { id } = useParams<{ id: string }>();
  const describe = useStockTakeErrorMessage();
  const rights = useOpnameRights();
  const print = useOpnamePrint();
  const navigate = useNavigate();
  const { step, saveLines, remove } = useOpnameMutations();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [tab, setTab] = useState<Tab>('count');

  const query = useOpname(id);
  const { data } = query;
  const preview = useOpnameJournalPreview(
    id,
    Boolean(data?.canSeeValues) && data?.status !== 'cancelled' && data?.status !== 'draft'
  );

  if (query.isLoading) {
    return (
      <PageFrame backTo={BACK} backLabel={t('detail.backToList')}>
        <Skeleton height={96} radius="lg" />
        <Skeleton height={180} radius="lg" />
        <Skeleton height={280} radius="lg" />
      </PageFrame>
    );
  }

  if (!data) {
    const missing = query.error instanceof ApiError && query.error.kind === 'notFound';
    return (
      <PageFrame backTo={BACK} backLabel={t('detail.backToList')}>
        <Paper withBorder radius="lg" bg="white">
          <EmptyState
            title={t(missing ? 'detail.notFound' : 'detail.loadFailed')}
            description={missing ? t('detail.notFoundBody') : describe(query.error)}
            icon={<IconClipboardCheck size={36} stroke={1.5} />}
          />
        </Paper>
      </PageFrame>
    );
  }

  const actions = opnameActions(data.status, rights);
  const readiness = submitReadiness(data.lines);
  const frozen = data.status === 'counting' || data.status === 'pending_approval';
  let saveState: 'idle' | 'saving' | 'saved' | 'failed' = 'idle';
  if (saveLines.isPending) saveState = 'saving';
  else if (saveLines.isError) saveState = 'failed';
  else if (saveLines.isSuccess) saveState = 'saved';

  const run = (kind: OpnameStep, reason?: string) =>
    step.mutate(
      { id: data.id, step: kind, reason },
      {
        onSuccess: () => {
          setDialog(null);
          notifications.show({ color: 'green', message: t(`dialogs.done.${kind}`) });
        },
        onError: (error) => {
          setDialog(null);
          notifications.show({ color: 'orange', autoClose: 7000, message: describe(error) });
        },
      }
    );

  const removeDraft = () =>
    remove.mutate(data.id, {
      onSuccess: () => {
        notifications.show({ color: 'green', message: t('dialogs.done.delete') });
        navigate(BACK);
      },
      onError: (error) => {
        setDialog(null);
        notifications.show({ color: 'orange', autoClose: 7000, message: describe(error) });
      },
    });

  const submitHint = [
    readiness.uncounted > 0 ? t('count.notReadyUncounted', { count: readiness.uncounted }) : '',
    readiness.incomplete > 0 ? t('count.notReadyIncomplete', { count: readiness.incomplete }) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const open = data.status === 'draft' || data.status === 'counting';
  const menu: FrameMenuItem[] = [
    // The sheet to count by hand carries no book balance, so anyone who may count can print it.
    ...(open && data.lines.length > 0
      ? [{ label: t('print.countAction'), icon: IconPrinter, onClick: () => print('count', data) }]
      : []),
    ...(data.canSeeValues && !open && data.status !== 'cancelled'
      ? [
          {
            label: t('print.recordAction'),
            icon: IconPrinter,
            onClick: () => print('record', data, preview.data),
          },
        ]
      : []),
    ...(actions.remove
      ? [
          {
            label: t('actions.deleteMenu'),
            icon: IconTrash,
            onClick: () => setDialog('delete'),
            danger: true,
          },
        ]
      : []),
    ...(actions.cancel
      ? [
          {
            label: t('actions.cancelMenu'),
            icon: IconBan,
            onClick: () => setDialog('cancel'),
            danger: true,
          },
        ]
      : []),
  ];

  const tabs: { value: Tab; icon: typeof IconClipboardList; count?: number }[] = [
    { value: 'count', icon: IconClipboardList, count: data.lines.length },
    ...(data.canSeeValues ? [{ value: 'summary' as const, icon: IconScale }] : []),
    { value: 'history', icon: IconHistory, count: data.history.length },
  ];

  return (
    <DetailFrame
      icon={IconClipboardCheck}
      title={data.number}
      copyable
      badges={<OpnameStatusBadge status={data.status} />}
      subtitle={`${dateFormatV1(data.date, 'D MMM YYYY')} · ${data.warehouse.name}`}
      backTo={BACK}
      backLabel={t('detail.backToList')}
      menu={menu}
      actions={
        <>
          {actions.reject && (
            <Button
              variant="default"
              leftSection={<IconX size={16} />}
              onClick={() => setDialog('reject')}
            >
              {t('actions.reject')}
            </Button>
          )}
          {actions.approve && (
            <Button leftSection={<IconCheck size={16} />} onClick={() => setDialog('approve')}>
              {t('actions.approve')}
            </Button>
          )}
          {actions.start && (
            <Button leftSection={<IconPlayerPlay size={16} />} onClick={() => setDialog('start')}>
              {t('actions.start')}
            </Button>
          )}
          {actions.submit && (
            <Tooltip label={submitHint} disabled={readiness.ready} withArrow>
              <Box>
                <Button
                  leftSection={<IconSend size={16} />}
                  disabled={!readiness.ready}
                  onClick={() => setDialog('submit')}
                >
                  {t('actions.submit')}
                </Button>
              </Box>
            </Tooltip>
          )}
        </>
      }
    >
      {frozen && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconLock size={18} />}
          title={t('detail.freezeTitle', { warehouse: data.warehouse.name })}
        >
          {t('detail.freezeBody')}
        </Alert>
      )}
      {data.status === 'cancelled' && (
        <Alert
          color="gray"
          variant="light"
          radius="md"
          icon={<IconBan size={18} />}
          title={t('detail.cancelledTitle')}
        >
          {[...data.history].sort((x, y) => y.at.localeCompare(x.at)).find((entry) => entry.note)
            ?.note ?? t('detail.cancelledNote')}
        </Alert>
      )}
      <Grid gutter="lg" align="stretch">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <OpnameInfoCard opname={data} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <OpnameStages opname={data} />
        </Grid.Col>
      </Grid>
      <Paper withBorder radius="lg" p="md" bg="white">
        <Tabs
          value={tab}
          onChange={(value) => setTab((value as Tab | null) ?? 'count')}
          color="primary"
          variant="pills"
          radius="md"
          keepMounted={false}
        >
          <Tabs.List mb="md">
            {tabs.map(({ value, icon: TabIcon, count }) => (
              <Tabs.Tab
                key={value}
                value={value}
                leftSection={<TabIcon size={16} />}
                rightSection={
                  count === undefined ? undefined : (
                    <Text span size="xs" fw={600} opacity={0.75}>
                      {count}
                    </Text>
                  )
                }
              >
                {t(`detail.tabs.${value}`)}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value="count">
            <OpnameCountTab
              opname={data}
              actions={actions}
              saveState={saveState}
              addingFound={saveLines.isPending}
              onSave={(change) => saveLines.mutate({ id: data.id, changes: [change] })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="summary">
            <OpnameSummaryTab
              opname={data}
              preview={preview.data}
              previewLoading={preview.isLoading}
            />
          </Tabs.Panel>
          <Tabs.Panel value="history">
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                {t('history.subtitle')}
              </Text>
              <OpnameHistoryTab history={data.history} />
            </Stack>
          </Tabs.Panel>
        </Tabs>
        {saveLines.isError && (
          <Alert mt="md" color="red" variant="light" radius="md">
            {describe(saveLines.error)}
          </Alert>
        )}
      </Paper>
      <WarehouseConfirmDialog
        opened={dialog === 'start'}
        title={t('dialogs.startTitle', { number: data.number })}
        body={t('dialogs.startBody', { warehouse: data.warehouse.name })}
        confirmLabel={t('dialogs.startConfirm')}
        cancelLabel={t('dialogs.keep')}
        loading={step.isPending}
        onConfirm={() => run('start')}
        onClose={() => setDialog(null)}
      />
      <WarehouseConfirmDialog
        opened={dialog === 'submit'}
        title={t('dialogs.submitTitle', { number: data.number })}
        body={t('dialogs.submitBody')}
        confirmLabel={t('dialogs.submitConfirm')}
        cancelLabel={t('dialogs.keep')}
        loading={step.isPending}
        onConfirm={() => run('submit')}
        onClose={() => setDialog(null)}
      />
      <WarehouseConfirmDialog
        opened={dialog === 'approve'}
        title={t('dialogs.approveTitle', { number: data.number })}
        body={t('dialogs.approveBody')}
        confirmLabel={t('dialogs.approveConfirm')}
        cancelLabel={t('dialogs.keep')}
        loading={step.isPending}
        onConfirm={() => run('approve')}
        onClose={() => setDialog(null)}
      />
      <OpnameReasonDialog
        opened={dialog === 'reject'}
        title={t('dialogs.rejectTitle', { number: data.number })}
        body={t('dialogs.rejectBody')}
        label={t('dialogs.rejectReasonLabel')}
        required={t('dialogs.rejectReasonRequired')}
        confirmLabel={t('dialogs.rejectConfirm')}
        keepLabel={t('dialogs.keep')}
        saving={step.isPending}
        onConfirm={(reason) => run('reject', reason)}
        onClose={() => setDialog(null)}
      />
      <WarehouseConfirmDialog
        opened={dialog === 'delete'}
        title={t('dialogs.deleteTitle', { number: data.number })}
        body={t('dialogs.deleteBody')}
        confirmLabel={t('dialogs.deleteConfirm')}
        cancelLabel={t('dialogs.keep')}
        danger
        loading={remove.isPending}
        onConfirm={removeDraft}
        onClose={() => setDialog(null)}
      />
      <OpnameReasonDialog
        opened={dialog === 'cancel'}
        title={t('dialogs.cancelTitle', { number: data.number })}
        body={t(data.status === 'posted' ? 'dialogs.cancelBodyPosted' : 'dialogs.cancelBodyOpen')}
        label={t('dialogs.cancelReasonLabel')}
        placeholder={t('dialogs.cancelReasonPlaceholder')}
        required={t('dialogs.cancelReasonRequired')}
        confirmLabel={t('dialogs.cancelConfirm')}
        keepLabel={t('dialogs.keep')}
        saving={step.isPending}
        onConfirm={(reason) => run('cancel', reason)}
        onClose={() => setDialog(null)}
      />
    </DetailFrame>
  );
}
