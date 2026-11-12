import { useEffect, useMemo } from 'react';
import {
  Grid,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { CONTACT_TYPES, type ContactFormValues } from '@/module/contacts/domain/contact';
import {
  buildGroupOptions,
  resolveContactGroupIds,
} from '@/module/contacts/domain/contactAccountOptions';
import { IDENTITY_TYPE_KEYS, PREFIX_KEYS } from '@/module/contacts/domain/contactForm';
import {
  identityMaxLength,
  isPassport,
  MOBILE_LENGTH,
  NPWP_MAX_LENGTH,
  sanitizeIdentityNumber,
  TELEPHONE_LENGTH,
} from '@/module/contacts/domain/contactInput';
import { useContactGroups } from '@/module/contacts/presentation/hooks/useContactQueries';
import { SanitizedInput } from './SanitizedInput';

type Props = { form: UseFormReturnType<ContactFormValues> };

export function ContactGeneralTab({ form }: Readonly<Props>) {
  const { t } = useTranslation('contacts');
  const groupsQuery = useContactGroups();
  const identityType = form.values.identity.type;

  const groupOptions = useMemo(() => buildGroupOptions(groupsQuery.data ?? []), [groupsQuery.data]);
  useEffect(() => {
    if (!groupsQuery.data || !form.values.contactGroups?.length) return;
    const resolved = resolveContactGroupIds(form.values.contactGroups, groupsQuery.data);
    if (
      resolved.every(Boolean) &&
      resolved.some((id, index) => id !== form.values.contactGroups?.[index])
    ) {
      form.setFieldValue('contactGroups', resolved);
    }
  }, [groupsQuery.data, form.values.contactGroups]);
  const contactTypeOptions = CONTACT_TYPES.map((type) => ({
    value: type,
    label: t(`form.options.contactType.${type}`),
  }));
  const prefixOptions = PREFIX_KEYS.map((key) => ({
    value: key,
    label: t(`form.options.prefix.${key}`),
  }));
  const identityOptions = IDENTITY_TYPE_KEYS.map((key) => ({
    value: key,
    label: t(`form.options.identity.${key}`),
  }));

  return (
    <Stack gap="md">
      {/* 1. Profil & Tipe Kontak */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <TextInput
            label={t('form.general.displayName.label')}
            description={t('form.general.displayName.description')}
            placeholder={t('form.general.displayName.placeholder')}
            withAsterisk
            {...form.getInputProps('displayName')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <MultiSelect
            label={t('form.general.contactType.label')}
            description={t('form.general.contactType.description')}
            placeholder={t('form.general.contactType.placeholder')}
            data={contactTypeOptions}
            withAsterisk
            {...form.getInputProps('contactType')}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label={t('form.general.companyName.label')}
            placeholder={t('form.general.companyName.placeholder')}
            {...form.getInputProps('companyName')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <MultiSelect
            label={t('form.general.groups.label')}
            placeholder={t('form.general.groups.placeholder')}
            data={groupOptions}
            searchable
            clearable
            {...form.getInputProps('contactGroups')}
          />
        </Grid.Col>
      </Grid>

      {/* 2. Rincian Nama Personal / PIC */}
      <Paper withBorder radius="md" p="md" bg="gray.0">
        <Group gap="xs" mb="xs">
          <ThemeIcon size={24} radius="sm" variant="light" color="primary">
            <IconUser size={14} />
          </ThemeIcon>
          <Text size="xs" fw={700} c="primary.9">
            {t('form.general.pic.title')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('form.general.pic.hint')}
          </Text>
        </Group>
        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Select
              label={t('form.general.prefix.label')}
              placeholder={t('form.general.prefix.placeholder')}
              data={prefixOptions}
              clearable
              searchable
              {...form.getInputProps('fullName.prefix')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TextInput
              label={t('form.general.firstName.label')}
              placeholder={t('form.general.firstName.placeholder')}
              {...form.getInputProps('fullName.firstName')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TextInput
              label={t('form.general.middleName.label')}
              placeholder={t('form.general.middleName.placeholder')}
              {...form.getInputProps('fullName.middleName')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TextInput
              label={t('form.general.lastName.label')}
              placeholder={t('form.general.lastName.placeholder')}
              {...form.getInputProps('fullName.lastName')}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* 3. Dokumen Identitas & Pajak */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label={t('form.general.identityType')}
            data={identityOptions}
            allowDeselect={false}
            {...form.getInputProps('identity.type')}
            onChange={(value) => {
              const type = value ?? 'KTP';
              form.setFieldValue('identity.type', type);
              form.setFieldValue(
                'identity.number',
                sanitizeIdentityNumber(form.values.identity.number, type).slice(
                  0,
                  identityMaxLength(type)
                )
              );
              form.clearFieldError('identity.number');
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <SanitizedInput
            label={t('form.general.identityNumber.label')}
            placeholder={t(`form.general.identityNumber.placeholder.${identityType}`)}
            numeric={!isPassport(identityType)}
            sanitize={(value) => sanitizeIdentityNumber(value, identityType)}
            maxLength={identityMaxLength(identityType)}
            error={form.errors['identity.number']}
            value={form.values.identity.number}
            onValueChange={(value) => form.setFieldValue('identity.number', value)}
            onBlur={() => form.validateField('identity.number')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <SanitizedInput
            label={t('form.general.npwp.label')}
            placeholder={t('form.general.npwp.placeholder')}
            maxLength={NPWP_MAX_LENGTH}
            error={form.errors.npwp}
            value={form.values.npwp}
            onValueChange={(value) => form.setFieldValue('npwp', value)}
            onBlur={() => form.validateField('npwp')}
          />
        </Grid.Col>
      </Grid>

      {/* 4. Kontak & Saluran Komunikasi */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            label={t('form.general.email.label')}
            placeholder={t('form.general.email.placeholder')}
            withAsterisk
            value={form.values.emails[0] ?? ''}
            error={form.errors.emails}
            onBlur={() => form.validateField('emails')}
            onChange={(e) => {
              const next = [...form.values.emails];
              next[0] = e.currentTarget.value;
              form.setFieldValue('emails', next);
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <SanitizedInput
            label={t('form.general.mobile.label')}
            placeholder={t('form.general.mobile.placeholder')}
            maxLength={MOBILE_LENGTH.max}
            error={form.errors['phones.mobile']}
            value={form.values.phones.mobile}
            onValueChange={(value) => form.setFieldValue('phones.mobile', value)}
            onBlur={() => form.validateField('phones.mobile')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <SanitizedInput
            label={t('form.general.telephone.label')}
            placeholder={t('form.general.telephone.placeholder')}
            maxLength={TELEPHONE_LENGTH.max}
            error={form.errors['phones.telephone']}
            value={form.values.phones.telephone}
            onValueChange={(value) => form.setFieldValue('phones.telephone', value)}
            onBlur={() => form.validateField('phones.telephone')}
          />
        </Grid.Col>
      </Grid>

      {/* 5. Catatan Tambahan */}
      <Textarea
        label={t('form.general.notes.label')}
        placeholder={t('form.general.notes.placeholder')}
        rows={2}
        {...form.getInputProps('otherInfo')}
      />
    </Stack>
  );
}
