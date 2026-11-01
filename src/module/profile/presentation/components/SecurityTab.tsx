import { useState } from 'react';
import { Alert, Button, Grid, PasswordInput, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconKey } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { useAuthStore } from '@/store/useAuthentications';
import { canChangePassword, getPasswordChecks } from '../../domain/profile';
import {
  PasswordChangeFailure,
  type PasswordChangeError,
} from '../../infrastructure/passwordError';
import { useChangePassword } from '../hooks/useProfileQueries';
import { PasswordChecklist } from './PasswordChecklist';
import { SectionCard } from './SectionCard';

export function SecurityTab() {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [failure, setFailure] = useState<PasswordChangeError | null>(null);

  const checks = getPasswordChecks(current, password, confirmation);
  const ready = canChangePassword(current, password, confirmation);

  const submit = () => {
    if (!ready) return;
    setFailure(null);
    change.mutate(
      { currentPassword: current, newPassword: password },
      {
        onSuccess: () => {
          notifications.show({
            color: 'teal',
            title: t('notifications.successTitle'),
            message: t('security.changed'),
          });
          // The API signs the user out of every device, so continue from the sign-in page.
          clearTokens();
          navigate(routes.login);
        },
        onError: (error) =>
          setFailure(error instanceof PasswordChangeFailure ? error.kind : 'unknown'),
      }
    );
  };

  return (
    <SectionCard icon={IconKey} title={t('security.title')} subtitle={t('security.subtitle')}>
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack
            gap="md"
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <PasswordInput
              label={t('security.current')}
              autoComplete="current-password"
              value={current}
              onChange={(event) => {
                setCurrent(event.currentTarget.value);
                setFailure(null);
              }}
              error={
                failure === 'currentIncorrect' ? t('security.errors.currentIncorrect') : undefined
              }
            />
            <PasswordInput
              label={t('security.new')}
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.currentTarget.value);
                setFailure(null);
              }}
              error={failure === 'sameAsCurrent' ? t('security.errors.sameAsCurrent') : undefined}
            />
            <PasswordInput
              label={t('security.confirm')}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.currentTarget.value)}
              error={
                confirmation !== '' && password !== confirmation
                  ? t('security.errors.mismatch')
                  : undefined
              }
            />
            {(failure === 'invalid' || failure === 'network' || failure === 'unknown') && (
              <Alert color="red" variant="light" role="alert">
                {t(`security.errors.${failure}`)}
              </Alert>
            )}
            <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
              {t('security.notice')}
            </Alert>
            <Button type="submit" loading={change.isPending} disabled={!ready}>
              {change.isPending ? t('security.submitting') : t('security.submit')}
            </Button>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <PasswordChecklist checks={checks} />
        </Grid.Col>
      </Grid>
    </SectionCard>
  );
}
