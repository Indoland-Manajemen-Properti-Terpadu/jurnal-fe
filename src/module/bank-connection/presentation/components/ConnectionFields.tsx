import { Select, Stack, Text, TextInput } from '@mantine/core';
import { INDONESIA_BANKS } from '@/constants/banks';
import { useTranslation } from '@/i18n';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import type {
  AccountType,
  ConnectionFormValues,
} from '@/module/bank-connection/domain/connectionForm';

/** "Connection details": the bank (by its full name), the company, the account to connect, and the kind of account. */
export function ConnectionFields({
  provider,
  site,
  accountOptions,
  values,
  typeOptions,
  editing,
  message,
  set,
  blur,
}: Readonly<{
  provider: BankProvider;
  site?: { name: string; code?: string };
  accountOptions: Array<{ value: string; label: string }>;
  values: ConnectionFormValues;
  typeOptions: AccountType[];
  editing: boolean;
  message: (key: keyof ConnectionFormValues) => string | undefined;
  set: <K extends keyof ConnectionFormValues>(key: K, value: ConnectionFormValues[K]) => void;
  blur: (key: keyof ConnectionFormValues) => void;
}>) {
  const { t } = useTranslation('bankConnection');
  const bankName =
    INDONESIA_BANKS.find((bank) => bank.code === provider.bankCode)?.name ?? provider.bankName;

  return (
    <Stack gap="md" component="fieldset" m={0} p={0} style={{ border: 0 }}>
      <Text component="legend" fz={16} fw={700} mb="sm">
        {t('form.connectionSection')}
      </Text>
      <TextInput label={t('form.bank')} value={bankName} readOnly />
      {site && (
        <TextInput
          label={t('form.company')}
          value={t('form.companyValue', { name: site.name, code: site.code ?? '-' })}
          readOnly
        />
      )}
      <Select
        label={t('form.account')}
        description={t('form.accountHelp')}
        placeholder={t('form.accountPlaceholder')}
        data={accountOptions}
        value={values.accountId || null}
        onChange={(value) => set('accountId', value ?? '')}
        onBlur={() => blur('accountId')}
        error={message('accountId')}
        disabled={editing}
        searchable
        withAsterisk
      />
      <Select
        label={t('form.accountType')}
        data={typeOptions.map((type) => ({
          value: type,
          label: type === 'CORPORATE' ? t('chooser.typeCorporate') : t('chooser.typeIndividual'),
        }))}
        value={values.accountType}
        onChange={(value) => set('accountType', (value as AccountType) ?? 'CORPORATE')}
        allowDeselect={false}
      />
    </Stack>
  );
}
