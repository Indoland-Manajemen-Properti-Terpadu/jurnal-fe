import { useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconFileText, IconReceipt2, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { Sale } from '@/module/sales/domain/sale';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import {
  RETURN_STEPS,
  estimateReturn,
  returnStepErrors,
  validateReturnForm,
  type ReturnFormValues,
  type ReturnStepId,
} from '@/module/sales/domain/saleReturnForm';
import { useCreateReturn, useIssueReturn, useUpdateReturn } from '../../hooks/useReturnMutations';
import { DocNoteBanner } from '../docs/DocNoteBanner';
import { WizardActionBar } from '../wizard/WizardActionBar';
import { WizardCard } from '../wizard/WizardCard';
import { WizardStepper } from '../wizard/WizardStepper';
import { WizardTotals } from '../wizard/WizardTotals';
import { ReturnStepInfo } from './ReturnStepInfo';
import { ReturnStepLines } from './ReturnStepLines';
import { ReturnStepSettlement } from './ReturnStepSettlement';

interface ReturnFormBodyProps {
  sale: Sale;
  initial: ReturnFormValues;
  /** Present when editing a draft. */
  returnId?: string;
}

const detailPath = (id: string) => routes.sales.returnDetail.replace(':id', id);
const STEP_ICONS = {
  info: <IconUser size={20} />,
  lines: <IconReceipt2 size={20} />,
  settlement: <IconFileText size={20} />,
};

export function ReturnFormBody({ sale, initial, returnId }: Readonly<ReturnFormBodyProps>) {
  const { t } = useTranslation('salesReturns');
  const navigate = useNavigate();
  const form = useForm<ReturnFormValues>({ initialValues: initial });
  const createMutation = useCreateReturn();
  const updateMutation = useUpdateReturn(returnId ?? '');
  const issueMutation = useIssueReturn();
  const busy = createMutation.isPending || updateMutation.isPending || issueMutation.isPending;
  const [step, setStep] = useState<ReturnStepId>('info');
  const [checked, setChecked] = useState<Set<ReturnStepId>>(new Set());

  const errors = useMemo(
    () => validateReturnForm(form.values, sale.transactionDate),
    [form.values, sale.transactionDate]
  );
  const ready = Object.keys(errors).length === 0;
  const estimate = useMemo(() => estimateReturn(form.values.lines), [form.values.lines]);
  const index = RETURN_STEPS.indexOf(step);

  const goNext = () => {
    setChecked((prev) => new Set(prev).add(step));
    if (Object.keys(returnStepErrors(step, errors)).length === 0) {
      setStep(RETURN_STEPS[index + 1] ?? step);
    }
  };

  /** Saves the draft, and issues it straight away when asked; a failed issue leaves the draft. */
  const save = async (issue: boolean) => {
    if (busy || !ready) return;
    let savedId: string | null = null;
    try {
      const saved = returnId
        ? await updateMutation.mutateAsync(form.values)
        : await createMutation.mutateAsync(form.values);
      savedId = saved.id;
      if (issue) await issueMutation.mutateAsync(saved.id);
    } catch {
      // The mutation hooks already told the user what went wrong; the form keeps its values.
    }
    if (savedId) navigate(detailPath(savedId));
  };

  const dateError =
    checked.has('info') && errors.transactionDate ? t(errors.transactionDate) : null;
  const hint = t('form.actions.saveHint');

  return (
    <Stack gap="lg">
      <DocNoteBanner
        tone="blue"
        radius="lg"
        text={t('form.banner', {
          invoice: sale.transactionNumber,
          total: formatIDR(sale.finalAmount),
          balance: formatIDR(sale.remainingAmount),
        })}
      />
      <WizardStepper
        steps={RETURN_STEPS.map((id) => ({
          id,
          label: t(`form.steps.${id}`),
          description: t(`form.steps.${id}Desc`),
          icon: STEP_ICONS[id],
        }))}
        active={index}
        onStepClick={(i) => setStep(RETURN_STEPS[i])}
      />
      <WizardCard
        icon={STEP_ICONS[step]}
        title={t(`form.steps.${step}`)}
        description={t(`form.steps.${step}Desc`)}
        summary={
          <WizardTotals
            rows={[
              { label: t('form.totals.subtotal'), value: estimate.subtotal },
              {
                label: t('form.totals.discount'),
                value: -estimate.discount,
                hidden: !estimate.discount,
              },
              { label: t('form.totals.tax'), value: estimate.tax, hidden: !estimate.tax },
              {
                label: t('form.totals.withholding'),
                value: -estimate.withholding,
                hidden: !estimate.withholding,
              },
            ]}
            totalLabel={t('form.totals.total')}
            total={estimate.total}
            hint={t('form.totals.estimateHint')}
          />
        }
        footer={
          <WizardActionBar
            isFirst={index === 0}
            isLast={index === RETURN_STEPS.length - 1}
            busy={busy}
            cancelLabel={t('form.actions.cancel')}
            onCancel={() => navigate(returnId ? detailPath(returnId) : routes.sales.returns)}
            onBack={() => setStep(RETURN_STEPS[index - 1])}
            onNext={goNext}
            draft={{
              label: returnId ? t('form.actions.saveChanges') : t('form.actions.saveDraft'),
              onClick: () => save(false),
              loading: createMutation.isPending || updateMutation.isPending,
              disabled: !ready,
              hint,
            }}
            finish={{
              label: t('form.actions.issue'),
              icon: <IconCheck size={16} />,
              onClick: () => save(true),
              loading: issueMutation.isPending,
              disabled: !ready,
              hint,
            }}
          />
        }
      >
        {step === 'info' && <ReturnStepInfo form={form} sale={sale} dateError={dateError} />}
        {step === 'lines' && (
          <ReturnStepLines form={form} errors={errors} showErrors={checked.has('lines')} />
        )}
        {step === 'settlement' && (
          <ReturnStepSettlement form={form} sale={sale} estimate={estimate} />
        )}
      </WizardCard>
    </Stack>
  );
}
