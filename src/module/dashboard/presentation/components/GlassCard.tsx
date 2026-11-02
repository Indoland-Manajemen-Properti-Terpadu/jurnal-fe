import { type ReactNode } from 'react';
import { Box } from '@mantine/core';
import classes from './dashboard.module.css';

type GlassCardProps = {
  children: ReactNode;
  lift?: boolean;
  p?: number | string;
  h?: number | string;
};

export function GlassCard({ children, lift, p = 'lg', h }: Readonly<GlassCardProps>) {
  return (
    <Box p={p} h={h} className={`${classes.glass} ${lift ? classes.lift : ''}`}>
      {children}
    </Box>
  );
}
