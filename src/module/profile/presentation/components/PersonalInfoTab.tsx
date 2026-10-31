import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMail, IconShieldCheck, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  formatJoinedDate,
  isProfileDirty,
  validatePersonalInfo,
  type Profile,
  type UpdateProfileInput,
} from '../../domain/profile';
import { CopyIdField } from './CopyIdField';

interface PersonalInfoTabProps {
  user?: Profile;
  isSaving: boolean;
  onSubmit: (input: UpdateProfileInput) => void;
}

export function PersonalInfoTab({ user, isSaving, onSubmit }: PersonalInfoTabProps) {
  const { t } = useTranslation('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const isDirty = user && isProfileDirty(user, name, email);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (validatePersonalInfo(name, email)) {
      notifications.show({
        color: 'red',
        title: t('notifications.validationTitle'),
        message: t('notifications.emptyPersonalInfo'),
      });
      return;
    }
    onSubmit({ id: user.id, name: name.trim(), email: email.trim() });
  };

  const handleReset = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  };

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Paper withBorder radius="md" p="xl">
          <Title order={4} mb="xs" c="primary.9">
            {t('personal.title')}
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            {t('personal.description')}
          </Text>

          <form onSubmit={handleSave}>
            <Stack gap="md">
              <TextInput
                label={t('personal.nameLabel')}
                placeholder={t('personal.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                leftSection={<IconUser size={18} />}
                required
              />

              <TextInput
                label={t('personal.emailLabel')}
                placeholder={t('personal.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                leftSection={<IconMail size={18} />}
                description={t('personal.emailDescription')}
                required
              />

              <CopyIdField label={t('personal.userIdLabel')} value={user?.id} />

              <Group justify="flex-end" gap="sm" mt="md">
                <Button variant="default" onClick={handleReset} disabled={!isDirty || isSaving}>
                  {t('personal.cancel')}
                </Button>
                <Button type="submit" color="primary.6" disabled={!isDirty} loading={isSaving}>
                  {t('personal.save')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="md">
          <Paper withBorder radius="md" p="md">
            <Title order={5} mb="sm" c="primary.9">
              {t('personal.membershipTitle')}
            </Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('personal.registeredDate')}
                </Text>
                <Text size="xs" fw={600}>
                  {formatJoinedDate(user?.createdAt)}
                </Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('personal.emailStatus')}
                </Text>
                <Badge size="xs" color={user?.isEmailVerified ? 'teal' : 'yellow'}>
                  {user?.isEmailVerified
                    ? t('personal.emailVerified')
                    : t('personal.emailUnverified')}
                </Badge>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('personal.userRole')}
                </Text>
                <Badge size="xs" color="primary">
                  {user?.role || t('personal.defaultRole')}
                </Badge>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('personal.defaultSite')}
                </Text>
                <Text size="xs" fw={600}>
                  {user?.site?.name || t('emptyValue')}
                </Text>
              </Group>
            </Stack>
          </Paper>

          <Paper
            withBorder
            radius="md"
            p="md"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--mantine-color-primary-6) 4%, transparent) 0%, color-mix(in srgb, var(--mantine-color-secondary-6) 8%, transparent) 100%)',
            }}
          >
            <Group align="flex-start" gap="sm" wrap="nowrap">
              <ThemeIcon size={32} radius="md" color="primary" variant="light">
                <IconShieldCheck size={18} />
              </ThemeIcon>
              <Box>
                <Text size="xs" fw={700} c="primary.9">
                  {t('personal.integrityTitle')}
                </Text>
                <Text size="xs" c="dimmed" mt={2} lh={1.4}>
                  {t('personal.integrityText')}
                </Text>
              </Box>
            </Group>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
