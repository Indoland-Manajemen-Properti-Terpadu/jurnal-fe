import { Badge } from '@mantine/core';
import classes from './StatusUser.module.css'; 

export const ActiveBadge = () => {
  return (
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
};


