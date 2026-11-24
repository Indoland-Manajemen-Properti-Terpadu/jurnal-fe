import { Grid, Select, TextInput, Textarea } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { NamedRef } from '@/module/purchases/domain/purchaseCommon';
import {
  needsDeliveryWarehouse,
  REQUEST_LIMITS,
  type RequestFormErrors,
  type RequestFormValues,
} from '@/module/purchases/domain/requestForm';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

interface RequestInfoSectionProps {
  values: RequestFormValues;
  errors: RequestFormErrors;
  showErrors: boolean;
  departments: NamedRef[];
  departmentsLoading: boolean;
  warehouses: (NamedRef & { code?: string })[];
  warehousesLoading: boolean;
  onChange: <K extends keyof RequestFormValues>(key: K, value: RequestFormValues[K]) => void;
}

/** When, for which department and why: the facts Accounting reads first. */
export const RequestInfoSection = ({
  values,
  errors,
  showErrors,
  departments,
  departmentsLoading,
  warehouses,
  warehousesLoading,
  onChange,
}: Readonly<RequestInfoSectionProps>) => {
  const { t } = useTranslation('purchases');
  const error = (key: string | undefined, scope: string) =>
    showErrors && key ? t(`requests.form.${scope}.${key}`) : undefined;

  return (
    <SectionCard
      icon={IconClipboardText}
      title={t('requests.form.infoTitle')}
      subtitle={t('requests.form.infoSubtitle')}
    >
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateField
            withAsterisk
            label={t('requests.form.date')}
            value={values.transactionDate}
            onChange={(value) => onChange('transactionDate', value)}
            error={error(errors.transactionDate, 'dateError')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DateField
            withAsterisk
            label={t('requests.form.requiredDate')}
            value={values.requiredDate}
            minDate={values.transactionDate || undefined}
            onChange={(value) => onChange('requiredDate', value)}
            error={error(errors.requiredDate, 'requiredDateError')}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Select
            withAsterisk
            searchable
            radius="md"
            label={t('common.department')}
            placeholder={t('requests.form.departmentPlaceholder')}
            nothingFoundMessage={
              departmentsLoading ? t('shared.searching') : t('requests.form.noDepartment')
            }
            data={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
            value={values.departmentId || null}
            onChange={(value) => onChange('departmentId', value ?? '')}
            error={error(errors.department, 'departmentError')}
          />
        </Grid.Col>
        {needsDeliveryWarehouse(values.items) && (
          <Grid.Col span={12}>
            <Select
              withAsterisk
              searchable
              radius="md"
              label={t('requests.form.deliveryWarehouse')}
              description={t('requests.form.deliveryWarehouseHint')}
              placeholder={t('requests.form.deliveryWarehousePlaceholder')}
              nothingFoundMessage={
                warehousesLoading ? t('shared.searching') : t('requests.form.noWarehouse')
              }
              data={warehouses.map((warehouse) => ({
                value: warehouse.id,
                label: warehouse.code ? `${warehouse.code} · ${warehouse.name}` : warehouse.name,
              }))}
              value={values.deliveryWarehouseId || null}
              onChange={(value) => onChange('deliveryWarehouseId', value ?? '')}
              error={error(errors.deliveryWarehouse, 'deliveryWarehouseError')}
            />
          </Grid.Col>
        )}
        <Grid.Col span={12}>
          <TextInput
            withAsterisk
            radius="md"
            label={t('common.purpose')}
            placeholder={t('requests.form.purposePlaceholder')}
            value={values.purpose}
            onChange={(event) => onChange('purpose', event.currentTarget.value)}
            error={
              showErrors && errors.purpose
                ? t(`requests.form.purposeError.${errors.purpose}`, {
                    max: REQUEST_LIMITS.purpose,
                  })
                : undefined
            }
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea
            radius="md"
            label={t('common.memo')}
            placeholder={t('requests.form.memoPlaceholder')}
            value={values.memo}
            minRows={3}
            autosize
            onChange={(event) => onChange('memo', event.currentTarget.value)}
            error={
              showErrors && errors.memo
                ? t('requests.form.memoError.tooLong', { max: REQUEST_LIMITS.memo })
                : undefined
            }
          />
        </Grid.Col>
      </Grid>
    </SectionCard>
  );
};
