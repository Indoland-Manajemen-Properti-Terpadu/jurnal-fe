import { ActionIcon, Menu, Text } from '@mantine/core';
import {
  IconDotsVertical,
  IconFileText,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconRotate2,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { canDeletePeriod } from '@/module/period-closing/domain/periodRules';
import type { PeriodAccess } from '@/module/period-closing/presentation/hooks/usePeriodAccess';

export type PeriodAction = 'edit' | 'toggle' | 'delete' | 'reopen' | 'journal';

interface PeriodRowActionsProps {
  period: AccountingPeriod;
  access: PeriodAccess;
  /** Whether this row is the latest active closing (the only one that can be reopened). */
  isLatestClosing: boolean;
  onAction: (action: PeriodAction, period: AccountingPeriod) => void;
}

/** The menu of one row. Only actions the user holds and the period allows are listed. */
export function PeriodRowActions({
  period,
  access,
  isLatestClosing,
  onAction,
}: Readonly<PeriodRowActionsProps>) {
  const { t } = useTranslation('periodClosing');
  const isLock = period.type === 'LOCK';
  const isActiveClosing = !isLock && period.isActive;

  const canEdit = access.canUpdate && (isLock || period.isActive);
  const canToggle = access.canUpdate && isLock;
  const canDelete = access.canDelete && canDeletePeriod(period);
  const showReopen = access.canDelete && isActiveClosing;
  const showJournal = !isLock && Boolean(period.closingJournalId);

  if (!canEdit && !canToggle && !canDelete && !showReopen && !showJournal) return null;

  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={240}>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={t('actions.more', { name: period.name })}
        >
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {canEdit && (
          <Menu.Item
            leftSection={<IconPencil size={16} />}
            onClick={() => onAction('edit', period)}
          >
            {t('actions.edit')}
          </Menu.Item>
        )}
        {canToggle && (
          <Menu.Item
            leftSection={period.isActive ? <IconLockOpen size={16} /> : <IconLock size={16} />}
            onClick={() => onAction('toggle', period)}
          >
            {period.isActive ? t('actions.lockOff') : t('actions.lockOn')}
          </Menu.Item>
        )}
        {showJournal && (
          <Menu.Item
            leftSection={<IconFileText size={16} />}
            onClick={() => onAction('journal', period)}
          >
            {t('actions.viewJournal')}
          </Menu.Item>
        )}
        {(canDelete || showReopen) && (canEdit || canToggle || showJournal) && <Menu.Divider />}
        {canDelete && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => onAction('delete', period)}
          >
            {t('actions.delete')}
          </Menu.Item>
        )}
        {showReopen && (
          <Menu.Item
            color="red"
            leftSection={<IconRotate2 size={16} />}
            disabled={!isLatestClosing}
            onClick={() => onAction('reopen', period)}
          >
            {t('actions.reopen')}
            {!isLatestClosing && (
              <Text size="xs" c="dimmed">
                {t('actions.reopenOnlyLatest')}
              </Text>
            )}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
