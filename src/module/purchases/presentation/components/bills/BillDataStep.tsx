import type { ComponentProps, ReactNode } from 'react';
import { IconFileInvoice } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { BillHeaderFields } from './BillHeaderFields';
import { BillFileFields } from './BillFileFields';
import { WizardCard } from '../shared/wizard/WizardCard';

type Props = {
  header: ComponentProps<typeof BillHeaderFields>;
  attachments: ComponentProps<typeof BillFileFields>;
  vendorName?: string;
  documents?: string;
  footer: ReactNode;
};

export const BillDataStep = ({ vendorName, documents, footer, header, attachments }: Props) => {
  const { t } = useTranslation('purchases');
  return (
    <WizardCard
      icon={<IconFileInvoice size={20} />}
      title={t('bills.wizard.data')}
      description={t('bills.wizard.dataHint')}
      hintTitle={vendorName}
      hint={documents}
      footer={footer}
    >
      <BillHeaderFields {...header} />
      <BillFileFields {...attachments} />
    </WizardCard>
  );
};
