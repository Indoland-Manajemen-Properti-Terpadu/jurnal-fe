import { Box, Button, Grid, Paper, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

export function AssetDetailSkeleton() {
  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <Skeleton height={56} radius="lg" />
        <Skeleton height={140} radius="lg" />
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Skeleton height={420} radius="lg" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={420} radius="lg" />
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
}

export type AssetNotFoundProps = {
  onBack: () => void;
};

export function AssetNotFound({ onBack }: Readonly<AssetNotFoundProps>) {
  const { t } = useTranslation('assets');

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Paper withBorder p="xl" radius="lg" ta="center" bg="white">
        <ThemeIcon size={60} radius="xl" color="red" variant="light" mx="auto" mb="md">
          <IconX size={28} />
        </ThemeIcon>
        <Title order={3} c="dark.8">
          {t('notFoundTitle')}
        </Title>
        <Text c="dimmed" size="sm" mt="xs" mb="lg">
          {t('notFoundDesc')}
        </Text>
        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          {t('backToList')}
        </Button>
      </Paper>
    </Box>
  );
}
