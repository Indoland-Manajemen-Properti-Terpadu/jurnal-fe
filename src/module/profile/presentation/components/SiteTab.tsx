import { Badge, Box, Grid, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconBuilding, IconCircleCheckFilled, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Profile } from '../../domain/profile';
import { CopyIdField } from './CopyIdField';

interface SiteTabProps {
  user?: Profile;
}

export function SiteTab({ user }: SiteTabProps) {
  const { t } = useTranslation('profile');

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Paper withBorder radius="md" p="xl">
          <Title order={4} mb="xs" c="primary.9">
            {t('site.title')}
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            {t('site.description')}
          </Text>

          <Stack gap="md">
            <TextInput
              label={t('site.nameLabel')}
              value={user?.site?.name || t('site.defaultName')}
              readOnly
              leftSection={<IconBuilding size={18} />}
              styles={{
                input: { backgroundColor: 'var(--mantine-color-gray-0)', fontWeight: 600 },
              }}
            />

            <CopyIdField label={t('site.idLabel')} value={user?.site?.id} />

            <Group gap="md">
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={600} mb={4}>
                  {t('site.connectionStatus')}
                </Text>
                <Badge
                  size="md"
                  color="teal"
                  variant="light"
                  leftSection={<IconCircleCheckFilled size={14} />}
                >
                  {t('site.connected')}
                </Badge>
              </Box>
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={600} mb={4}>
                  {t('site.scope')}
                </Text>
                <Badge size="md" color="blue" variant="light">
                  {t('site.scopeValue')}
                </Badge>
              </Box>
            </Group>
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 5 }}>
        <Stack gap="md">
          <Paper withBorder radius="md" p="md">
            <Title order={5} mb="xs" c="primary.9">
              {t('site.multiEntityTitle')}
            </Title>
            <Text size="xs" c="dimmed" mb="md" lh={1.4}>
              {t('site.multiEntityText')}
            </Text>

            <Paper withBorder radius="sm" p="xs" bg="gray.0">
              <Group gap="xs" wrap="nowrap">
                <IconInfoCircle size={18} color="var(--mantine-color-dimmed)" />
                <Text size="xs" c="dimmed">
                  {t('site.switchSiteNote')}
                </Text>
              </Group>
            </Paper>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
