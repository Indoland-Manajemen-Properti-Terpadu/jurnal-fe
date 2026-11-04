import { Badge, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

export const AccountStatusBadge = ({ locked }: Readonly<{ locked: boolean }>) => {
  const { t } = useTranslation('chartOfAccounts');
  const Icon = locked ? IconLock : IconLockOpen;
  const label = locked ? t('table.locked') : t('table.open');
  return (
    <Tooltip label={label} openDelay={200}>
      <ThemeIcon
        variant="light"
        color={locked ? 'gray' : 'green'}
        size={28}
        radius="sm"
        role="img"
        aria-label={label}
      >
        <Icon size={16} stroke={2} />
      </ThemeIcon>
    </Tooltip>
  );
};

export const AccountAccessBadge = ({ allUsers }: Readonly<{ allUsers: boolean }>) => {
  const { t } = useTranslation('chartOfAccounts');
  return (
    <Badge
      variant={allUsers ? 'light' : 'outline'}
      color={allUsers ? 'primary' : 'gray'}
      radius="sm"
    >
      {allUsers ? t('table.allUsers') : t('table.restricted')}
    </Badge>
  );
};

/** `isDebit` is unknown for an account without a category, so it shows a dash, not a guess. */
export const NormalBalanceBadge = ({ isDebit }: Readonly<{ isDebit: boolean | undefined }>) => {
  const { t } = useTranslation('chartOfAccounts');
  if (isDebit === undefined) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }
  return (
    <Badge variant="light" color={isDebit ? 'primary' : 'gray'} radius="sm">
      {isDebit ? t('table.debit') : t('table.credit')}
    </Badge>
  );
};
