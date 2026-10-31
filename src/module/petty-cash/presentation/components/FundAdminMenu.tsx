import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import {
  IconAdjustments,
  IconChevronDown,
  IconLock,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { AdjustPaguDialog } from '@/module/petty-cash/presentation/components/AdjustPaguDialog';
import { CloseFundDialog } from '@/module/petty-cash/presentation/components/CloseFundDialog';
import { FundFormDialog } from '@/module/petty-cash/presentation/components/FundFormDialog';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

type Dialog = 'create' | 'edit' | 'adjust' | 'close' | null;

/** Fund administration, offered only to people with the matching right on the petty cash menu. */
export function FundAdminMenu({
  fund,
  onCreated,
}: Readonly<{ fund?: PettyCashFund; onCreated: (fundId: string) => void }>) {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const [dialog, setDialog] = useState<Dialog>(null);

  const canCreate = access.can('JP-PC', 'create');
  const canUpdate = Boolean(fund) && fund?.status !== 'CLOSED' && access.can('JP-PC', 'update');
  const canClose = Boolean(fund) && fund?.status !== 'CLOSED' && access.can('JP-PC', 'delete');
  if (!canCreate && !canUpdate && !canClose) return null;

  return (
    <>
      <Menu position="bottom-end" shadow="md" withinPortal>
        <Menu.Target>
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            rightSection={<IconChevronDown size={14} />}
          >
            {t('fundAdmin.menu')}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {canCreate && (
            <Menu.Item leftSection={<IconPlus size={16} />} onClick={() => setDialog('create')}>
              {t('fundAdmin.create')}
            </Menu.Item>
          )}
          {canUpdate && (
            <>
              <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => setDialog('edit')}>
                {t('fundAdmin.edit')}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconAdjustments size={16} />}
                onClick={() => setDialog('adjust')}
              >
                {t('fundAdmin.adjust')}
              </Menu.Item>
            </>
          )}
          {canClose && (
            <Menu.Item
              color="red"
              leftSection={<IconLock size={16} />}
              onClick={() => setDialog('close')}
            >
              {t('fundAdmin.close')}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      <FundFormDialog
        opened={dialog === 'create'}
        onClose={() => setDialog(null)}
        onSaved={onCreated}
      />
      {fund && (
        <>
          <FundFormDialog
            key={fund.id}
            fund={fund}
            opened={dialog === 'edit'}
            onClose={() => setDialog(null)}
          />
          <AdjustPaguDialog
            fund={fund}
            opened={dialog === 'adjust'}
            onClose={() => setDialog(null)}
          />
          <CloseFundDialog
            fund={fund}
            opened={dialog === 'close'}
            onClose={() => setDialog(null)}
          />
        </>
      )}
    </>
  );
}
