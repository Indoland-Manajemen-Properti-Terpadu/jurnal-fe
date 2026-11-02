import { type ComponentType } from 'react';
import { Box } from '@mantine/core';
import classes from './dashboard.module.css';

export function IconOrb({
  icon: Icon,
  tone = 'primary',
}: Readonly<{
  icon: ComponentType<{ size?: number | string }>;
  tone?: string;
}>) {
  return (
    <Box className={classes.iconOrb} c={`${tone}.7`} bg={`${tone}.0`}>
      <Icon size={18} />
    </Box>
  );
}
