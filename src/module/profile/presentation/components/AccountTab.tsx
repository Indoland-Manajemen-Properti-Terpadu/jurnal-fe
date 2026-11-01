import { useState } from 'react';
import { Alert, Button, Group, Stack, TextInput } from '@mantine/core';
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
    <Stack gap="lg">
      <SectionCard
        icon={IconUser}
        title={t('account.personalTitle')}
        subtitle={t('account.personalSubtitle')}
      >
        {!canEdit && (
          <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
            {t('account.readOnlyNote')}
          </Alert>
        )}
        <TextInput
          label={t('account.name')}
          placeholder={t('account.namePlaceholder')}
          value={name}
          readOnly={!canEdit}
          withAsterisk={canEdit}
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
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={touched && error === 'emailInvalid' ? t('account.emailInvalid') : undefined}
        />
        {canEdit && (
          <Group justify="flex-end">
            <Button variant="default" onClick={reset} disabled={!dirty || isSaving}>
              {t('account.reset')}
            </Button>
            <Button onClick={save} loading={isSaving} disabled={!dirty}>
              {isSaving ? t('account.saving') : t('account.save')}
            </Button>
          </Group>
        )}
      </SectionCard>

      {user.site && (
        <SectionCard
          icon={IconBuilding}
          title={t('account.siteTitle')}
          subtitle={t('account.siteSubtitle')}
        >
          <TextInput label={t('account.siteName')} value={user.site.name} readOnly />
          {user.site.code && <CopyIdField label={t('account.siteCode')} value={user.site.code} />}
        </SectionCard>
      )}
    </Stack>
  );
}
