import { Stepper } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { SALE_STEPS, type SaleStepId } from '@/module/sales/domain/saleForm';

interface SaleStepperProps {
  step: SaleStepId;
  /** Earlier steps can be revisited; later ones only through "Lanjut" so each is validated. */
  onStepClick: (step: SaleStepId) => void;
}

export function SaleStepper({ step, onStepClick }: Readonly<SaleStepperProps>) {
  const { t } = useTranslation('sales');
  const active = SALE_STEPS.indexOf(step);

  return (
    <Stepper
      active={active}
      onStepClick={(index) => onStepClick(SALE_STEPS[index])}
      allowNextStepsSelect={false}
      size="sm"
      color="primary"
      aria-label={t('form.stepperAria')}
    >
      {SALE_STEPS.map((id) => (
        <Stepper.Step
          key={id}
          label={t(`form.steps.${id}`)}
          description={t(`form.steps.${id}Desc`)}
        />
      ))}
    </Stepper>
  );
}
