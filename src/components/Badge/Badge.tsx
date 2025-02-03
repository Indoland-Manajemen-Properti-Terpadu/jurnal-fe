import { Badge, rem } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import classes from './StatusUser.module.css';
import { themeColors } from '@/theme';

export const ActiveBadge = () => (
  <Badge
    variant="dot"
    color="green"
    radius="sm"
    style={{
      backgroundColor: '#EBFBEE',
      color: '#40C057',
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
    color="grey"
    radius="sm"
    style={{
      backgroundColor: '#F8F9FA',
      color: '#868E96',
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
  <Badge
    color="grey"
    radius="sm"
    style={{
      backgroundColor: '#F8F9FA',
      color: '#868E96',
      border: 'none',
    }}
    className={classes.badgeText}
  >
    All Role
  </Badge>
);

export const KeyStatusLockBagde = () => {
  const icon = <IconLock style={{ width: rem(12), height: rem(12) }} />;
  return (
    <Badge
      leftSection={icon}
      color="grey"
      radius="sm"
      bg={themeColors.grey[0]}
      c={themeColors.grey[6]}
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
