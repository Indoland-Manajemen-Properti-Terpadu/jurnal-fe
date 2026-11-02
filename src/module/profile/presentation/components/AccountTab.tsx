import { useState } from 'react';
import {
  Alert,
  Button,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconBuilding, IconInfoCircle, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  isProfileDirty,
  validatePersonalInfo,
  type PersonalInfoError,
  type Profile,
  type UpdateProfileInput,
} from '../../domain/profile';
import { CopyIdField } from './CopyIdField';
import { SectionCard } from './SectionCard';

type AccountTabProps = {
  user: Profile;
  /** Name and email can only be changed by someone who may update users. */
  canEdit: boolean;
  isSaving: boolean;
  onSubmit: (input: UpdateProfileInput) => void;
};

export function AccountTab({ user, canEdit, isSaving, onSubmit }: Readonly<AccountTabProps>) {
  const { t } = useTranslation('profile');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [touched, setTouched] = useState(false);

  const error: PersonalInfoError | null = validatePersonalInfo(name, email);
  const dirty = isProfileDirty(user, name, email);
  const readOnlyInputStyles = !canEdit
    ? { input: { backgroundColor: 'var(--mantine-color-gray-0)' } }
    : undefined;

  const save = () => {
    setTouched(true);
    if (error || !dirty) return;
    onSubmit({ id: user.id, name, email });
  };

  const reset = () => {
    setName(user.name);
    setEmail(user.email);
    setTouched(false);
  };

  return (
    <Grid gutter="lg" align="stretch">
      <Grid.Col span={{ base: 12, md: user.site ? 7 : 12 }}>
        <SectionCard
          icon={IconUser}
          title={t('account.personalTitle')}
          subtitle={t('account.personalSubtitle')}
        >
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label={t('account.name')}
              placeholder={t('account.namePlaceholder')}
              value={name}
              readOnly={!canEdit}
              withAsterisk={canEdit}
              styles={readOnlyInputStyles}
              onChange={(event) => setName(event.currentTarget.value)}
              error={touched && error === 'nameEmpty' ? t('account.nameEmpty') : undefined}
            />
            <TextInput
              label={t('account.email')}
              placeholder={t('account.emailPlaceholder')}
              type="email"
              value={email}
              readOnly={!canEdit}
              withAsterisk={canEdit}
              styles={readOnlyInputStyles}
              onChange={(event) => setEmail(event.currentTarget.value)}
              error={touched && error === 'emailInvalid' ? t('account.emailInvalid') : undefined}
            />
          </SimpleGrid>

          {!canEdit ? (
            <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
              {t('account.readOnlyNote')}
            </Alert>
          ) : (
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={reset} disabled={!dirty || isSaving}>
                {t('account.reset')}
              </Button>
              <Button onClick={save} loading={isSaving} disabled={!dirty}>
                {isSaving ? t('account.saving') : t('account.save')}
              </Button>
            </Group>
          )}
        </SectionCard>
      </Grid.Col>

      {user.site && (
        <Grid.Col span={{ base: 12, md: 5 }}>
          <SectionCard
            icon={IconBuilding}
            title={t('account.siteTitle')}
            subtitle={t('account.siteSubtitle')}
          >
            <Stack gap="md">
              <Paper withBorder shadow="none" radius="md" p="sm" bg="gray.0">
                <Text size="xs" c="dimmed" fw={600} mb={2}>
                  {t('account.siteName')}
                </Text>
                <Text size="sm" fw={600} c="primary.9">
                  {user.site.name}
                </Text>
              </Paper>
              {user.site.code && (
                <CopyIdField label={t('account.siteCode')} value={user.site.code} />
              )}
            </Stack>
          </SectionCard>
        </Grid.Col>
      )}
    </Grid>
  );
}
