import {
  Input,
  NumberInput,
  Select,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  IconCalendarDue,
  IconCash,
  IconClockHour4,
  IconFileInvoice,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  visiblePaymentTermFields,
  type PaymentTermAdvanceType,
  type PaymentTermAppliesTo,
  type PaymentTermBillingSplit,
  type PaymentTermDueBasis,
  type PaymentTermPeriodUnit,
} from '@/module/settings/domain/paymentTerm';
import type { PaymentTermForm } from '@/module/settings/presentation/hooks/usePaymentTermForm';
import { PaymentTermSection } from './PaymentTermSection';

type Props = { form: PaymentTermForm };

const APPLIES_TO: PaymentTermAppliesTo[] = ['goods', 'service', 'both'];
const PERIOD_UNITS: Array<[PaymentTermPeriodUnit, string]> = [
  ['monthly', 'periodMonthly'],
  ['quarterly', 'periodQuarterly'],
  ['semiannual', 'periodSemiannual'],
  ['yearly', 'periodYearly'],
];
const DUE_BASES: Array<[PaymentTermDueBasis, string]> = [
  ['vendor_invoice_date', 'basisInvoice'],
  ['receipt_date', 'basisReceipt'],
];

/** Name, "Untuk" and the optional texts. */
export function PaymentTermInfoSection({ form }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  return (
    <PaymentTermSection
      icon={IconFileInvoice}
      title={st('paymentTerm.form.sectionInfo')}
      subtitle={st('paymentTerm.form.sectionInfoSub')}
    >
      <Stack gap="md">
        <TextInput
          required
          label={st('paymentTerm.form.name')}
          placeholder={st('paymentTerm.form.namePlaceholder')}
          {...form.getInputProps('name')}
        />
        <Input.Wrapper label={st('paymentTerm.form.appliesTo')}>
          <SegmentedControl
            fullWidth
            mt={4}
            value={form.values.appliesTo}
            onChange={(value) => form.setFieldValue('appliesTo', value as PaymentTermAppliesTo)}
            data={APPLIES_TO.map((value) => ({
              value,
              label: st(`paymentTerm.appliesTo.${value}`),
            }))}
          />
        </Input.Wrapper>
        <Textarea
          autosize
          minRows={2}
          label={st('paymentTerm.form.description')}
          placeholder={st('paymentTerm.form.descriptionPlaceholder')}
          {...form.getInputProps('description')}
        />
        <TextInput
          label={st('paymentTerm.form.usageExample')}
          placeholder={st('paymentTerm.form.usageExamplePlaceholder')}
          {...form.getInputProps('usageExample')}
        />
      </Stack>
    </PaymentTermSection>
  );
}

export function PaymentTermAdvanceSection({ form }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const visible = visiblePaymentTermFields(form.values);
  return (
    <PaymentTermSection
      icon={IconCash}
      title={st('paymentTerm.form.sectionAdvance')}
      subtitle={st('paymentTerm.form.sectionAdvanceSub')}
    >
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={form.values.advanceType}
          onChange={(value) => form.setFieldValue('advanceType', value as PaymentTermAdvanceType)}
          data={[
            { value: 'none', label: st('paymentTerm.form.advanceNone') },
            { value: 'partial', label: st('paymentTerm.form.advancePartial') },
            { value: 'full', label: st('paymentTerm.form.advanceFull') },
          ]}
        />
        {visible.advancePercent && (
          <NumberInput
            clampBehavior="none"
            required
            hideControls
            min={1}
            max={99}
            suffix="%"
            label={st('paymentTerm.form.advancePercent')}
            {...form.getInputProps('advancePercent')}
          />
        )}
        {form.values.advanceType === 'full' && (
          <Text size="sm" c="dimmed">
            {st('paymentTerm.form.advanceFullHint')}
          </Text>
        )}
      </Stack>
    </PaymentTermSection>
  );
}

