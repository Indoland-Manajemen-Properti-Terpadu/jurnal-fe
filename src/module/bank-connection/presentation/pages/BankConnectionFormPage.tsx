import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconInfoCircle, IconPlugConnected } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCompanySite } from '@/module/profile';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import {
  MEMO_MAX_LENGTH,
  emptyConnectionForm,
  toConnectionBody,
  toDraftBody,
  validateConnectionForm,
  type AccountType,
  type ConnectionFormValues,
  type FormErrors,
} from '@/module/bank-connection/domain/connectionForm';
import {
  validateDocuments,
  type DocumentErrors,
  type DocumentFiles,
  type DocumentType,
} from '@/module/bank-connection/domain/connectionDocuments';
import { invalidFormFields } from '@/module/bank-connection/domain/serverFields';
import { isEditable } from '@/module/bank-connection/domain/connectionStatus';
import { connectionErrorKey } from '@/module/bank-connection/domain/errorKey';
import { ConnectionFields } from '@/module/bank-connection/presentation/components/ConnectionFields';
import { ConnectionDocuments } from '@/module/bank-connection/presentation/components/ConnectionDocuments';
import { FeeNotice } from '@/module/bank-connection/presentation/components/FeeNotice';
import { FormAside } from '@/module/bank-connection/presentation/components/FormAside';
import { useSaveConnection } from '@/module/bank-connection/presentation/hooks/useBankConnectionMutations';
import { useBankConnection } from '@/module/bank-connection/presentation/hooks/useBankConnectionQueries';
import { useAvailableProviders } from '@/module/bank-connection/presentation/hooks/useAvailableProviders';

