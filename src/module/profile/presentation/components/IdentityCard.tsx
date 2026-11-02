import { Avatar, Badge, Box, Divider, Group, Paper, Stack, Text, Title, ThemeIcon } from '@mantine/core';
import {
  IconCalendar,
  IconCircleCheck,
  IconCircleDashed,
  IconClockEdit,
  IconShieldCheck,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import { formatDate, initialsOf, type Profile } from '../../domain/profile';

const pill = {
  tt: 'none',
  radius: 'sm',
  styles: { root: { maxWidth: 'none', overflow: 'visible' }, label: { overflow: 'visible' } },
} as const;

function Fact({
  icon,
  label,
  children,
}: Readonly<{ icon: ReactNode; label: string; children: ReactNode }>) {
  return (
    <Group gap="sm" wrap="nowrap" align="center">
      <ThemeIcon size={34} radius="md" variant="light" color="primary">
        {icon}
      </ThemeIcon>
      <Box style={{ minWidth: 0 }}>
        <Text fz="xs" c="dimmed" fw={600} lh={1.2}>
          {label}
        </Text>
        <Box mt={2}>{children}</Box>
      </Box>
    </Group>
  );
}

export function IdentityCard({ user }: Readonly<{ user: Profile }>) {
  const { t, currentLanguage } = useTranslation('profile');
  const roleNames = user.roles.map((role) => role.name);
  const showLegacyRole = roleNames.length === 0 && user.role === 'superadmin';

  return (
    <Paper withBorder radius="lg" bg="white" p={{ base: 'md', sm: 'lg' }}>
      <Group justify="space-between" align="center" wrap="wrap" gap="lg">
        <Group gap="lg" wrap="nowrap" align="center" style={{ minWidth: 0, flex: '1 1 320px' }}>
          <Avatar
            size={72}
            radius="xl"
            color="primary"
            variant="light"
            fz="xl"
            fw={700}
            style={{
              border: '2px solid var(--mantine-color-primary-1)',
              flexShrink: 0,
            }}
          >
            {initialsOf(user.name)}
          </Avatar>

          <Stack gap={6} style={{ minWidth: 0 }}>
            <Group gap="xs" align="center" wrap="wrap">
              <Title order={3} fz="xl" fw={700} lh={1.25} c="primary.9" style={{ wordBreak: 'break-word' }}>
                {user.name || t('identity.defaultName')}
              </Title>
              {roleNames.map((name) => (
                <Badge
                  key={name}
                  variant="light"
                  color="primary"
                  leftSection={<IconShieldCheck size={13} />}
                  {...pill}
                >
                  {name}
                </Badge>
              ))}
              {showLegacyRole && (
                <Badge
                  variant="light"
                  color="primary"
                  leftSection={<IconShieldCheck size={13} />}
                  {...pill}
                >
                  {t('identity.superAdmin')}
                </Badge>
              )}
              {roleNames.length === 0 && !showLegacyRole && (
                <Badge variant="light" color="gray" {...pill}>
                  {t('identity.noRole')}
                </Badge>
              )}
            </Group>

            <Text size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>
              {user.email}
            </Text>

            <Group gap={6} mt={2}>
              <Badge
                variant="light"
                color={user.isActive ? 'teal' : 'gray'}
                leftSection={
                  user.isActive ? <IconCircleCheck size={13} /> : <IconCircleDashed size={13} />
                }
                {...pill}
              >
                {user.isActive ? t('identity.active') : t('identity.inactive')}
              </Badge>
              <Badge
                variant="light"
                color={user.isEmailVerified ? 'blue' : 'gray'}
                leftSection={<IconShieldCheck size={13} />}
                {...pill}
              >
                {user.isEmailVerified ? t('identity.verified') : t('identity.unverified')}
              </Badge>
            </Group>
          </Stack>
        </Group>

        <Paper withBorder shadow="none" radius="md" px="md" py="sm" bg="gray.0">
          <Group gap="lg" wrap="wrap">
            <Fact icon={<IconCalendar size={18} />} label={t('identity.joined')}>
              <Text size="sm" fw={600} c="primary.9">
                {formatDate(user.createdAt, currentLanguage)}
              </Text>
            </Fact>
            <Divider orientation="vertical" color="gray.2" visibleFrom="xs" />
            <Fact icon={<IconClockEdit size={18} />} label={t('identity.updated')}>
              <Text size="sm" fw={600} c="primary.9">
                {formatDate(user.updatedAt, currentLanguage, true)}
              </Text>
            </Fact>
          </Group>
        </Paper>
      </Group>
    </Paper>
  );
}
