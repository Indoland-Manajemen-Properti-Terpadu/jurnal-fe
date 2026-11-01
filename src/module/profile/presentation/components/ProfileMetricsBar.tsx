import { Box, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconBuilding, IconClock, IconKey, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatUpdatedDate, type Profile } from '../../domain/profile';

interface ProfileMetricsBarProps {
  user?: Profile;
}

export function ProfileMetricsBar({ user }: ProfileMetricsBarProps) {
  const { t } = useTranslation('profile');

  return (
    <SimpleGrid
      cols={{ base: 2, sm: 4 }}
      spacing="md"
      p="md"
      style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
    >
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={36} radius="md" variant="light" color="primary">
          <IconUser size={18} />
        </ThemeIcon>
        <Box>
          <Text size="xs" c="dimmed" fw={600}>
            {t('metrics.accountStatus')}
          </Text>
          <Text size="sm" fw={600} c="primary.9">
            {user?.isEmailVerified ? t('metrics.activeVerified') : t('metrics.activeUnverified')}
          </Text>
        </Box>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={36} radius="md" variant="light" color="teal">
          <IconKey size={18} />
        </ThemeIcon>
        <Box>
          <Text size="xs" c="dimmed" fw={600}>
            {t('metrics.authorizationRole')}
          </Text>
          <Text size="sm" fw={600} c="teal.8">
            {user?.role ? user.role.toUpperCase() : t('metrics.standardRole')}
          </Text>
        </Box>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={36} radius="md" variant="light" color="indigo">
          <IconBuilding size={18} />
        </ThemeIcon>
        <Box>
          <Text size="xs" c="dimmed" fw={600}>
            {t('metrics.siteEntity')}
          </Text>
          <Text size="sm" fw={600} c="indigo.9" truncate="end">
            {user?.site?.name || t('metrics.defaultSite')}
          </Text>
        </Box>
      </Group>

      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={36} radius="md" variant="light" color="cyan">
          <IconClock size={18} />
        </ThemeIcon>
        <Box>
          <Text size="xs" c="dimmed" fw={600}>
            {t('metrics.lastUpdated')}
          </Text>
          <Text size="sm" fw={600} c="cyan.9">
            {formatUpdatedDate(user?.updatedAt)}
          </Text>
        </Box>
      </Group>
    </SimpleGrid>
  );
}
