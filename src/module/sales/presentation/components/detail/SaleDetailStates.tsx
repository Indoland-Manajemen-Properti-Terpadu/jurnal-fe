import {
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';

export function SaleDetailLoading() {
  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <Skeleton height={110} radius="lg" />
          <Skeleton height={170} radius="lg" />
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Skeleton height={440} radius="lg" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Skeleton height={300} radius="lg" />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

type SaleDetailErrorProps = {
  display: SaleDisplay;
  onBack: () => void;
  onRetry: () => void;
};

export function SaleDetailError({ display, onBack, onRetry }: Readonly<SaleDetailErrorProps>) {
  const { t } = display;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Paper withBorder radius="lg" p="xl" ta="center">
          <ThemeIcon size={56} radius="xl" color="red" variant="light" mx="auto" mb="md">
            <IconX size={26} />
          </ThemeIcon>
          <Title order={2} size="lg">
            {t('notFoundTitle')}
          </Title>
          <Text size="sm" c="dimmed" mt="xs" mb="lg">
            {t('notFoundDescription')}
          </Text>
          <Group justify="center">
            <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
              {t('back')}
            </Button>
            <Button variant="light" onClick={onRetry}>
              {t('retry')}
            </Button>
          </Group>
        </Paper>
      </Box>
    </AppShellLayout>
  );
}
