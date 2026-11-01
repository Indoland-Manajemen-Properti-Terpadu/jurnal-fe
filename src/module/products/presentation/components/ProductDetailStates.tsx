import {
  Button,
  Container,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

export function ProductDetailSkeleton() {
  return (
    <Container fluid p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <Skeleton height={50} radius="md" />
        <Skeleton height={180} radius="lg" />
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Skeleton height={200} radius="lg" />
          <Skeleton height={200} radius="lg" />
          <Skeleton height={200} radius="lg" />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

export function ProductNotFound({ onBack }: Readonly<{ onBack: () => void }>) {
  const { t } = useTranslation('products');
  return (
    <Container fluid p={{ base: 'md', sm: 'xl' }}>
      <Paper withBorder p="xl" radius="lg" ta="center">
        <ThemeIcon size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
          <IconX size={32} />
        </ThemeIcon>
        <Title order={3} c="dark.8">
          {t('detail.notFoundTitle')}
        </Title>
        <Text c="dimmed" size="sm" mt="xs" mb="lg">
          {t('detail.notFoundDescription')}
        </Text>
        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          {t('detail.backToList')}
        </Button>
      </Paper>
    </Container>
  );
}
