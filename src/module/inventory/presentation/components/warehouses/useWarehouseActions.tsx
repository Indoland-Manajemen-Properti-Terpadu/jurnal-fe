import { useState, type ReactNode } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import {
  knownBlockers,
  type BlockReason,
  type Warehouse,
} from '@/module/inventory/domain/warehouse';
import { WarehouseBlockedError } from '@/module/inventory/infrastructure/warehouseApi';
import {
  ALL_ACTIVE_WAREHOUSES,
  useWarehouseErrorMessage,
  useWarehouseList,
  useWarehouseMutations,
} from '@/module/inventory/presentation/hooks/useWarehouses';
import {
  WarehouseBlockedDialog,
  WarehouseConfirmDialog,
} from '@/module/inventory/presentation/components/warehouses/WarehouseActionDialogs';

type Pending =
  | { kind: 'default'; warehouse: Warehouse }
  | { kind: 'deactivate'; warehouse: Warehouse }
  | { kind: 'delete'; warehouse: Warehouse }
  | { kind: 'blocked'; warehouse: Warehouse; reasons: BlockReason[] };

const UNDO_MS = 8000;

interface Options {
  /** Runs after a warehouse is deleted, for a page that must leave the deleted record. */
  onDeleted?: () => void;
  /** Set on the warehouse's own page, so a blocked dialog does not link back to it. */
  onOwnPage?: boolean;
}

/**
 * The actions of a warehouse that ask for a decision: make main, switch off, switch on, delete.
 * The list and the detail page share it so a refusal reads the same in both.
 */
export const useWarehouseActions = ({ onDeleted, onOwnPage }: Options = {}) => {
  const { t } = useTranslation('warehouses');
  const describe = useWarehouseErrorMessage();
  const actions = useWarehouseMutations();
  const activeList = useWarehouseList(ALL_ACTIVE_WAREHOUSES);
  const [pending, setPending] = useState<Pending | null>(null);
  const [runningId, setRunningId] = useState<string | undefined>(undefined);

  const currentDefault = activeList.data?.items.find((item) => item.isDefault);
  const close = () => setPending(null);

  const fail = (error: unknown) =>
    notifications.show({
      color: 'orange',
      autoClose: 7000,
      title: t('notify.failedTitle'),
      message: describe(error),
    });
  const succeed = (message: ReactNode) => notifications.show({ color: 'green', message });

  const activate = (warehouse: Warehouse) => {
    setRunningId(warehouse.id);
    actions.setActive.mutate(
      { id: warehouse.id, isActive: true },
      {
        onSuccess: () => succeed(t('notify.activated', { name: warehouse.name })),
        onError: fail,
        onSettled: () => setRunningId(undefined),
      }
    );
  };

  const undoDeactivate = (warehouse: Warehouse, toastId: string) => {
    notifications.hide(toastId);
    activate(warehouse);
  };

  const confirmDeactivate = (warehouse: Warehouse) => {
    setRunningId(warehouse.id);
    actions.setActive.mutate(
      { id: warehouse.id, isActive: false },
      {
        onSuccess: () => {
          close();
          const toastId = `warehouse-off-${warehouse.id}`;
          notifications.show({
            id: toastId,
            color: 'green',
            autoClose: UNDO_MS,
            message: (
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Text size="sm">{t('notify.deactivated', { name: warehouse.name })}</Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => undoDeactivate(warehouse, toastId)}
                >
                  {t('notify.undo')}
                </Button>
              </Group>
            ),
          });
        },
        onError: (error) => {
          if (error instanceof WarehouseBlockedError) {
            setPending({ kind: 'blocked', warehouse, reasons: error.reasons });
            return;
          }
          close();
          fail(error);
        },
        onSettled: () => setRunningId(undefined),
      }
    );
  };

  const confirmDefault = (warehouse: Warehouse) => {
    actions.setDefault.mutate(warehouse.id, {
      onSuccess: () => {
        close();
        succeed(t('notify.madeDefault', { name: warehouse.name }));
      },
      onError: (error) => {
        close();
        fail(error);
      },
    });
  };

  const confirmDelete = (warehouse: Warehouse) => {
    actions.remove.mutate(warehouse.id, {
      onSuccess: () => {
        close();
        succeed(t('notify.deleted', { name: warehouse.name }));
        onDeleted?.();
      },
      onError: (error) => {
        close();
        fail(error);
      },
    });
  };

  const request = {
    makeDefault: (warehouse: Warehouse) => setPending({ kind: 'default', warehouse }),
    deactivate: (warehouse: Warehouse) => {
      const reasons = knownBlockers(warehouse);
      setPending(
        reasons.length > 0
          ? { kind: 'blocked', warehouse, reasons }
          : { kind: 'deactivate', warehouse }
      );
    },
    activate,
    remove: (warehouse: Warehouse) => setPending({ kind: 'delete', warehouse }),
  };

  const dialogs = (
    <>
      <WarehouseConfirmDialog
        opened={pending?.kind === 'default'}
        title={t('dialog.defaultTitle')}
        body={t('dialog.defaultBody', {
          from: currentDefault?.name ?? '',
          to: pending?.warehouse.name ?? '',
        })}
        confirmLabel={t('dialog.defaultConfirm')}
        cancelLabel={t('dialog.cancel')}
        loading={actions.setDefault.isPending}
        onConfirm={() => pending && confirmDefault(pending.warehouse)}
        onClose={close}
      />
      <WarehouseConfirmDialog
        opened={pending?.kind === 'deactivate'}
        title={t('dialog.deactivateTitle', { name: pending?.warehouse.name ?? '' })}
        body={t('dialog.deactivateBody')}
        confirmLabel={t('dialog.deactivateConfirm')}
        cancelLabel={t('dialog.cancel')}
        loading={actions.setActive.isPending}
        onConfirm={() => pending && confirmDeactivate(pending.warehouse)}
        onClose={close}
      />
      <WarehouseConfirmDialog
        opened={pending?.kind === 'delete'}
        title={t('dialog.deleteTitle', { name: pending?.warehouse.name ?? '' })}
        body={t('dialog.deleteBody')}
        confirmLabel={t('dialog.deleteConfirm')}
        cancelLabel={t('dialog.cancel')}
        danger
        loading={actions.remove.isPending}
        onConfirm={() => pending && confirmDelete(pending.warehouse)}
        onClose={close}
      />
      <WarehouseBlockedDialog
        warehouse={pending?.kind === 'blocked' ? pending.warehouse : null}
        reasons={pending?.kind === 'blocked' ? pending.reasons : []}
        onOwnPage={onOwnPage}
        onClose={close}
      />
    </>
  );

  return { request, dialogs, runningId };
};
