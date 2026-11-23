import type { ReactNode } from 'react';
import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { BlockReason, Warehouse } from '@/module/inventory/domain/warehouse';
import {
  stockTakeDetailPath,
  transferDetailPath,
  transferListPath,
  transferNewPath,
} from '@/module/inventory/presentation/components/shared/stockLinks';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';

type ConfirmProps = {
  opened: boolean;
  title: ReactNode;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** A plain confirmation in the shared dialog frame. */
export function WarehouseConfirmDialog({
  opened,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger,
  loading,
  onConfirm,
  onClose,
}: Readonly<ConfirmProps>) {
  return (
    <ModalFrame
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      title={title}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={danger ? 'red' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {body}
      </Text>
    </ModalFrame>
  );
}

/** The transfers named in the dialog; the rest are reached through the list. */
const MAX_TRANSFER_LINKS = 5;

type BlockedProps = {
  warehouse: Warehouse | null;
  reasons: BlockReason[];
  onClose: () => void;
};

/** Every reason a warehouse cannot be switched off yet, each with the place to settle it. */
export function WarehouseBlockedDialog({ warehouse, reasons, onClose }: Readonly<BlockedProps>) {
  const { t, currentLanguage } = useTranslation('warehouses');

  const renderReason = (reason: BlockReason) => {
    switch (reason.kind) {
      case 'default':
        return { text: t('blocked.default'), links: [] };
      case 'stock': {
        const text =
          reason.itemCount === null
            ? t('blocked.stockNoCount')
            : reason.value === null
              ? t('blocked.stockItems', { count: reason.itemCount })
              : t('blocked.stock', {
                  count: reason.itemCount,
                  value: formatCurrency(reason.value),
                });
        const link = warehouse
          ? {
              to: transferNewPath({ from: warehouse.id, fillAll: true }),
              label: t('blocked.transferStock'),
            }
          : undefined;
        return { text, links: link ? [link] : [] };
      }
      case 'orders':
        return {
          text:
            reason.count === null
              ? t('blocked.ordersNoCount')
              : t('blocked.orders', { count: reason.count }),
          links: [{ to: routes.purchases.orders, label: t('blocked.viewOrders') }],
        };
      case 'transfers': {
        const listPath = transferListPath({
          warehouse: warehouse?.id,
          status: 'PENDING_APPROVAL',
        });
        const shown = reason.transfers.slice(0, MAX_TRANSFER_LINKS);
        const hidden = Math.max(0, (reason.count ?? reason.transfers.length) - shown.length);
        const links = shown.map((transfer) => ({
          to: transferDetailPath(transfer.id),
          label: transfer.number,
        }));
        if (shown.length === 0) {
          links.push({ to: listPath, label: t('blocked.viewTransfers') });
        } else if (hidden > 0) {
          links.push({ to: listPath, label: t('blocked.moreTransfers', { count: hidden }) });
        }
        return {
          text:
            reason.count === null
              ? t('blocked.transfersNoCount')
              : t('blocked.transfers', { count: reason.count }),
          links,
        };
      }
      case 'opname':
        return {
          text: t('blocked.opname', { number: reason.number }),
          links: [{ to: stockTakeDetailPath(reason.id), label: t('blocked.openOpname') }],
        };
      default:
        return {
          text: currentLanguage === 'id' && reason.message ? reason.message : t('blocked.other'),
          links: [],
        };
    }
  };

  return (
    <ModalFrame
      opened={warehouse !== null}
      onClose={onClose}
      title={t('dialog.blockedTitle', { name: warehouse?.name ?? '' })}
      description={t('dialog.blockedIntro')}
      footer={<Button onClick={onClose}>{t('dialog.blockedClose')}</Button>}
    >
      <Stack gap="sm">
        {reasons.map((reason, index) => {
          const { text, links } = renderReason(reason);
          return (
            <Group key={`${reason.kind}-${index}`} gap="sm" align="flex-start" wrap="nowrap">
              <IconAlertTriangle
                size={18}
                color="var(--mantine-color-orange-6)"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <Stack gap={2}>
                <Text size="sm">{text}</Text>
                {links.length > 0 && (
                  <Group gap="md" wrap="wrap">
                    {links.map((link) => (
                      <Anchor
                        key={link.to}
                        component={Link}
                        to={link.to}
                        size="sm"
                        onClick={onClose}
                      >
                        {link.label}
                      </Anchor>
                    ))}
                  </Group>
                )}
              </Stack>
            </Group>
          );
        })}
      </Stack>
    </ModalFrame>
  );
}