export function PaymentTermBillingSection({ form }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const visible = visiblePaymentTermFields(form.values);
  return (
    <PaymentTermSection
      icon={IconClockHour4}
      title={st('paymentTerm.form.sectionBilling')}
      subtitle={st('paymentTerm.form.sectionBillingSub')}
    >
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={form.values.billingSplit}
          onChange={(value) => form.setFieldValue('billingSplit', value as PaymentTermBillingSplit)}
          data={[
            { value: 'single', label: st('paymentTerm.form.billingSingle') },
            { value: 'milestone', label: st('paymentTerm.form.billingMilestone') },
            { value: 'recurring', label: st('paymentTerm.form.billingRecurring') },
          ]}
        />
        {visible.installments && (
          <NumberInput
            clampBehavior="none"
            required
            hideControls
            allowDecimal={false}
            min={2}
            label={st('paymentTerm.form.installments')}
            description={st('paymentTerm.form.installmentsHint')}
            {...form.getInputProps('installments')}
          />
        )}
        {visible.advanceOutsideInstallments && (
          // Always on: the advance is billed on its own and the terms share the rest.
          <Switch
            checked
            disabled
            readOnly
            label={st('paymentTerm.form.advanceOutside')}
            description={st('paymentTerm.form.advanceOutsideHint')}
          />
        )}
        {visible.period && (
          <>
            <Select
              required
              allowDeselect={false}
              label={st('paymentTerm.form.periodUnit')}
              data={PERIOD_UNITS.map(([value, key]) => ({
                value,
                label: st(`paymentTerm.form.${key}`),
              }))}
              {...form.getInputProps('periodUnit')}
            />
            <NumberInput
              clampBehavior="none"
              required
              hideControls
              allowDecimal={false}
              min={2}
              label={st('paymentTerm.form.periods')}
              description={st('paymentTerm.form.periodsHint')}
              {...form.getInputProps('periods')}
            />
          </>
        )}
      </Stack>
    </PaymentTermSection>
  );
}

export function PaymentTermDueSection({ form }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const visible = visiblePaymentTermFields(form.values);
  return (
    <PaymentTermSection
      icon={IconCalendarDue}
      title={st('paymentTerm.form.sectionDue')}
      subtitle={st('paymentTerm.form.sectionDueSub')}
    >
      <Stack gap="md">
        <Switch
          label={st('paymentTerm.form.hasDueTerm')}
          description={st('paymentTerm.form.hasDueTermHint')}
          {...form.getInputProps('hasDueTerm', { type: 'checkbox' })}
        />
        {visible.due && (
          <>
            <NumberInput
              clampBehavior="none"
              required
              hideControls
              allowDecimal={false}
              min={0}
              label={st('paymentTerm.form.dueDays')}
              {...form.getInputProps('dueDays')}
            />
            <Select
              required
              allowDeselect={false}
              label={st('paymentTerm.form.dueBasis')}
              data={DUE_BASES.map(([value, key]) => ({
                value,
                label: st(`paymentTerm.form.${key}`),
              }))}
              {...form.getInputProps('dueBasis')}
            />
          </>
        )}
      </Stack>
    </PaymentTermSection>
  );
}

/** Retention only exists for billing in several installments. */
export function PaymentTermRetentionSection({ form }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const visible = visiblePaymentTermFields(form.values);
  if (!visible.retention) {
    return null;
  }
  return (
    <PaymentTermSection
      icon={IconShieldCheck}
      title={st('paymentTerm.form.sectionRetention')}
      subtitle={st('paymentTerm.form.sectionRetentionSub')}
    >
      <Stack gap="md">
        <Switch
          label={st('paymentTerm.form.hasRetention')}
          {...form.getInputProps('hasRetention', { type: 'checkbox' })}
        />
        {visible.retentionDetails && (
          <>
            <NumberInput
              clampBehavior="none"
              required
              hideControls
              min={0}
              max={100}
              suffix="%"
              label={st('paymentTerm.form.retentionPercent')}
              {...form.getInputProps('retentionPercent')}
            />
            <NumberInput
              clampBehavior="none"
              required
              hideControls
              allowDecimal={false}
              min={1}
              label={st('paymentTerm.form.maintenanceMonths')}
              {...form.getInputProps('maintenanceMonths')}
            />
          </>
        )}
      </Stack>
    </PaymentTermSection>
  );
}
