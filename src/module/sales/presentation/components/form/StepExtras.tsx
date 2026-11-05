import {
  FileInput,
  Grid,
  Input,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { IconPaperclip } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { validateAttachments } from '@/module/sales/domain/saleFiles';
import type { SaleFormApi } from '../../hooks/useSaleForm';
import { StepHeading } from './StepHeading';

export function StepExtras({ api }: Readonly<{ api: SaleFormApi }>) {
  const { t } = useTranslation('sales');
  const { form } = api;
  const { discountType, withholdingType } = form.values;
  const typeOptions = (prefix: 'discount' | 'withholding') => [
    { value: 'percentage', label: t(`form.extras.${prefix}Percentage`) },
    { value: 'nominal', label: t(`form.extras.${prefix}Nominal`) },
  ];
  const fileError = validateAttachments(form.values.attachments ?? []);

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="lg">
        <StepHeading
          title={t('form.steps.extras')}
          description={t('form.steps.extrasDesc')}
          step={3}
        />

        <Stack gap="xs">
          <Text fw={600} size="sm">
            {t('form.extras.discountSection')}
          </Text>
          <Grid gutter="md" align="flex-end">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Input.Wrapper label={t('form.extras.discountType')}>
                <SegmentedControl
                  fullWidth
                  data={typeOptions('discount')}
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
                min={0}
                decimalScale={2}
                thousandSeparator="."
                decimalSeparator=","
                {...form.getInputProps('discountValue')}
              />
            </Grid.Col>
          </Grid>
        </Stack>

        <Stack gap="xs">
          <Text fw={600} size="sm">
            {t('form.extras.withholdingSection')}
          </Text>
          <Grid gutter="md" align="flex-end">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Input.Wrapper label={t('form.extras.withholdingType')}>
                <SegmentedControl
                  fullWidth
                  data={typeOptions('withholding')}
                  value={withholdingType}
                  onChange={(value) =>
                    form.setFieldValue('withholdingType', value as typeof withholdingType)
                  }
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label={t('form.extras.withholdingValue')}
                min={0}
                decimalScale={2}
                thousandSeparator="."
                decimalSeparator=","
                {...form.getInputProps('withholdingValue')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label={t('form.extras.withholdingAccount')}
                placeholder={t('form.extras.withholdingAccountPlaceholder')}
                data={api.accountOptions}
                searchable
                clearable
                {...form.getInputProps('withholdingAccount')}
              />
            </Grid.Col>
          </Grid>
        </Stack>

        <Stack gap="sm">
          <Text fw={600} size="sm">
            {t('form.extras.notesSection')}
          </Text>
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
          <FileInput
            multiple
            clearable
            label={t('form.extras.attachments')}
            placeholder={t('form.extras.attachmentsPlaceholder')}
            description={t('form.extras.attachmentsHint')}
            leftSection={<IconPaperclip size={16} />}
            value={form.values.attachments ?? []}
            onChange={(files) => form.setFieldValue('attachments', files)}
            error={fileError ? t(fileError) : undefined}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
