import { Badge, rem } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import classes from './StatusUser.module.css';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: {
    bg: 'var(--jurnal-color-success-subtle)',
    color: 'var(--jurnal-color-success)',
  },
  inactive: {
    bg: 'var(--jurnal-color-surface-muted)',
    color: 'var(--jurnal-color-text-muted)',
  },
};

export const ActiveBadge = () => (
  <Badge
    variant="dot"
    color="green"
    radius="sm"
    style={{
      backgroundColor: STATUS_STYLES.active.bg,
      color: STATUS_STYLES.active.color,
      marginLeft: '0.5rem',
      border: 'none',
    }}
    className={classes.badgeText}
  >
    Active
  </Badge>
);

export const InactiveBadge = () => (
  <Badge
    variant="dot"
    color="gray"
    radius="sm"
    style={{
      backgroundColor: STATUS_STYLES.inactive.bg,
      color: STATUS_STYLES.inactive.color,
      marginLeft: '0.5rem',
      border: 'none',
    }}
    className={classes.badgeText}
  >
    Inactive
  </Badge>
);

// General Ledger Table Components
export const AllRoleBadge = () => (
  <Badge color="blue" radius="sm" bg={themeColors.blue[6]} c="white" className={classes.badgeText}>
    All Users
  </Badge>
);

export const KeyStatusLockBagde = () => {
  const icon = <IconLock style={{ width: rem(12), height: rem(12) }} />;
  return (
    <Badge
      leftSection={icon}
      color="gray"
      radius="sm"
      bg={themeColors.gray[0]}
      c={themeColors.gray[6]}
      className={classes.badgeText}
    >
      Lock
    </Badge>
  );
};

export const KeyStatusOpenBagde = () => {
  const icon = <IconLock style={{ width: rem(12), height: rem(12) }} />;
  return (
    <Badge
      leftSection={icon}
      color="green"
      radius="sm"
      bg={themeColors.green[0]}
      c={themeColors.green[6]}
      className={classes.badgeText}
    >
      Open
    </Badge>
  );
};
