import type { ReactNode } from 'react';
import { Grid, Input, NumberInput, SegmentedControl, Stack, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { DiscountType } from '@/module/sales/domain/sale';

export type DocTextField = 'terms' | 'message' | 'memo';

interface DocStepExtrasProps {
  ns: 'salesQuotes' | 'salesOrders';
  discountType: DiscountType;
  discountValue: number;
  /** The most a nominal discount can be: the subtotal it applies to. */
  subtotal: number;
  errors: Record<string, ReactNode>;
  text: Record<DocTextField, string>;
  onDiscountType: (value: DiscountType) => void;
  onDiscountValue: (value: number) => void;
  onText: (field: DocTextField, value: string) => void;
}

/** Step three of a quote or an order: the discount and the notes. */
export function DocStepExtras({
  ns,
  discountType,
  discountValue,
  subtotal,
  errors,
  text,
  onDiscountType,
  onDiscountValue,
  onText,
}: Readonly<DocStepExtrasProps>) {
  const { t } = useTranslation(ns);
  const { t: ts } = useTranslation('sales');
  const fields: DocTextField[] = ['terms', 'message', 'memo'];

  return (
    <Stack gap="lg">
      <Grid gutter="md" align="flex-start">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Input.Wrapper label={t('form.extras.discountType')}>
            <SegmentedControl
              fullWidth
              data={[
                { value: 'percentage', label: t('form.extras.percentage') },
                { value: 'nominal', label: t('form.extras.nominal') },
              ]}
              value={discountType}
              onChange={(value) => onDiscountType(value as DiscountType)}
            />
          </Input.Wrapper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label={t('form.extras.discountValue')}
            description={
              discountType === 'percentage'
                ? ts('form.extras.discountPercentHint')
                : ts('form.extras.discountNominalHint')
            }
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            min={0}
            max={discountType === 'percentage' ? 100 : subtotal}
            clampBehavior="strict"
            decimalScale={2}
            thousandSeparator="."
            decimalSeparator=","
            value={discountValue}
            onChange={(value) => onDiscountValue(typeof value === 'number' ? value : 0)}
            error={errors.discountValue}
          />
        </Grid.Col>
      </Grid>
      {fields.map((field) => (
        <Textarea
          key={field}
          label={t(`form.extras.${field}`)}
          placeholder={t(`form.extras.${field}Placeholder`)}
          minRows={2}
          autosize
          value={text[field]}
          onChange={(event) => onText(field, event.currentTarget.value)}
        />
      ))}
    </Stack>
  );
}
