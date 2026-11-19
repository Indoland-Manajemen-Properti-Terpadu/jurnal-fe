import { Grid, Input, NumberInput, Paper, SegmentedControl, Stack, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { QuoteFormApi } from '../../hooks/useQuoteForm';
import { StepHeading } from '../form/StepHeading';

export function QuoteStepExtras({ api }: Readonly<{ api: QuoteFormApi }>) {
  const { t } = useTranslation('salesQuotes');
  const { t: ts } = useTranslation('sales');
  const { form } = api;
  const { discountType } = form.values;

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="lg">
        <StepHeading
          title={t('form.steps.extras')}
          description={t('form.steps.extrasDesc')}
          step={3}
        />
        <Grid gutter="md" align="flex-end">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Input.Wrapper label={t('form.extras.discountType')}>
              <SegmentedControl
                fullWidth
                data={[
                  { value: 'percentage', label: t('form.extras.percentage') },
                  { value: 'nominal', label: t('form.extras.nominal') },
                ]}
                value={discountType}
                onChange={(value) =>
                  form.setFieldValue('discountType', value as typeof discountType)
                }
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
              max={discountType === 'percentage' ? 100 : api.totals.subtotal}
              clampBehavior="strict"
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
              {...form.getInputProps('discountValue')}
            />
          </Grid.Col>
        </Grid>
        <Textarea
          label={t('form.extras.terms')}
          placeholder={t('form.extras.termsPlaceholder')}
          minRows={2}
          autosize
          {...form.getInputProps('terms')}
        />
        <Textarea
          label={t('form.extras.message')}
          placeholder={t('form.extras.messagePlaceholder')}
          minRows={2}
          autosize
          {...form.getInputProps('message')}
        />
        <Textarea
          label={t('form.extras.memo')}
          placeholder={t('form.extras.memoPlaceholder')}
          minRows={2}
          autosize
          {...form.getInputProps('memo')}
        />
      </Stack>
    </Paper>
  );
}
