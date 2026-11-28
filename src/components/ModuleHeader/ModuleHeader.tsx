import type { ReactNode } from 'react';
import { Box, Group, Paper, ThemeIcon, Title } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import classes from './ModuleHeader.module.css';

export type Crumb = { label: string; to?: string };

export type ModuleHeaderProps = {
  icon: Icon;
  title: ReactNode;
  description: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  compact?: boolean;
};

/** Shared feature header for module pages. */
export function ModuleHeader({
  icon: HeaderIcon,
  title,
  description,
  actions,
  compact = false,
}: Readonly<ModuleHeaderProps>) {
  return (
    <Paper
      radius="lg"
      p={compact ? 'md' : { base: 'md', sm: 'lg' }}
      withBorder
      bg="white"
      shadow="none"
    >
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Box className={classes.intro}>
          <ThemeIcon size={compact ? 40 : 48} radius="md" color="primary" variant="filled">
            <HeaderIcon size={compact ? 22 : 24} stroke={1.8} />
          </ThemeIcon>
          <Box className={classes.copy}>
            <Title order={2} fz={compact ? 20 : { base: 20, sm: 24 }} className={classes.title}>
              {title}
            </Title>
            <Box className={classes.description}>{description}</Box>
          </Box>
        </Box>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Paper>
  );
}
