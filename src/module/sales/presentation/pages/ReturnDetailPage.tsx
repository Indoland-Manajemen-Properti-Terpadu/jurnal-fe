import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBan,
  IconCash,
  IconCheck,
  IconCoin,
  IconDotsVertical,
  IconPencil,
  IconReceipt2,
  IconReceiptRefund,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatDate } from '../../domain/saleFormat';
import { allowedReturnActions, returnActions, type SaleReturn } from '../../domain/saleReturn';
import type { NoteTone } from '../components/docs/DocNoteBanner';
import { DocOverviewCard } from '../components/docs/DocOverviewCard';
import {
  ReturnCreditCard,
  ReturnLinesCard,
  ReturnMemoCard,
} from '../components/returns/ReturnDetailCards';
import { ReturnActivityCard } from '../components/returns/ReturnActivityCard';
import { ReturnStatusBadge } from '../components/returns/ReturnStatusBadge';
import { useReturnActions } from '../hooks/useReturnActions';
import { useReturn } from '../hooks/useReturnQueries';
import { useReturnRights } from '../hooks/useReturnRights';

/** The sentence under the overview; green only where the return is in good standing. */
const noteOf = (ret: SaleReturn): { key: string; tone: NoteTone } => {
  switch (ret.displayStatus) {
    case 'DRAFT':
      return { key: 'detail.draftNote', tone: 'gray' };
    case 'COMPLETED':
      return { key: 'detail.completedNote', tone: 'green' };
    case 'VOID':
      return { key: 'detail.voidNote', tone: 'gray' };
    default:
      return ret.creditRemaining > 0
        ? { key: 'detail.issuedCreditNote', tone: 'blue' }
        : { key: 'detail.issuedNote', tone: 'green' };
  }
};

export function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('salesReturns');
  const rights = useReturnRights();
  const { data: ret, isLoading, isError, refetch } = useReturn(id);
  const { handlers, dialogs } = useReturnActions({
    onDeleted: () => navigate(routes.sales.returns, { replace: true }),
  });
  const back = () => navigate(routes.sales.returns);

  if (isLoading) {
    return (
      <AppShellLayout>
        <Stack align="center" gap="xs" py={80}>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t('detail.loading')}
          </Text>
        </Stack>
      </AppShellLayout>
    );
  }
  if (isError || !ret) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <EmptyState
            title={t('detail.errorTitle')}
            description={t('detail.errorDescription')}
            actionLabel={t('detail.retry')}
            onAction={() => refetch()}
          />
          <Group justify="center" mt="md">
            <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
              {t('detail.backToList')}
            </Button>
          </Group>
        </Box>
      </AppShellLayout>
    );
  }

  const all = returnActions(ret);
  const actions = allowedReturnActions(all, rights);
  const note = noteOf(ret);

  // One filled button: what normally happens next to this return.
  const primary = actions.issue
    ? { label: t('actions.issue'), icon: <IconCheck size={16} />, run: () => handlers.onIssue(ret) }
    : actions.applyCredit
      ? {
          label: t('actions.applyCredit'),
          icon: <IconCoin size={16} />,
          run: () => handlers.onApplyCredit(ret),
        }
      : null;
  const cancelBlocked = actions.cancel && all.cancelBlocked;
  const hasMenu =
    actions.edit ||
    actions.refund ||
    actions.cancelRefund ||
    actions.cancel ||
    actions.remove ||
    Boolean(ret.sale);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <Anchor
            component="button"
            type="button"
            size="sm"
            c="dimmed"
            onClick={back}
            style={{ alignSelf: 'flex-start' }}
          >
            <Group gap={6} wrap="nowrap">
              <IconArrowLeft size={16} />
              {t('detail.backToList')}
            </Group>
          </Anchor>
          <ModuleHeader
            icon={IconReceiptRefund}
            title={t('detail.title')}
            description={t('detail.description')}
          />
          <DocOverviewCard
            ns="salesReturns"
            number={ret.transactionNumber}
            badge={<ReturnStatusBadge status={ret.displayStatus} />}
            customerName={ret.customer?.displayName ?? ''}
            subtitle={
              <Text size="sm" c="dimmed">
                {t('detail.creditNoteOf')}{' '}
                {ret.sale ? (
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    fw={600}
                    onClick={() => handlers.onViewInvoice(ret)}
                  >
                    {ret.saleNumber}
                  </Anchor>
                ) : (
                  ret.saleNumber
                )}
                {' · '}
                {t(`reasons.${ret.reason}`)}
              </Text>
            }
            stats={[
              { label: t('detail.customer'), value: ret.customer?.displayName ?? '' },
              { label: t('detail.date'), value: formatDate(ret.transactionDate) },
              { label: t('detail.settlement'), value: t(`settlement.${ret.settlement}`) },
            ]}
            valueAmount={ret.finalAmount}
            note={{ tone: note.tone, text: t(note.key) }}
            actions={
              <Group gap="xs">
                {primary && (
                  <Button color="primary" leftSection={primary.icon} onClick={primary.run}>
                    {primary.label}
                  </Button>
                )}
                {hasMenu && (
                  <Menu position="bottom-end" shadow="md" width={260}>
                    <Menu.Target>
                      <ActionIcon
                        variant="default"
                        size={36}
                        radius="md"
                        aria-label={t('actions.more')}
                      >
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {actions.edit && (
                        <Menu.Item
                          leftSection={<IconPencil size={16} />}
                          onClick={() => handlers.onEdit(ret)}
                        >
                          {t('actions.edit')}
                        </Menu.Item>
                      )}
                      {actions.refund && (
                        <Menu.Item
                          leftSection={<IconCash size={16} />}
                          onClick={() => handlers.onRefund(ret)}
                        >
                          {t('actions.refund')}
                        </Menu.Item>
                      )}
                      {actions.cancelRefund && (
                        <Menu.Item
                          leftSection={<IconBan size={16} />}
                          onClick={() => handlers.onCancelRefund(ret)}
                        >
                          {t('actions.cancelRefund')}
                        </Menu.Item>
                      )}
                      {ret.sale && (
                        <Menu.Item
                          leftSection={<IconReceipt2 size={16} />}
                          onClick={() => handlers.onViewInvoice(ret)}
                        >
                          {t('actions.viewInvoice')}
                        </Menu.Item>
                      )}
                      {(actions.cancel || actions.remove) && <Menu.Divider />}
                      {actions.cancel && (
                        <Tooltip
                          label={t('actions.cancelBlocked')}
                          disabled={!cancelBlocked}
                          withArrow
                          multiline
                          w={240}
                        >
                          <Menu.Item
                            color="red"
                            disabled={cancelBlocked}
                            leftSection={<IconBan size={16} />}
                            onClick={() => handlers.onCancel(ret)}
                          >
                            {t('actions.cancel')}
                          </Menu.Item>
                        </Tooltip>
                      )}
                      {actions.remove && (
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handlers.onDelete(ret)}
                        >
                          {t('actions.remove')}
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
            }
          />
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                <ReturnLinesCard ret={ret} />
                <ReturnMemoCard ret={ret} />
                <ReturnActivityCard ret={ret} />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              {ret.status === 'POSTED' && (
                <ReturnCreditCard
                  ret={ret}
                  canCancelApplication={actions.cancelApplication}
                  onCancelApplication={(applicationId) => {
                    const application = ret.applications.find((a) => a.id === applicationId);
                    if (application) handlers.onCancelApplication(ret, application);
                  }}
                />
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
      {dialogs}
    </AppShellLayout>
  );
}

export default ReturnDetailPage;
