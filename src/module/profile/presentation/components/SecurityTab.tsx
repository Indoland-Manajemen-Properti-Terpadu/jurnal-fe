import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  PasswordInput,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceDesktop, IconInfoCircle, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  getPasswordChecks,
  validateNewPassword,
  type Profile,
  type UpdateProfileInput,
} from '../../domain/profile';
import { PasswordChecklist } from './PasswordChecklist';

interface SecurityTabProps {
  user?: Profile;
  isSaving: boolean;
  onSubmit: (input: UpdateProfileInput, onSuccess?: () => void) => void;
}

export function SecurityTab({ user, isSaving, onSubmit }: SecurityTabProps) {
  const { t } = useTranslation('profile');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const checks = getPasswordChecks(newPassword, confirmPassword);

  const clearInputs = () => {
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const error = validateNewPassword(newPassword, confirmPassword);
    if (error) {
      notifications.show({
        color: 'red',
        title: t('notifications.validationTitle'),
        message: t(
          error === 'tooShort' ? 'notifications.passwordTooShort' : 'notifications.passwordMismatch'
        ),
      });
      return;
    }

    onSubmit({ id: user.id, password: newPassword }, clearInputs);
  };

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Paper withBorder radius="md" p="xl">
          <Title order={4} mb="xs" c="primary.9">
            {t('security.title')}
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            {t('security.description')}
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label={t('security.newPasswordLabel')}
                placeholder={t('security.newPasswordPlaceholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                leftSection={<IconLock size={18} />}
                required
              />

              <PasswordInput
                label={t('security.confirmLabel')}
                placeholder={t('security.confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                leftSection={<IconLock size={18} />}
                required
              />

              <PasswordChecklist checks={checks} />

              <Group justify="flex-end" gap="sm" mt="md">
                <Button
                  variant="default"
                  onClick={clearInputs}
                  disabled={!newPassword && !confirmPassword}
                >
                  {t('security.resetInput')}
                </Button>
                <Button
                  type="submit"
                  color="primary.6"
                  disabled={!checks.isMinLength || !checks.isMatch}
                  loading={isSaving}
                >
                  {t('security.submit')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 5 }}>
        <Stack gap="md">
          <Paper withBorder radius="md" p="md">
            <Group gap="xs" mb="xs">
              <ThemeIcon size={28} radius="md" color="teal" variant="light">
                <IconDeviceDesktop size={16} />
              </ThemeIcon>
              <Title order={5} c="primary.9">
                {t('security.sessionTitle')}
              </Title>
            </Group>
            <Text size="xs" c="dimmed" mb="sm">
              {t('security.sessionText')}
            </Text>

            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('security.encryptionMethod')}
                </Text>
                <Badge size="xs" variant="outline" color="blue">
                  {t('security.encryptionValue')}
                </Badge>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('security.refreshStatus')}
                </Text>
                <Badge size="xs" color="teal">
                  {t('security.refreshValue')}
                </Badge>
              </Group>
            </Stack>
          </Paper>

          <Paper withBorder radius="md" p="md" bg="blue.0">
            <Group align="flex-start" gap="xs">
              <IconInfoCircle size={20} color="var(--mantine-color-primary-6)" />
              <Box style={{ flex: 1 }}>
                <Text size="xs" fw={700} c="primary.9">
                  {t('security.tipsTitle')}
                </Text>
                <Text size="xs" c="primary.8" mt={2} lh={1.4}>
                  {t('security.tipsText')}
                </Text>
              </Box>
            </Group>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
