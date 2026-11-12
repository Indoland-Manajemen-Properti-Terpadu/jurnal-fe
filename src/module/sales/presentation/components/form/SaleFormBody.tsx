import { useState } from 'react';
import { Grid, Group, Paper, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { CreateSaleFormValues } from '@/module/sales/domain/sale';
import {
  SALE_STEPS,
  canSaveDraft,
  canSend,
  validateStep,
  type SaleStepId,
} from '@/module/sales/domain/saleForm';
import { useCreateSale, useSendSale, useUpdateSale } from '../../hooks/useSaleMutations';
import { useSaleForm } from '../../hooks/useSaleForm';
import { FormActionBar } from './FormActionBar';
import { SaleStepper } from './SaleStepper';
import { SaleTotalsPanel, type SaleReview } from './SaleTotalsPanel';
import { StepExtras } from './StepExtras';
import { StepGeneral } from './StepGeneral';
import { StepLines } from './StepLines';

interface SaleFormBodyProps {
  /** Present when editing a draft. */
  saleId?: string;
  initial?: CreateSaleFormValues;
}

const detailPath = (id: string) => routes.sales.detail.replace(':id', id);
const editPath = (id: string) => routes.sales.edit.replace(':id', id);

export function SaleFormBody({ saleId, initial }: Readonly<SaleFormBodyProps>) {
  const { t } = useTranslation('sales');
  const navigate = useNavigate();
  const api = useSaleForm(initial);
  const { form } = api;
  const [step, setStep] = useState<SaleStepId>('general');
  const [pending, setPending] = useState<'draft' | 'send' | null>(null);

  const createMutation = useCreateSale();
  const updateMutation = useUpdateSale(saleId ?? '');
  const sendMutation = useSendSale();

  const goNext = () => {
    if (!api.checkStep(step)) return;
    setStep(SALE_STEPS[SALE_STEPS.indexOf(step) + 1] ?? step);
  };
  const goBack = () => setStep(SALE_STEPS[Math.max(SALE_STEPS.indexOf(step) - 1, 0)]);

  const submit = async (mode: 'draft' | 'send') => {
    if (pending) return;
    if (mode === 'send') {
      const failing = SALE_STEPS.find((id) => !api.checkStep(id));
      if (failing) {
        setStep(failing);
        return;
      }
    }
    setPending(mode);
    // The id of the invoice once it exists, so a refused "send" can land on the saved draft.
    let savedId = saleId;
    try {
      if (saleId) {
        await updateMutation.mutateAsync(form.values);
      } else {
        // Always created as a draft: issuing goes through "send", which checks the accounts that
        // post the receivable. A refusal then leaves a draft instead of an unposted invoice.
        const created = await createMutation.mutateAsync({
          values: form.values,
          silent: mode === 'send',
        });
        savedId = created.sale.id;
      }
      if (mode === 'send' && savedId) {
        await sendMutation.mutateAsync({ id: savedId, sendEmail: api.canEmail });
      }
      if (savedId) navigate(detailPath(savedId));
    } catch {
      // The mutation hooks already told the user what went wrong. A draft that was saved but
      // could not be issued is opened for editing; otherwise the form keeps its values.
      if (!saleId && savedId) navigate(editPath(savedId));
    } finally {
      setPending(null);
    }
  };

  const missing = SALE_STEPS.filter(
    (id) => Object.keys(validateStep(id, form.values)).length > 0
  ).map((id) => t(`form.steps.${id}`));
  const customerName = api.customer?.name ?? '';
  const review: SaleReview = {
    missing,
    customerName,
    dueDate: form.values.dueDate,
    lineCount: form.values.items.filter((item) => item.productId).length,
  };

  return (
    <Stack gap="lg">
      <Paper withBorder radius="md" p="md" bg="white">
        <SaleStepper step={step} onStepClick={setStep} />
      </Paper>

      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: step === 'extras' ? 8 : 12 }}>
          <Stack gap="lg">
            {step === 'general' && <StepGeneral api={api} />}
            {step === 'lines' && <StepLines api={api} />}
            {step === 'lines' && (
              <Group justify="flex-end">
                <div style={{ width: '100%', maxWidth: 420 }}>
                  <SaleTotalsPanel
                    totals={api.totals}
                    isPriceIncludeTax={form.values.isPriceIncludeTax}
                  />
                </div>
              </Group>
            )}
            {step === 'extras' && <StepExtras api={api} />}
          </Stack>
        </Grid.Col>
        {step === 'extras' && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <div style={{ position: 'sticky', top: 20 }}>
              <SaleTotalsPanel
                totals={api.totals}
                isPriceIncludeTax={form.values.isPriceIncludeTax}
                review={review}
              />
            </div>
          </Grid.Col>
        )}
      </Grid>

      {/* One footer for every step: always the full width of the form, below all its content. */}
      <FormActionBar
        step={step}
        isEdit={Boolean(saleId)}
        canSaveDraft={canSaveDraft(form.values)}
        canSend={canSend(form.values)}
        canEmail={api.canEmail}
        pending={pending}
        onBack={goBack}
        onNext={goNext}
        onCancel={() => navigate(saleId ? detailPath(saleId) : routes.sales.main)}
        onSaveDraft={() => submit('draft')}
        onSaveSend={() => submit('send')}
      />
    </Stack>
  );
}
