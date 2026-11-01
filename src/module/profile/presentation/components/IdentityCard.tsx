import { Avatar, Badge, Box, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
  IconBuilding,
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
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <Box c="dimmed" pt={2}>
        {icon}
      </Box>
      <div style={{ minWidth: 0 }}>
        <Text fz={11} c="dimmed" fw={600} tt="uppercase" lts={0.5}>
          {label}
        </Text>
        <div>{children}</div>
      </div>
    </Group>
  );
}

export function IdentityCard({ user }: Readonly<{ user: Profile }>) {
  const { t, currentLanguage } = useTranslation('profile');
  const roleNames = user.roles.map((role) => role.name);
  const showLegacyRole = roleNames.length === 0 && user.role === 'superadmin';

  return (
    <Paper withBorder radius="lg" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Box
        h={96}
        style={{
          background:
            'linear-gradient(120deg, var(--mantine-color-primary-7) 0%, var(--mantine-color-primary-5) 55%, var(--mantine-color-secondary-5) 100%)',
        }}
      />
      <Stack gap="md" px="lg" pb="lg" mt={-44}>
        <Avatar
          size={88}
          radius={88}
          color="primary"
          variant="filled"
          fz={30}
          fw={700}
          style={{
            border: '4px solid var(--mantine-color-white)',
            boxShadow: '0 4px 14px color-mix(in srgb, var(--mantine-color-black) 18%, transparent)',
          }}
        >
          {initialsOf(user.name)}
        </Avatar>

        <div>
          <Title order={3} fz={20} lh={1.25} c="primary.9" style={{ wordBreak: 'break-word' }}>
            {user.name || t('identity.defaultName')}
          </Title>
          <Text size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>
            {user.email}
          </Text>
        </div>

        <Group gap={6}>
          <Badge
            variant="light"
            color={user.isActive ? 'green' : 'gray'}
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

        <Divider />

        <Stack gap="md">
          <Fact icon={<IconShieldCheck size={16} />} label={t('identity.roles')}>
            <Group gap={6} mt={4}>
              {roleNames.map((name) => (
                <Badge key={name} variant="light" color="primary" {...pill}>
                  {name}
                </Badge>
              ))}
              {showLegacyRole && (
                <Badge variant="light" color="primary" {...pill}>
                  {t('identity.superAdmin')}
                </Badge>
              )}
              {roleNames.length === 0 && !showLegacyRole && (
                <Text size="sm" c="dimmed">
                  {t('identity.noRole')}
                </Text>
              )}
            </Group>
          </Fact>
          {user.site && (
            <Fact icon={<IconBuilding size={16} />} label={t('identity.site')}>
              <Text size="sm" fw={500}>
                {user.site.name}
              </Text>
            </Fact>
          )}
          <Fact icon={<IconCalendar size={16} />} label={t('identity.joined')}>
            <Text size="sm">{formatDate(user.createdAt, currentLanguage)}</Text>
          </Fact>
          <Fact icon={<IconClockEdit size={16} />} label={t('identity.updated')}>
            <Text size="sm">{formatDate(user.updatedAt, currentLanguage, true)}</Text>
          </Fact>
        </Stack>
      </Stack>
    </Paper>
  );
}
