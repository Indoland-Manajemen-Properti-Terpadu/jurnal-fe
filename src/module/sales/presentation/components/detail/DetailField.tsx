import type { ReactNode } from 'react';
import { Box, Text } from '@mantine/core';
import classes from './SaleDetail.module.css';

export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box className={classes.detailField}>
      <Text size="xs" c="dimmed" fw={600}>
        {label}
      </Text>
      <Text size="sm" fw={600} className={classes.fieldValue}>
        {children || '—'}
      </Text>
    </Box>
  );
}
