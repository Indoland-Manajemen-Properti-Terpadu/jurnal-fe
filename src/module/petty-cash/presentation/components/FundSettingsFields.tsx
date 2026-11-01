import { NumberInput, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { FundSettingsDraft, NumberField } from '@/module/petty-cash/domain/fundAdmin';

interface Props {
  value: FundSettingsDraft;
  onChange: (next: FundSettingsDraft) => void;
  errorOf: (path: string) => string | undefined;
}

type MoneyField =
  | 'voucherApprovalThreshold'
  | 'attachmentRequiredThreshold'
  | 'advanceMaxAmount'
  | 'advanceApprovalThreshold';
type SwitchField =
  | 'requireCountBeforeReimbursement'
  | 'requireWitness'
  | 'singleUserOverride'
  | 'advanceExcludeSaturday'
  | 'advanceExcludeSunday';

const asField = (value: string | number): NumberField => (value === '' ? '' : Number(value));

/** The rules of a fund: thresholds, advance limits and controls. Shared by create and edit. */
export function FundSettingsFields({ value, onChange, errorOf }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const set = (patch: Partial<FundSettingsDraft>) => onChange({ ...value, ...patch });

  const money = (field: MoneyField) => (
    <NumberInput
      key={field}
      label={t(`fundAdmin.${field}`)}
      value={value[field]}
      onChange={(next) => set({ [field]: asField(next) })}
      error={errorOf(field)}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      decimalScale={0}
      leftSection={<Text size="sm">Rp</Text>}
    />
  );
  const toggle = (field: SwitchField, hint?: string) => (
    <Switch
      key={field}
      label={t(`fundAdmin.${field}`)}
      description={hint}
      checked={value[field]}
      onChange={(event) => set({ [field]: event.currentTarget.checked })}
    />
  );

  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Text fw={650} size="sm">
          {t('fundAdmin.sectionVouchers')}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {money('voucherApprovalThreshold')}
          {money('attachmentRequiredThreshold')}
          <NumberInput
            label={t('fundAdmin.warningThresholdPct')}
            value={value.warningThresholdPct}
            onChange={(next) => set({ warningThresholdPct: asField(next) })}
            error={errorOf('warningThresholdPct')}
            min={0}
            max={100}
            allowNegative={false}
            decimalScale={0}
          />
        </SimpleGrid>
        <Text size="xs" c="dimmed">
          {t('fundAdmin.warningThresholdPctHint')}
        </Text>
      </Stack>
      <Stack gap="sm">
        <Text fw={650} size="sm">
          {t('fundAdmin.sectionAdvances')}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {money('advanceMaxAmount')}
          {money('advanceApprovalThreshold')}
          <NumberInput
            label={t('fundAdmin.advanceSettlementDays')}
            value={value.advanceSettlementDays}
            onChange={(next) => set({ advanceSettlementDays: asField(next) })}
            error={errorOf('advanceSettlementDays')}
            allowNegative={false}
            decimalScale={0}
          />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {toggle('advanceExcludeSaturday')}
          {toggle('advanceExcludeSunday')}
        </SimpleGrid>
      </Stack>
      <Stack gap="sm">
        <Text fw={650} size="sm">
          {t('fundAdmin.sectionControls')}
        </Text>
        {toggle('requireCountBeforeReimbursement')}
        {toggle('requireWitness')}
        {toggle('singleUserOverride', t('fundAdmin.singleUserOverrideHint'))}
      </Stack>
    </Stack>
  );
}