/** Step 1: the form. New request (`?providerId=&accountId=`) or the correction of a draft or a request sent back. */
export default function BankConnectionFormPage() {
  const { t } = useTranslation('bankConnection');
  const navigate = useNavigate();
  const { connectionId } = useParams();
  const [params] = useSearchParams();
  const editing = Boolean(connectionId);

  const existing = useBankConnection(connectionId);
  const providers = useAvailableProviders();
  const accounts = useSimpleAccounts({ isBankAndCash: true });
  const save = useSaveConnection();
  const { site } = useCompanySite();

  const providerId = editing ? existing.data?.providerId : (params.get('providerId') ?? undefined);
  const provider = providers.providers?.find((item) => item.id === providerId);
  const typeOptions: AccountType[] = provider?.accountTypes.length
    ? provider.accountTypes
    : ['CORPORATE', 'INDIVIDUAL'];

  const [values, setValues] = useState<ConnectionFormValues>(() => ({
    ...emptyConnectionForm(),
    accountId: params.get('accountId') ?? '',
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverInvalid, setServerInvalid] = useState<Set<keyof ConnectionFormValues>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFiles>({});
  const [docErrors, setDocErrors] = useState<DocumentErrors>({});
  /** Set when a step after saving failed, so the next try updates that request instead of creating another. */
  const [draftId, setDraftId] = useState<string | undefined>();
  const filled = useRef(false);
  const held = Object.fromEntries(
    (existing.data?.documents ?? []).map((item) => [item.type, item.fileName])
  ) as Partial<Record<DocumentType, string>>;

  // Editing: the non-sensitive fields come back; the account number and national id never do.
  useEffect(() => {
    const connection = existing.data;
    if (!editing || !connection || filled.current) return;
    filled.current = true;
    setValues((current) => ({
      ...current,
      accountId: connection.accountId,
      accountType: connection.accountType,
      accountHolderName: connection.accountHolderName ?? '',
      signatoryName: connection.signatoryName ?? '',
      memo: connection.memo ?? '',
    }));
  }, [editing, existing.data]);

  // The type must be one the bank offers.
  useEffect(() => {
    if (
      provider &&
      !provider.accountTypes.includes(values.accountType) &&
      provider.accountTypes[0]
    ) {
      setValues((current) => ({ ...current, accountType: provider.accountTypes[0] }));
    }
  }, [provider, values.accountType]);

  const accountOptions = useMemo(
    () =>
      accounts.accounts.map((account) => ({
        value: account.id,
        label: `${account.accountNumber} · ${account.name}`,
      })),
    [accounts.accounts]
  );

  const set = <K extends keyof ConnectionFormValues>(key: K, value: ConnectionFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setServerInvalid((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };

  const message = (key: keyof ConnectionFormValues): string | undefined => {
    const error = errors[key];
    if (error) return t(`form.errors.${error}`);
    return serverInvalid.has(key) ? t('form.errors.invalid') : undefined;
  };
  const blur = (key: keyof ConnectionFormValues) => {
    const error = validateConnectionForm(values)[key];
    setErrors((current) => ({ ...current, [key]: error }));
  };

  const run = (submit: boolean) => {
    setFormError(null);
    if (!provider) {
      setFormError(t('form.missingBank'));
      return;
    }
    if (submit) {
      const found = validateConnectionForm(values);
      const missing = validateDocuments(documents, Object.keys(held) as DocumentType[]);
      setErrors(found);
      setDocErrors(missing);
      if (Object.keys(found).length > 0 || Object.keys(missing).length > 0) {
        setFormError(t('form.incomplete'));
        return;
      }
    } else if (!values.accountId) {
      setErrors({ accountId: 'required' });
      setFormError(t('form.incomplete'));
      return;
    }

    save.mutate(
      {
        id: connectionId ?? draftId,
        submit,
        documents,
        body: submit ? toConnectionBody(provider.id, values) : toDraftBody(provider.id, values),
      },
      {
        onSuccess: (saved) => {
          if (!submit) notifications.show({ color: 'teal', message: t('form.draftSaved') });
          navigate(routes.bankConnection.detail.replace(':connectionId', saved.id));
        },
        onError: (error) => {
          if (error.savedId) setDraftId(error.savedId);
          setFormError(t(connectionErrorKey(error)));
          if (error.fieldErrors) setServerInvalid(invalidFormFields(error.fieldErrors));
        },
      }
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(true);
  };

  const notEditable = editing && existing.data && !isEditable(existing.data.status);
  const loading = (editing && existing.isLoading) || providers.isLoading;

  return (
    <AppShellLayout withFooter>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconPlugConnected}
            title={t('form.title', { bank: provider?.bankName ?? t('title') })}
            description={t('breadcrumb')}
            actions={
              <Button variant="default" radius="md" onClick={() => navigate(-1)}>
                {t('back')}
              </Button>
            }
          />

          {loading && <Skeleton height={320} radius="md" />}

          {!loading && !provider && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange" radius="md">
              <Stack gap="xs" align="flex-start">
                <span>{t('form.missingBank')}</span>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => navigate(routes.bankConnection.main)}
                >
                  {t('form.chooseBank')}
                </Button>
              </Stack>
            </Alert>
          )}

          {notEditable && (
            <Alert color="orange" radius="md">
              {t('errors.CONNECTION_NOT_EDITABLE')}
            </Alert>
          )}

          {!loading && provider && !notEditable && (
            <Grid gutter="lg" align="flex-start">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Paper
                  component="form"
                  withBorder
                  radius="md"
                  p="lg"
                  bg="white"
                  onSubmit={onSubmit}
                  noValidate
                >
                  <Stack gap="xl">
                    {formError && (
                      <Alert
                        icon={<IconAlertCircle size={16} />}
                        color="red"
                        radius="md"
                        role="alert"
                      >
                        {formError}
                      </Alert>
                    )}
                    {editing && (
                      <Alert icon={<IconInfoCircle size={16} />} color="primary" radius="md">
                        {t('form.resubmitNote')}
                      </Alert>
                    )}

                    <ConnectionFields
                      provider={provider}
                      site={site}
                      accountOptions={accountOptions}
                      values={values}
                      typeOptions={typeOptions}
                      editing={editing}
                      message={message}
                      set={set}
                      blur={blur}
                    />

                    <Stack gap="md" component="fieldset" m={0} p={0} style={{ border: 0 }}>
                      <Text component="legend" fz={16} fw={700} mb="sm">
                        {t('form.accountSection')}
                      </Text>
                      <TextInput
                        label={t('form.holder')}
                        value={values.accountHolderName}
                        onChange={(event) => set('accountHolderName', event.currentTarget.value)}
                        onBlur={() => blur('accountHolderName')}
                        error={message('accountHolderName')}
                        autoComplete="off"
                        withAsterisk
                      />
                      {values.accountType === 'CORPORATE' && (
                        <TextInput
                          label={t('form.corporateId')}
                          description={t('form.corporateIdHelp')}
                          value={values.corporateId}
                          onChange={(event) => set('corporateId', event.currentTarget.value)}
                          onBlur={() => blur('corporateId')}
                          error={message('corporateId')}
                          autoComplete="off"
                          withAsterisk
                        />
                      )}
                      <TextInput
                        label={t('form.number')}
                        value={values.bankAccountNumber}
                        onChange={(event) => set('bankAccountNumber', event.currentTarget.value)}
                        onBlur={() => blur('bankAccountNumber')}
                        error={message('bankAccountNumber')}
                        inputMode="numeric"
                        autoComplete="off"
                        withAsterisk
                      />
                      <TextInput
                        label={t('form.signatory')}
                        description={t('form.signatoryHelp')}
                        value={values.signatoryName}
                        onChange={(event) => set('signatoryName', event.currentTarget.value)}
                        onBlur={() => blur('signatoryName')}
                        error={message('signatoryName')}
                        autoComplete="off"
                        withAsterisk
                      />
                      <TextInput
                        label={t('form.nationalId')}
                        value={values.signatoryNationalId}
                        onChange={(event) => set('signatoryNationalId', event.currentTarget.value)}
                        onBlur={() => blur('signatoryNationalId')}
                        error={message('signatoryNationalId')}
                        inputMode="numeric"
                        maxLength={16}
                        autoComplete="off"
                        withAsterisk
                      />
                      <ConnectionDocuments
                        files={documents}
                        errors={docErrors}
                        held={held}
                        onChange={(type, file) => {
                          setDocuments((current) => ({ ...current, [type]: file ?? undefined }));
                          setDocErrors((current) => ({ ...current, [type]: undefined }));
                        }}
                      />
                      <Textarea
                        label={t('form.memo')}
                        description={t('form.memoCount', {
                          count: values.memo.length,
                          max: MEMO_MAX_LENGTH,
                        })}
                        value={values.memo}
                        onChange={(event) => set('memo', event.currentTarget.value)}
                        maxLength={MEMO_MAX_LENGTH}
                        rows={3}
                      />
                    </Stack>

                    <FeeNotice provider={provider} accountType={values.accountType} />

                    <Checkbox
                      checked
                      disabled
                      label={t('form.feedTitle')}
                      description={t('form.feedBody')}
                      readOnly
                    />

                    <Group justify="space-between">
                      <Button variant="default" onClick={() => navigate(-1)}>
                        {t('back')}
                      </Button>
                      <Group gap="sm">
                        {!editing && (
                          <Button
                            variant="default"
                            onClick={() => run(false)}
                            disabled={save.isPending}
                          >
                            {t('form.saveDraft')}
                          </Button>
                        )}
                        <Button type="submit" loading={save.isPending}>
                          {existing.data?.status === 'NEEDS_REVISION'
                            ? t('form.fixAndSubmit')
                            : t('form.submit')}
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
                <FormAside />
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
