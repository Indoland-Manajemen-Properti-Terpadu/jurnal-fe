import type { ReactNode } from 'react';
import {
  Anchor,
  Box,
  Breadcrumbs,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

type Crumb = { label: string; to?: string };

type ModuleHeaderProps = {
  icon: Icon;
  title: string;
  description: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
};

/** Feature header with a short, user-friendly explanation of what the page is for. */
export function ModuleHeader({
  icon: HeaderIcon,
  title,
  description,
  breadcrumbs,
  actions,
}: Readonly<ModuleHeaderProps>) {
  return (
    <Paper
      radius="lg"
      p={{ base: 'md', sm: 'lg' }}
      withBorder
      style={{
        background:
          'linear-gradient(120deg, var(--mantine-color-white) 55%, var(--mantine-color-secondary-0))',
      }}
    >
      <Stack gap="sm">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs separatorMargin={6}>
            {breadcrumbs.map((crumb) =>
              crumb.to ? (
                <Anchor key={crumb.label} component={Link} to={crumb.to} size="xs" c="dimmed">
                  {crumb.label}
                </Anchor>
              ) : (
                <Text key={crumb.label} size="xs" c="primary.6" fw={600}>
                  {crumb.label}
                </Text>
              )
            )}
          </Breadcrumbs>
        )}
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Group align="flex-start" gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 260 }}>
            <ThemeIcon
              size={48}
              radius="md"
              variant="gradient"
              gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            >
              <HeaderIcon size={24} stroke={1.8} />
            </ThemeIcon>
            <Box>
              <Title order={2} fz={{ base: 20, sm: 24 }} c="primary.9" lh={1.2}>
                {title}
              </Title>
              <Text size="sm" c="dimmed" mt={6} maw={680} lh={1.6}>
                {description}
              </Text>
            </Box>
          </Group>
          {actions && <Group gap="sm">{actions}</Group>}
        </Group>
      </Stack>
    </Paper>
  );
}
