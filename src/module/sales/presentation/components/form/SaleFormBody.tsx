import { useState } from 'react';
import { Stack } from '@mantine/core';
import { IconFileText, IconReceipt2, IconSend, IconUser } from '@tabler/icons-react';
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
import { WizardActionBar } from '../wizard/WizardActionBar';
import { WizardCard } from '../wizard/WizardCard';
import { WizardStepper } from '../wizard/WizardStepper';
import { WizardTotals } from '../wizard/WizardTotals';
import { SaleReviewNote, type SaleReview } from './SaleReviewNote';
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
const STEP_ICONS = {
  general: <IconUser size={20} />,
  lines: <IconReceipt2 size={20} />,
  extras: <IconFileText size={20} />,
};

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
  const review: SaleReview = {
    missing,
    customerName: api.customer?.name ?? '',
    dueDate: form.values.dueDate,
    lineCount: form.values.items.filter((item) => item.productId).length,
  };
  const index = SALE_STEPS.indexOf(step);
  const isLast = index === SALE_STEPS.length - 1;
  const { totals } = api;
  const draftOk = canSaveDraft(form.values);
  const sendOk = canSend(form.values);

  return (
    <Stack gap="lg">
      <WizardStepper
        steps={SALE_STEPS.map((id) => ({
          id,
          label: t(`form.steps.${id}`),
          description: t(`form.steps.${id}Desc`),
          icon: STEP_ICONS[id],
        }))}
        active={index}
        onStepClick={(i) => setStep(SALE_STEPS[i])}
      />
      <WizardCard
        icon={STEP_ICONS[step]}
        title={t(`form.steps.${step}`)}
        description={t(`form.steps.${step}Desc`)}
        summary={
          <WizardTotals
            rows={[
              { label: t('form.summary.subtotal'), value: totals.subtotal },
              {
                label: t('form.summary.discount'),
                value: -totals.discountAmount,
                hidden: !totals.discountAmount,
              },
              {
                label: form.values.isPriceIncludeTax
                  ? t('form.summary.vatIncluded')
                  : t('form.summary.vat'),
                value: totals.taxTotal,
                hidden: !totals.taxTotal,
              },
              {
                label: t('form.summary.withholding'),
                value: -totals.withholdingAmount,
                hidden: !totals.withholdingAmount,
              },
            ]}
            totalLabel={t('form.summary.final')}
            total={totals.finalAmount}
            hint={t('form.summary.estimate')}
            aside={isLast ? <SaleReviewNote review={review} /> : undefined}
          />
        }
        footer={
          <WizardActionBar
            isFirst={index === 0}
            isLast={isLast}
            busy={pending !== null}
            cancelLabel={t('form.actions.cancel')}
            onCancel={() => navigate(saleId ? detailPath(saleId) : routes.sales.main)}
            onBack={goBack}
            onNext={goNext}
            draft={{
              label: saleId ? t('form.actions.saveChanges') : t('form.actions.saveDraft'),
              onClick: () => submit('draft'),
              loading: pending === 'draft',
              disabled: !draftOk,
              hint: t('form.actions.saveDraftHint'),
            }}
            finish={{
              label: api.canEmail ? t('form.actions.saveSend') : t('form.actions.saveIssue'),
              icon: <IconSend size={16} />,
              onClick: () => submit('send'),
              loading: pending === 'send',
              disabled: !sendOk,
              hint: t('form.actions.saveSendHint'),
            }}
          />
        }
      >
        {step === 'general' && <StepGeneral api={api} />}
        {step === 'lines' && <StepLines api={api} />}
        {step === 'extras' && <StepExtras api={api} />}
      </WizardCard>
    </Stack>
  );
}
