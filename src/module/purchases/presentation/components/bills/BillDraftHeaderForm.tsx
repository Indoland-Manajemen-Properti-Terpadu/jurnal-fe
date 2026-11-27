import { Button, Group } from '@mantine/core';
import { IconDeviceFloppy, IconFileInvoice } from '@tabler/icons-react';
import type { BillFormErrors, BillFormValues } from '@/module/purchases/domain/billForm';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { useTranslation } from '@/i18n';
import { BillHeaderFields } from '@/module/purchases/presentation/components/bills/BillHeaderFields';
import {
  BillFileFields,
  type BillFiles,
} from '@/module/purchases/presentation/components/bills/BillFileFields';
import { FormFrame } from '@/module/purchases/presentation/components/shared/FormFrame';
import { WizardCard } from '@/module/purchases/presentation/components/shared/wizard/WizardCard';
import { routes } from '@/router/routes';

interface BillDraftHeaderFormProps {
  existing: PurchaseBill;
  values: BillFormValues;
  errors: BillFormErrors;
  showErrors: boolean;
  pending: boolean;
  dueHint?: string;
  files: BillFiles;
  onFilesChange: (files: BillFiles) => void;
  onChange: <K extends keyof BillFormValues>(key: K, value: BillFormValues[K]) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const BillDraftHeaderForm = ({
  existing,
  values,
  errors,
  showErrors,
  pending,
  dueHint,
  files,
  onFilesChange,
  onChange,
  onCancel,
  onSave,
}: Readonly<BillDraftHeaderFormProps>) => {
  const { t } = useTranslation('purchases');
  const detail = routes.purchases.billDetail.replace(':id', existing.id);

  return (
    <FormFrame
      icon={IconFileInvoice}
      title={t('bills.form.titleEdit', { number: existing.number })}
      description={t('bills.form.subtitleEdit')}
      backTo={detail}
      backLabel={t('bills.detail.backToList')}
    >
      <WizardCard
        icon={<IconFileInvoice size={20} />}
        title={t('bills.wizard.data')}
        description={t('bills.wizard.dataHint')}
        footer={
          <Group justify="space-between">
            <Button variant="default" disabled={pending} onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button leftSection={<IconDeviceFloppy size={16} />} loading={pending} onClick={onSave}>
              {t('common.save')}
            </Button>
          </Group>
        }
      >
        <BillHeaderFields
          source={existing.source}
          values={values}
          errors={errors}
          showErrors={showErrors}
          dueHint={dueHint}
          onChange={onChange}
        />
        <BillFileFields
          files={files}
          onChange={onFilesChange}
          taxRequired={existing.taxAmount > 0}
        />
      </WizardCard>
    </FormFrame>
  );
};
