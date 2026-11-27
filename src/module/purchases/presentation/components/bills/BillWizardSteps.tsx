import { IconFileInvoice, IconListDetails, IconTruckDelivery } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  WizardStepper,
  type WizardStep,
} from '@/module/purchases/presentation/components/shared/wizard/WizardStepper';

interface BillWizardStepsProps {
  active: number;
  onStepClick: (step: number) => void;
}

export const BillWizardSteps = ({ active, onStepClick }: Readonly<BillWizardStepsProps>) => {
  const { t } = useTranslation('purchases');
  const steps: WizardStep[] = [
    {
      id: 'source',
      label: t('bills.wizard.source'),
      description: t('bills.wizard.sourceHint'),
      icon: <IconTruckDelivery size={20} />,
    },
    {
      id: 'data',
      label: t('bills.wizard.data'),
      description: t('bills.wizard.dataHint'),
      icon: <IconFileInvoice size={20} />,
    },
    {
      id: 'items',
      label: t('bills.wizard.items'),
      description: t('bills.wizard.itemsHint'),
      icon: <IconListDetails size={20} />,
    },
  ];

  return <WizardStepper steps={steps} active={active} onStepClick={onStepClick} />;
};
