import type { ReactNode } from 'react';
import { Anchor, Box, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowLeft, type Icon } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useDashboardConfig } from '@/module/purchases/presentation/hooks/useDashboard';

interface FormFrameProps {
  icon: Icon;
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
  children: ReactNode;
}

/** The shell of a purchasing form, as in the reference web: back link, a plain header card, the form. */
export const FormFrame = ({
  icon: HeaderIcon,
  title,
  description,
  backTo,
  backLabel,
  children,
}: Readonly<FormFrameProps>) => {
  const navigate = useNavigate();
  useDashboardConfig();
  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <Anchor
            component="button"
            type="button"
            size="sm"
            c="dimmed"
            fw={500}
            onClick={() => navigate(backTo)}
            style={{ alignSelf: 'flex-start' }}
          >
            <Group gap={6} wrap="nowrap">
              <IconArrowLeft size={16} />
              {backLabel}
            </Group>
          </Anchor>
          <Paper withBorder radius="lg" p="lg" bg="white">
            <Group gap="md" wrap="nowrap">
              <ThemeIcon size={44} radius="md" color="primary" variant="filled">
                <HeaderIcon size={22} stroke={1.8} />
              </ThemeIcon>
              <div>
                <Text component="h1" fz={{ base: 20, sm: 24 }} fw={700} lh={1.2} m={0}>
                  {title}
                </Text>
                <Text size="sm" c="dimmed">
                  {description}
                </Text>
              </div>
            </Group>
          </Paper>
          {children}
        </Stack>
      </Box>
    </AppShellLayout>
  );
};
