import type { ReactNode } from 'react';
import { Box, Stack } from '@mantine/core';
import AppShellLayout from '@/components/AppShellLayout';
import classes from '@/module/petty-cash/presentation/pages/PettyCashPage.module.css';

/** Shared page wrapper (Standard A in docs/ui-guidelines.md) for the list and detail routes. */
export function PettyCashPageFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellLayout withFooter>
      <Box className={classes.page} p={{ base: 'md', sm: 'xl' }}>
        <Stack className={classes.workspace} gap="lg">
          {children}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
