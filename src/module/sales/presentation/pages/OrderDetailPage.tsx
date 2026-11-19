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
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBan,
  IconCheck,
  IconClipboardList,
  IconCopy,
  IconDotsVertical,
  IconPencil,
  IconReceipt2,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatDate, formatDateTime } from '../../domain/saleFormat';
import { allowedOrderActions, orderActions, type SaleOrder } from '../../domain/saleOrder';
import type { NoteTone } from '../components/docs/DocNoteBanner';
import { DocLinesCard } from '../components/docs/DocLinesCard';
import { DocOverviewCard } from '../components/docs/DocOverviewCard';
import { DocSideCards } from '../components/docs/DocSideCards';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { useOrderActions } from '../hooks/useOrderActions';
import { useOrder } from '../hooks/useOrderQueries';
import { useOrderRights } from '../hooks/useOrderRights';

/** The sentence under the overview and its colour: green only where the order is in good standing. */
const NOTES: Record<SaleOrder['status'], { key: string; tone: NoteTone }> = {
  DRAFT: { key: 'detail.draftNote', tone: 'gray' },
  WAITING_CONFIRMATION: { key: 'detail.waitingNote', tone: 'blue' },
  CONFIRMED: { key: 'detail.confirmedNote', tone: 'green' },
  COMPLETED: { key: 'detail.completedNote', tone: 'green' },
  CANCELLED: { key: 'detail.cancelledNote', tone: 'gray' },
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('salesOrders');
  const rights = useOrderRights();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { handlers, dialogs } = useOrderActions({
    onDeleted: () => navigate(routes.sales.orders, { replace: true }),
  });
  const back = () => navigate(routes.sales.orders);

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
  if (isError || !order) {
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
              {t('detail.back')}
            </Button>
          </Group>
        </Box>
      </AppShellLayout>
    );
  }

  const actions = allowedOrderActions(orderActions(order), rights);

  // One filled button: what normally happens next to this order.
  const primary = actions.createInvoice
    ? {
        label: t('actions.createInvoice'),
        icon: <IconReceipt2 size={16} />,
        run: () => handlers.onCreateInvoice(order),
      }
    : actions.send
      ? {
          label: t('actions.send'),
          icon: <IconSend size={16} />,
          run: () => handlers.onSend(order),
        }
      : actions.confirm
        ? {
            label: t('actions.confirm'),
            icon: <IconCheck size={16} />,
            run: () => handlers.onConfirm(order),
          }
        : actions.viewInvoice
          ? {
              label: t('actions.viewInvoice'),
              icon: <IconReceipt2 size={16} />,
              run: () => handlers.onViewInvoice(order),
            }
          : null;
  const hasMenu = actions.edit || actions.duplicate || actions.cancel || actions.remove;

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
            icon={IconClipboardList}
            title={t('detail.title')}
            description={t('detail.description')}
          />
          <DocOverviewCard
            ns="salesOrders"
            number={order.transactionNumber}
            badge={<OrderStatusBadge status={order.status} />}
            customerName={order.customer?.displayName ?? ''}
            stats={[
              { label: t('detail.date'), value: formatDate(order.transactionDate) },
              {
                label: t('detail.targetDate'),
                value: order.targetDate ? formatDate(order.targetDate) : '',
              },
              order.confirmedAt
                ? { label: t('detail.confirmedAt'), value: formatDateTime(order.confirmedAt) }
                : { label: t('detail.sentAt'), value: formatDateTime(order.sentAt) },
            ]}
            valueAmount={order.total}
            note={{ tone: NOTES[order.status].tone, text: t(NOTES[order.status].key) }}
            actions={
              <Group gap="xs">
                {primary && (
                  <Button color="primary" leftSection={primary.icon} onClick={primary.run}>
                    {primary.label}
                  </Button>
                )}
                {hasMenu && (
                  <Menu position="bottom-end" shadow="md" width={220}>
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
                          onClick={() => handlers.onEdit(order)}
                        >
                          {t('actions.edit')}
                        </Menu.Item>
                      )}
                      {actions.duplicate && (
                        <Menu.Item
                          leftSection={<IconCopy size={16} />}
                          onClick={() => handlers.onDuplicate(order)}
                        >
                          {t('actions.duplicate')}
                        </Menu.Item>
                      )}
                      {(actions.edit || actions.duplicate) &&
                        (actions.cancel || actions.remove) && <Menu.Divider />}
                      {actions.cancel && (
                        <Menu.Item
                          color="red"
                          leftSection={<IconBan size={16} />}
                          onClick={() => handlers.onCancel(order)}
                        >
                          {t('actions.cancel')}
                        </Menu.Item>
                      )}
                      {actions.remove && (
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handlers.onDelete(order)}
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
              <DocLinesCard ns="salesOrders" doc={order} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <DocSideCards
                ns="salesOrders"
                doc={order}
                deliveryAddress={order.deliveryAddress}
                extra={[
                  { label: t('detail.reference'), value: order.customerRefNumber },
                  { label: t('detail.unitTower'), value: order.unitTower },
                ]}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
      {dialogs}
    </AppShellLayout>
  );
}

export default OrderDetailPage;
