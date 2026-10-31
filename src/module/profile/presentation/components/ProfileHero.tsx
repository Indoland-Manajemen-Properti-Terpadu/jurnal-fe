import {
  Avatar,
  Badge,
  Box,
  Button,
  CopyButton,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCircleCheckFilled,
  IconCopy,
  IconMail,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatJoinedDate, type Profile } from '../../domain/profile';
import { ProfileMetricsBar } from './ProfileMetricsBar';

interface ProfileHeroProps {
  user?: Profile;
}

export function ProfileHero({ user }: ProfileHeroProps) {
  const { t } = useTranslation('profile');

  return (
    <Paper
      radius="lg"
      withBorder
      style={{
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Box
        p={{ base: 'md', sm: 'xl' }}
        style={{
          background:
            'linear-gradient(135deg, var(--mantine-color-primary-6) 0%, var(--mantine-color-blue-8) 55%, var(--mantine-color-secondary-6) 100%)',
          position: 'relative',
        }}
      >
        <Group align="center" gap="lg" wrap="wrap">
          <Avatar
            size={88}
            radius={88}
            color="primary.8"
            style={{
              border: '3.5px solid var(--mantine-color-white)',
              boxShadow:
                '0 4px 12px color-mix(in srgb, var(--mantine-color-black) 25%, transparent)',
              backgroundColor: 'var(--mantine-color-white)',
              color: 'var(--mantine-color-primary-6)',
              fontWeight: 700,
              fontSize: 'var(--jurnal-text-3xl)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>

          <Stack gap={4} style={{ flex: 1, minWidth: 220 }}>
            <Group gap="xs" wrap="wrap" align="center">
              <Title order={2} c="white" fz={{ base: 22, sm: 26 }} fw={700}>
                {user?.name || t('hero.defaultName')}
              </Title>
              <Badge
                size="md"
                variant="filled"
                color="cyan.4"
                c="primary.9"
                fw={700}
                style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {user?.role || t('hero.defaultRole')}
              </Badge>
              {user?.isEmailVerified ? (
                <Badge
                  size="md"
                  variant="light"
                  color="teal.0"
                  c="white"
                  leftSection={
                    <IconCircleCheckFilled size={14} color="var(--mantine-color-emerald-4)" />
                  }
                >
                  {t('hero.verified')}
                </Badge>
              ) : (
                <Badge size="md" variant="light" color="yellow.2" c="yellow.9">
                  {t('hero.unverified')}
                </Badge>
              )}
            </Group>

            <Group gap="md" wrap="wrap" mt={4}>
              <Group gap={6}>
                <IconMail
                  size={16}
                  color="color-mix(in srgb, var(--mantine-color-white) 85%, transparent)"
                />
                <Text size="sm" c="white" opacity={0.9}>
                  {user?.email || t('emptyValue')}
                </Text>
              </Group>

              {user?.site?.name && (
                <Group gap={6}>
                  <IconBuilding
                    size={16}
                    color="color-mix(in srgb, var(--mantine-color-white) 85%, transparent)"
                  />
                  <Text size="sm" c="white" opacity={0.9}>
                    {t('hero.site', { name: user.site.name })}
                  </Text>
                </Group>
              )}

              <Group gap={6}>
                <IconCalendar
                  size={16}
                  color="color-mix(in srgb, var(--mantine-color-white) 85%, transparent)"
                />
                <Text size="sm" c="white" opacity={0.9}>
                  {t('hero.joined', { date: formatJoinedDate(user?.createdAt) })}
                </Text>
              </Group>
            </Group>
          </Stack>

          {user?.id && (
            <CopyButton value={user.id} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? t('hero.copiedTooltip') : t('hero.copyTooltip')}
                  withArrow
                  position="bottom"
                >
                  <Button
                    size="xs"
                    variant="white"
                    c="primary.9"
                    leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    onClick={copy}
                    radius="md"
                  >
                    {copied ? t('hero.copied') : t('hero.copyButton')}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>
          )}
        </Group>
      </Box>

      <ProfileMetricsBar user={user} />
    </Paper>
  );
}
