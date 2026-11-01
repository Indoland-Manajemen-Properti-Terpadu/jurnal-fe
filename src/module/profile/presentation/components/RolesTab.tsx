import {
  Badge,
  Box,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useTranslation } from '@/i18n';
import { isAdminRole, type Profile } from '../../domain/profile';
import { PERMISSION_MODULES, type PermissionAccess } from './permissionModules';

interface RolesTabProps {
  user?: Profile;
}

export function RolesTab({ user }: RolesTabProps) {
  const { t } = useTranslation('profile');

  const accessLabel = (access: PermissionAccess) => {
    if (access === 'full') return t('roles.accessFull');
    if (access === 'fullExport') return t('roles.accessFullExport');
    return isAdminRole(user?.role) ? t('roles.accessAdministrator') : t('roles.accessLimited');
  };

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" p="lg">
        <Group justify="space-between" align="center" wrap="wrap" mb="md">
          <Box>
            <Title order={4} c="primary.9">
              {t('roles.title')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('roles.description')}
            </Text>
          </Box>
          <Group gap="xs">
            <Badge size="lg" color="primary" variant="filled">
              {user?.role?.toUpperCase() || t('roles.defaultRole')}
            </Badge>
            <Badge size="lg" color="teal" variant="light">
              {t('roles.multiModule')}
            </Badge>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {PERMISSION_MODULES.map((module) => {
            const ModIcon = module.icon;
            return (
              <Card key={module.key} withBorder radius="md" padding="md">
                <Group justify="space-between" align="flex-start" mb="xs">
                  <ThemeIcon size={38} radius="md" color={module.color} variant="light">
                    <ModIcon size={20} />
                  </ThemeIcon>
                  <Badge size="xs" color={module.color} variant="light">
                    {accessLabel(module.access)}
                  </Badge>
                </Group>

                <Text size="sm" fw={700} c="primary.9" mb={4}>
                  {t(`roles.modules.${module.key}.title`)}
                </Text>
                <Text size="xs" c="dimmed" lh={1.4}>
                  {t(`roles.modules.${module.key}.description`)}
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
