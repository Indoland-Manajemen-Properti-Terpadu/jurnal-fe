import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconInfoCircle,
  IconLock,
  IconMapPin,
  IconPhoto,
} from '@tabler/icons-react';
import { DetailCardHeader } from '@/components/DetailCardHeader/DetailCardHeader';
import { UnsavedChangesGuard } from '@/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { useTranslation } from '@/i18n';
import {
  COMPANY_LIMITS,
  hasCompanyErrors,
  isCompanyFormChanged,
  toCompanyBody,
  toCompanyForm,
  validateCompanyForm,
  type CompanyForm,
} from '@/module/settings/domain/companyProfile';
import { resolveLogoUrl } from '@/module/settings/infrastructure/companyProfileApi';
import { CompanyLetterhead } from '@/module/settings/presentation/components/company/CompanyLetterhead';
import { CompanyLogoField } from '@/module/settings/presentation/components/company/CompanyLogoField';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useCompanyErrorMessage,
  useCompanyMutations,
  useCompanyProfile,
  useCompanyRights,
} from '@/module/settings/presentation/hooks/useCompanyProfile';

const card = { withBorder: true, radius: 'lg', p: 'lg', bg: 'white' } as const;

/** The company identity printed in the header of purchasing documents, edited beside a live preview of that header. */
export default function CompanySettingPage() {
  const { t } = useTranslation('settings');
  const query = useCompanyProfile();
  const describe = useCompanyErrorMessage();
  const canEdit = useCompanyRights().update;
  const { save, uploadLogo, removeLogo } = useCompanyMutations();
  const profile = query.data;

  // `draft` holds what is typed; until the person types, the page shows what is saved.
  const [draft, setDraft] = useState<CompanyForm | null>(null);
  const [attempted, setAttempted] = useState(false);
  const saved = profile ? toCompanyForm(profile) : null;
  const form = draft ?? saved;
  const changed = Boolean(draft && saved && isCompanyFormChanged(draft, saved));
  const changedRef = useRef(changed);
  changedRef.current = changed;

  const errors = form ? validateCompanyForm(form) : {};
  const blocked = hasCompanyErrors(errors);

  const set = (key: keyof CompanyForm, value: string) => {
    if (form) setDraft({ ...form, [key]: value });
  };
  const fieldError = (key: keyof CompanyForm) => {
    const found = attempted ? errors[key] : undefined;
    if (!found) return undefined;
    return t(`company.error.${found}`, { max: COMPANY_LIMITS[key] });
  };

  const submit = () => {
    if (!form || !changed) return;
    if (blocked) {
      setAttempted(true);
      return;
    }
    save.mutate(toCompanyBody(form), {
      onSuccess: () => {
        setDraft(null);
        setAttempted(false);
      },
    });
  };

  const discard = () => {
    setDraft(null);
    setAttempted(false);
  };

  const header = { title: t('company.title'), description: t('company.description') };

  if (query.isPending) {
    return (
      <SettingsLayout {...header}>
        <Stack gap="lg">
          <Skeleton height={260} radius="lg" />
          <Skeleton height={200} radius="lg" />
        </Stack>
      </SettingsLayout>
    );
  }

  if (query.isError || !profile || !form) {
    return (
      <SettingsLayout {...header}>
        <Alert
          color="red"
          variant="light"
          radius="md"
          icon={<IconInfoCircle size={18} />}
          title={t('company.loadError')}
        >
          <Stack gap="xs" align="flex-start">
            <Text size="sm">{describe(query.error)}</Text>
            <Button variant="default" size="xs" onClick={() => query.refetch()}>
              {t('company.retry')}
            </Button>
          </Stack>
        </Alert>
      </SettingsLayout>
    );
  }

  const field = (key: keyof CompanyForm) => ({
    value: form[key],
    maxLength: COMPANY_LIMITS[key],
    readOnly: !canEdit,
    error: fieldError(key),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key, event.currentTarget.value),
  });

  return (
    <SettingsLayout {...header}>
      <UnsavedChangesGuard
        when={() => changedRef.current}
        title={t('company.leave.title')}
        body={t('company.leave.body')}
        leaveLabel={t('company.leave.confirm')}
        stayLabel={t('company.leave.stay')}
      />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Grid gutter="lg" align="flex-start">
          <Grid.Col span={{ base: 12, lg: 7 }}>
            <Stack gap="lg">
              {!canEdit && (
                <Alert color="blue" variant="light" radius="md" icon={<IconLock size={18} />}>
                  {t('company.readOnly')}
                </Alert>
              )}

              <Paper {...card}>
                <DetailCardHeader
                  icon={<IconBuildingStore size={18} stroke={1.8} />}
                  title={t('company.identity.title')}
                  subtitle={t('company.identity.subtitle')}
                />
                <Stack gap="md">
                  <TextInput
                    radius="md"
                    withAsterisk
                    label={t('company.field.name')}
                    description={t('company.field.nameHelp')}
                    placeholder={t('company.field.namePlaceholder')}
                    {...field('name')}
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      radius="md"
                      label={t('company.field.npwp')}
                      placeholder={t('company.field.npwpPlaceholder')}
                      {...field('npwp')}
                    />
                    <TextInput
                      radius="md"
                      label={t('company.field.phone')}
                      placeholder={t('company.field.phonePlaceholder')}
                      {...field('phone')}
                    />
                    <TextInput
                      radius="md"
                      type="email"
                      label={t('company.field.email')}
                      description={t('company.field.notPrinted')}
                      placeholder={t('company.field.emailPlaceholder')}
                      {...field('email')}
                    />
                    <TextInput
                      radius="md"
                      label={t('company.field.website')}
                      description={t('company.field.notPrinted')}
                      placeholder={t('company.field.websitePlaceholder')}
                      {...field('website')}
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper {...card}>
                <DetailCardHeader
                  icon={<IconMapPin size={18} stroke={1.8} />}
                  title={t('company.address.title')}
                  subtitle={t('company.address.subtitle')}
                />
                <Stack gap="md">
                  <Textarea
                    radius="md"
                    autosize
                    minRows={2}
                    label={t('company.field.address')}
                    placeholder={t('company.field.addressPlaceholder')}
                    {...field('address')}
                  />
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput
                      radius="md"
                      label={t('company.field.city')}
                      placeholder={t('company.field.cityPlaceholder')}
                      {...field('city')}
                    />
                    <TextInput
                      radius="md"
                      label={t('company.field.postalCode')}
                      placeholder={t('company.field.postalCodePlaceholder')}
                      inputMode="numeric"
                      {...field('postalCode')}
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper {...card}>
                <DetailCardHeader
                  icon={<IconPhoto size={18} stroke={1.8} />}
                  title={t('company.logo.title')}
                  subtitle={t('company.logo.subtitle')}
                />
                <CompanyLogoField
                  logo={profile.logo}
                  name={form.name}
                  canEdit={canEdit}
                  uploading={uploadLogo.isPending}
                  removing={removeLogo.isPending}
                  onPick={(file) => uploadLogo.mutate(file)}
                  onRemove={() => removeLogo.mutate()}
                />
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 5 }} pos="sticky" top={20}>
            <Stack gap="lg">
              <Paper {...card}>
                <CompanyLetterhead
                  form={form}
                  logoUrl={resolveLogoUrl(profile.logo?.filePath ?? null)}
                />
              </Paper>
              {canEdit && (
                <Paper {...card} py="md">
                  <Stack gap="sm">
                    <Text size="sm" c={changed ? 'dark.7' : 'dimmed'} aria-live="polite">
                      {changed ? t('company.actions.unsaved') : t('company.actions.upToDate')}
                    </Text>
                    <Group gap="xs" grow>
                      <Button
                        variant="default"
                        disabled={!changed || save.isPending}
                        onClick={discard}
                      >
                        {t('company.actions.discard')}
                      </Button>
                      <Button type="submit" disabled={!changed} loading={save.isPending}>
                        {t('company.actions.save')}
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </form>
    </SettingsLayout>
  );
}
