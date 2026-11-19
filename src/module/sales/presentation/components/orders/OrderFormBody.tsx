import { useState } from 'react';
import { Stack } from '@mantine/core';
import { IconFileText, IconReceipt2, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  ORDER_STEPS,
  canSaveOrder,
  type OrderFormValues,
  type OrderStepId,
} from '@/module/sales/domain/saleOrderForm';
import { useOrderForm } from '../../hooks/useOrderForm';
import { useCreateOrder, useUpdateOrder } from '../../hooks/useOrderMutations';
import { DocStepExtras } from '../docs/DocStepExtras';
import { DocStepLines } from '../docs/DocStepLines';
import { WizardActionBar } from '../wizard/WizardActionBar';
import { WizardCard } from '../wizard/WizardCard';
import { WizardStepper } from '../wizard/WizardStepper';
import { WizardTotals } from '../wizard/WizardTotals';
import { OrderStepGeneral } from './OrderStepGeneral';

interface OrderFormBodyProps {
  /** Present when editing a draft. */
  orderId?: string;
  initial?: OrderFormValues;
}

const detailPath = (id: string) => routes.sales.orderDetail.replace(':id', id);
const STEP_ICONS = {
  general: <IconUser size={20} />,
  lines: <IconReceipt2 size={20} />,
  extras: <IconFileText size={20} />,
};

export function OrderFormBody({ orderId, initial }: Readonly<OrderFormBodyProps>) {
  const { t } = useTranslation('salesOrders');
  const { t: ts } = useTranslation('sales');
  const navigate = useNavigate();
  const api = useOrderForm(initial);
  const { form } = api;
  const [step, setStep] = useState<OrderStepId>('general');
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder(orderId ?? '');
  const busy = createMutation.isPending || updateMutation.isPending;

  const index = ORDER_STEPS.indexOf(step);
  const isLast = index === ORDER_STEPS.length - 1;

  const goNext = () => {
    if (api.checkStep(step)) setStep(ORDER_STEPS[index + 1] ?? step);
  };

  const save = async () => {
    if (busy) return;
    const failing = ORDER_STEPS.find((id) => !api.checkStep(id));
    if (failing) {
      setStep(failing);
      return;
    }
    try {
      const saved = orderId
        ? await updateMutation.mutateAsync(form.values)
        : await createMutation.mutateAsync(form.values);
      navigate(detailPath(saved.id));
    } catch {
      // The mutation hooks already told the user what went wrong; the form keeps its values.
    }
  };

  const ready = canSaveOrder(form.values);
  const { totals } = api;
  const saveLabel = orderId
    ? t('form.actions.saveChanges')
    : isLast
      ? t('form.actions.save')
      : t('form.actions.saveDraft');

  return (
    <Stack gap="lg">
      <WizardStepper
        steps={ORDER_STEPS.map((id) => ({
          id,
          label: t(`form.steps.${id}`),
          description: t(`form.steps.${id}Desc`),
          icon: STEP_ICONS[id],
        }))}
        active={index}
        onStepClick={(i) => setStep(ORDER_STEPS[i])}
      />
      <WizardCard
        icon={STEP_ICONS[step]}
        title={t(`form.steps.${step}`)}
        description={t(`form.steps.${step}Desc`)}
        summary={
          <WizardTotals
            rows={[
              { label: ts('form.summary.subtotal'), value: totals.subtotal },
              {
                label: ts('form.summary.discount'),
                value: -totals.discountAmount,
                hidden: !totals.discountAmount,
              },
              {
                label: form.values.isPriceIncludeTax
                  ? ts('form.summary.vatIncluded')
                  : ts('form.summary.vat'),
                value: totals.taxTotal,
                hidden: !totals.taxTotal,
              },
            ]}
            totalLabel={t('form.summary.total')}
            total={totals.finalAmount}
            hint={t('form.summary.estimate')}
          />
        }
        footer={
          <WizardActionBar
            isFirst={index === 0}
            isLast={isLast}
            busy={busy}
            cancelLabel={t('form.actions.cancel')}
            onCancel={() => navigate(orderId ? detailPath(orderId) : routes.sales.orders)}
            onBack={() => setStep(ORDER_STEPS[index - 1])}
            onNext={goNext}
            draft={{
              label: saveLabel,
              onClick: save,
              loading: busy,
              disabled: !ready,
              hint: t('form.actions.saveHint'),
            }}
          />
        }
      >
        {step === 'general' && <OrderStepGeneral api={api} canPickQuote={!orderId} />}
        {step === 'lines' && (
          <DocStepLines
            items={form.values.items}
            errors={form.errors}
            isPriceIncludeTax={form.values.isPriceIncludeTax}
            onTaxInclusiveChange={(value) => form.setFieldValue('isPriceIncludeTax', value)}
            productOptions={api.productOptions}
            taxOptions={api.taxOptions}
            onProductChange={api.changeProduct}
            onLineChange={api.changeLine}
            onAddLine={api.addLine}
            onRemoveLine={api.removeLine}
          />
        )}
        {isLast && (
          <DocStepExtras
            ns="salesOrders"
            discountType={form.values.discountType}
            discountValue={form.values.discountValue}
            subtotal={totals.subtotal}
            errors={form.errors}
            text={{
              terms: form.values.terms,
              message: form.values.message,
              memo: form.values.memo,
            }}
            onDiscountType={(value) => form.setFieldValue('discountType', value)}
            onDiscountValue={(value) => form.setFieldValue('discountValue', value)}
            onText={(field, value) => form.setFieldValue(field, value)}
          />
        )}
      </WizardCard>
    </Stack>
  );
}
