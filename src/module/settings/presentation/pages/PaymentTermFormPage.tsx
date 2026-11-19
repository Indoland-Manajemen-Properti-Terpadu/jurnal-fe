import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Grid, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconClock, IconInfoCircle } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { UnsavedChangesGuard } from '@/components/UnsavedChangesGuard/UnsavedChangesGuard';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import {
  toPaymentTermPayload,
  type PaymentTerm,
  type PaymentTermFormValues,
} from '@/module/settings/domain/paymentTerm';
import { readPaymentTermError } from '@/module/settings/infrastructure/paymentTermApi';
import {
  PaymentTermAdvanceSection,
  PaymentTermBillingSection,
  PaymentTermDueSection,
  PaymentTermInfoSection,
  PaymentTermRetentionSection,
} from '@/module/settings/presentation/components/paymentTerms/PaymentTermFormSections';
import { usePaymentTermForm } from '@/module/settings/presentation/hooks/usePaymentTermForm';
import {
  useCreatePaymentTerm,
  usePaymentTermDetail,
  useUpdatePaymentTerm,
} from '@/module/settings/presentation/hooks/usePaymentTermQueries';

type BodyProps = { term: PaymentTerm | null };

/** The form itself; it mounts once the term (when editing) is known, so the values start right. */
function PaymentTermFormBody({ term }: Readonly<BodyProps>) {
  const { t: st } = useTranslation('settings');
  const navigate = useNavigate();
  const form = usePaymentTermForm(term);
  const create = useCreatePaymentTerm();
  const update = useUpdatePaymentTerm();
  const pending = create.isPending || update.isPending;
  const saved = useRef(false);

  const toList = () => navigate(routes.settings.paymentTerms);

  const handleSubmit = async (values: PaymentTermFormValues) => {
    const payload = toPaymentTermPayload(values);
    try {
      if (term) {
        await update.mutateAsync({ id: term.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      saved.current = true;
      toList();
    } catch {
      // The mutation already shows the failure; the page keeps what was entered.
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <UnsavedChangesGuard
        when={() => form.isDirty() && !saved.current}
        title={st('paymentTerm.form.leaveTitle')}
        body={st('paymentTerm.form.leaveBody')}
        leaveLabel={st('paymentTerm.form.leaveConfirm')}
        stayLabel={st('paymentTerm.form.leaveStay')}
      />

      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {term && (
              <Alert
                variant="light"
                color="primary"
                radius="md"
                icon={<IconInfoCircle size={18} />}
              >
                <Stack gap={2}>
                  {term.usageCount > 0 && (
                    <Text size="sm" fw={600}>
                      {st('paymentTerm.form.usedBy', { count: term.usageCount })}
                    </Text>
                  )}
                  <Text size="sm">{st('paymentTerm.form.editNote')}</Text>
                </Stack>
              </Alert>
            )}
            <PaymentTermInfoSection form={form} />
            <PaymentTermAdvanceSection form={form} />
            <PaymentTermBillingSection form={form} />
            <PaymentTermDueSection form={form} />
            <PaymentTermRetentionSection form={form} />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder radius="lg" p="lg" shadow="none" bg="white" pos="sticky" top={20}>
            <Stack gap="xs">
              <Button type="submit" size="md" radius="md" fullWidth loading={pending}>
                {term ? st('common.saveChanges') : st('paymentTerm.form.save')}
              </Button>
              <Button
                variant="default"
                size="md"
                radius="md"
                fullWidth
                onClick={toList}
                disabled={pending}
              >
                {st('common.cancel')}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </form>
  );
}

/** Add (`/settings/payment-terms/new`) or edit (`/settings/payment-terms/:id/edit`) a payment term. */
export default function PaymentTermFormPage() {
  const { t: st } = useTranslation('settings');
  const navigate = useNavigate();
  const { id } = useParams();
  const detail = usePaymentTermDetail(id);
  const editing = Boolean(id);

  const renderBody = () => {
    if (!editing) {
      return <PaymentTermFormBody term={null} />;
    }
    if (detail.isLoading) {
      return (
        <Stack gap="lg">
          <Skeleton h={220} radius="lg" />
          <Skeleton h={220} radius="lg" />
        </Stack>
      );
    }
    if (!detail.data) {
      const notFound = readPaymentTermError(detail.error).status === 404;
      return (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title={notFound ? st('paymentTerm.form.notFoundTitle') : st('paymentTerm.loadError')}
        >
          {notFound ? (
            st('paymentTerm.form.notFoundDescription')
          ) : (
            <Button size="xs" variant="default" onClick={() => detail.refetch()}>
              {st('paymentTerm.retry')}
            </Button>
          )}
        </Alert>
      );
    }
    return <PaymentTermFormBody term={detail.data} />;
  };

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={IconClock}
          title={editing ? st('paymentTerm.form.titleEdit') : st('paymentTerm.form.titleCreate')}
          description={st('paymentTerm.form.subtitle')}
          actions={
            <Button
              variant="default"
              size="md"
              radius="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.settings.paymentTerms)}
            >
              {st('paymentTerm.form.back')}
            </Button>
          }
        />
        {renderBody()}
      </Stack>
    </Box>
  );
}
