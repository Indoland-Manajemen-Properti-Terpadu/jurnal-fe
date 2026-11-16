import { Chip, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  LOCK_PRESETS,
  lockPresetRange,
  type DateRange,
  type LockPreset,
} from '@/module/period-closing/domain/periodRules';

interface DayFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  minDate?: string;
  description?: string;
}

/** A date input that reads and writes calendar days (`YYYY-MM-DD`). */
export function DayField({
  label,
  value,
  onChange,
  error,
  disabled,
  minDate,
  description,
}: Readonly<DayFieldProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  return (
    <DatePickerInput
      label={label}
      description={description}
      placeholder={t('form.datePlaceholder')}
      radius="md"
      valueFormat="DD MMM YYYY"
      locale={currentLanguage === 'en' ? 'en' : 'id'}
      rightSection={<IconCalendar size={16} />}
      rightSectionPointerEvents="none"
      value={value || null}
      onChange={(next) => onChange(next ? String(next).slice(0, 10) : '')}
      error={error}
      disabled={disabled}
      minDate={minDate}
      withAsterisk={!disabled}
    />
  );
}

interface PeriodRangeFieldsProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  errors?: Partial<Record<keyof DateRange, string>>;
  disabled?: boolean;
  /** Today, for the quick picks; leave out to hide them. */
  today?: string;
}

/** Start and end of a period, with quick picks (last month, quarter, year) for locks. */
export function PeriodRangeFields({
  range,
  onChange,
  errors,
  disabled,
  today,
}: Readonly<PeriodRangeFieldsProps>) {
  const { t } = useTranslation('periodClosing');
  const activePreset = today
    ? LOCK_PRESETS.find((preset) => {
        const candidate = lockPresetRange(preset, today);
        return candidate.startDate === range.startDate && candidate.endDate === range.endDate;
      })
    : undefined;

  return (
    <Stack gap="sm">
      {today && !disabled && (
        <Stack gap={6}>
          <Text size="sm" fw={500}>
            {t('presets.label')}
          </Text>
          <Chip.Group
            value={activePreset ?? ''}
            onChange={(value) => {
              if (typeof value === 'string' && value) {
                onChange(lockPresetRange(value as LockPreset, today));
              }
            }}
          >
            <Group gap="xs">
              {LOCK_PRESETS.map((preset) => (
                <Chip
                  key={preset}
                  value={preset}
                  size="sm"
                  radius="md"
                  variant="outline"
                  color="primary"
                >
                  {t(`presets.${preset}`)}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <DayField
          label={t('form.startDate')}
          value={range.startDate}
          onChange={(startDate) => onChange({ ...range, startDate })}
          error={errors?.startDate}
          disabled={disabled}
        />
        <DayField
          label={t('form.endDate')}
          value={range.endDate}
          onChange={(endDate) => onChange({ ...range, endDate })}
          error={errors?.endDate}
          disabled={disabled}
          minDate={range.startDate || undefined}
        />
      </SimpleGrid>
    </Stack>
  );
}
