import { useMemo } from 'react';
import { Alert, Grid, NumberInput, Paper, Select, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ContactFormValues } from '@/module/contacts/domain/contact';
import {
  buildAccountSelectData,
  buildPaymentTermOptions,
  groupAccountOptions,
} from '@/module/contacts/domain/contactAccountOptions';
import {
  useAccountOptions,
  useFilteredAccounts,
  usePaymentTerms,
} from '@/module/contacts/presentation/hooks/useContactQueries';

type Props = { form: UseFormReturnType<ContactFormValues> };

export function ContactMappingTab({ form }: Readonly<Props>) {
  const { t } = useTranslation('contacts');
  const accountsQuery = useAccountOptions();
  const paymentTermsQuery = usePaymentTerms();
  const arFilteredQuery = useFilteredAccounts('AR');
  const apFilteredQuery = useFilteredAccounts('AP');

  const otherAccountsLabel = t('form.options.otherAccounts');
  const receivableLabel = t('form.options.recommendedReceivable');
  const payableLabel = t('form.options.recommendedPayable');
  const immediateLabel = t('form.options.immediate');
  const daysTemplate = t('form.options.days', { count: '{count}' });

  const generalAccounts = useMemo(
    () => groupAccountOptions(accountsQuery.data ?? [], otherAccountsLabel),
    [accountsQuery.data, otherAccountsLabel]
  );

  const receivableData = useMemo(
    () => buildAccountSelectData(arFilteredQuery.data ?? [], generalAccounts, receivableLabel),
    [arFilteredQuery.data, generalAccounts, receivableLabel]
  );

  const payableData = useMemo(
    () => buildAccountSelectData(apFilteredQuery.data ?? [], generalAccounts, payableLabel),
    [apFilteredQuery.data, generalAccounts, payableLabel]
  );

  const paymentTermOptions = useMemo(
    () =>
      buildPaymentTermOptions(paymentTermsQuery.data ?? [], {
        immediate: immediateLabel,
        days: (count) => daysTemplate.replace('{count}', String(count)),
      }),
    [paymentTermsQuery.data, immediateLabel, daysTemplate]
  );

  const paymentTerm = form.values.mappingAccount.defaultPaymentTerm;

  return (
    <Stack gap="md">
      <Alert color="blue" icon={<IconInfoCircle size={16} />}>
        {t('form.mapping.notice')}
      </Alert>

      <Paper withBorder radius="md" p="md" bg="white">
        <Text fw={700} size="sm" c="primary.9" mb="xs">
          {t('form.mapping.accountsTitle')}
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.mapping.receivable.label')}
              description={t('form.mapping.receivable.description')}
              placeholder={t('form.mapping.receivable.placeholder')}
              data={receivableData}
              searchable
              clearable
              nothingFoundMessage={t('form.mapping.accountNotFound')}
              {...form.getInputProps('mappingAccount.arAccount')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.mapping.payable.label')}
              description={t('form.mapping.payable.description')}
              placeholder={t('form.mapping.payable.placeholder')}
              data={payableData}
              searchable
              clearable
              nothingFoundMessage={t('form.mapping.accountNotFound')}
              {...form.getInputProps('mappingAccount.apAccount')}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder radius="md" p="md" bg="white">
        <Text fw={700} size="sm" c="primary.9" mb="xs">
          {t('form.mapping.termsTitle')}
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.mapping.standardTerm.label')}
              description={t('form.mapping.standardTerm.description')}
              data={paymentTermOptions}
              value={paymentTerm !== null && paymentTerm !== undefined ? String(paymentTerm) : null}
              onChange={(value) =>
                form.setFieldValue(
                  'mappingAccount.defaultPaymentTerm',
                  value !== null ? Number(value) : 0
                )
              }
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              label={t('form.mapping.termDays.label')}
              description={t('form.mapping.termDays.description')}
              min={0}
              max={365}
              {...form.getInputProps('mappingAccount.defaultPaymentTerm')}
            />
          </Grid.Col>
        </Grid>
      </Paper>
    </Stack>
  );
}
