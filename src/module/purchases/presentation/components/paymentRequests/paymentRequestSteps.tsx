import { IconCalendar, IconClipboardText, IconListDetails } from '@tabler/icons-react';
import type { WizardStep } from '@/module/purchases/presentation/components/shared/wizard/WizardStepper';

export const paymentRequestSteps = (t: (key: string) => string): WizardStep[] => [
  {
    id: 'source',
    label: t('paymentRequests.wizard.source'),
    description: t('paymentRequests.wizard.sourceHint'),
    icon: <IconClipboardText size={20} />,
  },
  {
    id: 'amount',
    label: t('paymentRequests.wizard.amount'),
    description: t('paymentRequests.wizard.amountHint'),
    icon: <IconListDetails size={20} />,
  },
  {
    id: 'data',
    label: t('paymentRequests.wizard.data'),
    description: t('paymentRequests.wizard.dataHint'),
    icon: <IconCalendar size={20} />,
  },
];
