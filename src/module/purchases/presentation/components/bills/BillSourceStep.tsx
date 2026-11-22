import type { ReactNode } from 'react';
import { Alert, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconPackage, IconReceipt2, IconTruckDelivery } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { BillFormErrors, BillFormValues } from '@/module/purchases/domain/billForm';
import { togglePicked, type BillSourceDoc } from '@/module/purchases/domain/billSources';
import type { BillSource } from '@/module/purchases/domain/purchaseDocuments';
import { BillSourcePicker } from '@/module/purchases/presentation/components/bills/BillSourcePicker';
import { SupplierSelect } from '@/module/purchases/presentation/components/shared/LookupSelects';
import { ChoiceCard } from '@/module/purchases/presentation/components/shared/wizard/ChoiceCard';
import { WizardCard } from '@/module/purchases/presentation/components/shared/wizard/WizardCard';

const SOURCES: BillSource[] = ['RECEIPT', 'ORDER', 'MANUAL'];
const SOURCE_ICON = {
  RECEIPT: <IconTruckDelivery size={18} />,
  ORDER: <IconPackage size={18} />,
  MANUAL: <IconReceipt2 size={18} />,
};

interface BillSourceStepProps {
  source: BillSource;
  picked: BillSourceDoc[];
  pickVendor: string;
  values: BillFormValues;
  errors: BillFormErrors;
  showErrors: boolean;
  pickError: boolean;
  footer: ReactNode;
  shownVendorName: string | undefined;
  onSource: (source: BillSource) => void;
  onPickVendor: (vendorId: string) => void;
  onPicked: (update: (current: BillSourceDoc[]) => BillSourceDoc[]) => void;
  onField: <K extends keyof BillFormValues>(key: K, value: BillFormValues[K]) => void;
}

/** Step 1: where the bill comes from, then the vendor and the receipts or orders (or the vendor alone). */
export const BillSourceStep = ({
  source,
  picked,
  pickVendor,
  values,
  errors,
  showErrors,
  pickError,
  footer,
  shownVendorName,
  onSource,
  onPickVendor,
  onPicked,
  onField,
}: Readonly<BillSourceStepProps>) => {
  const { t } = useTranslation('purchases');
  const pickable = source === 'MANUAL' ? null : source;

  return (
    <WizardCard
      icon={<IconTruckDelivery size={20} />}
      title={t('bills.wizard.source')}
      description={t('bills.wizard.sourceHint')}
      hintTitle={picked[0]?.vendor.name ?? (pickable ? shownVendorName : undefined)}
      hint={
        source === 'MANUAL'
          ? undefined
          : t(
              picked.length === 0
                ? `bills.wizard.nonePicked.${source}`
                : `bills.wizard.pickedCount.${source}`,
              { count: picked.length }
            )
      }
      footer={footer}
    >
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {SOURCES.map((value) => (
            <ChoiceCard
              key={value}
              icon={SOURCE_ICON[value]}
              title={t(`bills.wizard.choice.${value}.title`)}
              description={t(`bills.wizard.choice.${value}.description`)}
              selected={source === value}
              onSelect={() => onSource(value)}
            />
          ))}
        </SimpleGrid>
        {pickable && (
          <BillSourcePicker
            source={pickable}
            picked={picked}
            vendorId={pickVendor}
            onVendorChange={(id) => {
              onPickVendor(id);
              // A bill is for one vendor, so another vendor starts the picks again.
              onPicked((current) => (current[0]?.vendor.id === id ? current : []));
            }}
            onToggle={(doc) => onPicked((current) => togglePicked(current, doc, pickable))}
          />
        )}
        {showErrors && pickError && (
          <Text size="sm" c="red" role="alert">
            {t('bills.form.error.pickOne')}
          </Text>
        )}
        {source === 'MANUAL' && (
          <>
            <SupplierSelect
              withAsterisk
              label={t('bills.form.vendor')}
              value={values.vendorId || null}
              onChange={(id, party) => {
                onField('vendorId', id ?? '');
                onField('vendorName', party?.name ?? '');
              }}
              error={
                showErrors && errors.fields.vendorId
                  ? t('bills.form.error.vendorRequired')
                  : undefined
              }
            />
            <Alert color="blue" variant="light" radius="md">
              {t('bills.form.manualNote')}
            </Alert>
          </>
        )}
      </Stack>
    </WizardCard>
  );
};
