import { Badge } from '@mantine/core';
import classes from './StatusUser.module.css'; // Pastikan import CSS module

export const InactiveBadge = () => {
  return (
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
};


