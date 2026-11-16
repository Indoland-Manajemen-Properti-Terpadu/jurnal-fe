import { Alert, Skeleton, Stack, TextInput, Textarea } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCalendarDue,
  IconInfoCircle,
  IconLock,
  IconSparkles,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { addDays } from '@/module/period-closing/domain/periodRules';
import type { CloseBooksWizard } from '@/module/period-closing/presentation/hooks/useCloseBooksWizard';
import { formatDay, formatRange } from '@/module/period-closing/presentation/periodFormat';
import { PeriodRangeFields } from '../PeriodRangeFields';
import { StepCard } from './StepCard';

/** Step 1: which range to close, with its effect spelled out before anything happens. */
export function ClosingPeriodStep({ wizard }: Readonly<{ wizard: CloseBooksWizard }>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const { range, errors, overlap, gapDays, latestClosing, rangeValid } = wizard;
  const day = (value: string) => formatDay(value, currentLanguage);
  const errorText = (field: keyof typeof errors) =>
    errors[field] ? t(`form.errors.${errors[field]}`) : undefined;

  return (
    <StepCard step={1} title={t('wizard.period.title')} description={t('wizard.period.subtitle')}>
      {wizard.loadingClosings ? (
        <Stack gap="sm">
          <Skeleton height={56} radius="md" />
          <Skeleton height={56} radius="md" />
        </Stack>
      ) : (
        <Stack gap="md">
          {latestClosing && (
            <Alert variant="light" color="gray" radius="md" icon={<IconSparkles size={18} />}>
              {t('wizard.period.suggested')}
            </Alert>
          )}

          <PeriodRangeFields
            range={range}
            onChange={wizard.setRange}
            errors={{ startDate: errorText('startDate'), endDate: errorText('endDate') }}
          />

          {overlap && (
            <Alert variant="light" color="red" radius="md" icon={<IconAlertTriangle size={18} />}>
              {t('wizard.period.overlap', {
                name: overlap.name,
                range: formatRange(overlap, currentLanguage),
              })}
            </Alert>
          )}

          {rangeValid && !overlap && (
            <Alert variant="light" color="primary" radius="md" icon={<IconLock size={18} />}>
              {t('wizard.period.impact', { end: day(range.endDate) })}
            </Alert>
          )}

          {rangeValid && !overlap && !latestClosing && (
            <Alert variant="light" color="gray" radius="md" icon={<IconInfoCircle size={18} />}>
              {t('wizard.period.firstClosing', {
                start: day(range.startDate),
                end: day(range.endDate),
              })}
            </Alert>
          )}

          {rangeValid && gapDays > 0 && latestClosing && (
            <Alert
              variant="light"
              color="orange"
              radius="md"
              icon={<IconAlertTriangle size={18} />}
            >
              {t('wizard.period.gap', {
                days: gapDays,
                range: formatRange(
                  {
                    startDate: addDays(latestClosing.endDate, 1),
                    endDate: addDays(range.startDate, -1),
                  },
                  currentLanguage
                ),
              })}
            </Alert>
          )}

          {rangeValid && range.endDate >= wizard.today && (
            <Alert variant="light" color="orange" radius="md" icon={<IconCalendarDue size={18} />}>
              {t('wizard.period.future', { end: day(range.endDate) })}
            </Alert>
          )}

          <TextInput
            label={t('form.name')}
            radius="md"
            withAsterisk
            maxLength={120}
            value={wizard.name}
            error={errorText('name')}
            onChange={(event) => wizard.setName(event.currentTarget.value)}
          />
          <Textarea
            label={t('form.notes')}
            placeholder={t('wizard.period.notesPlaceholder')}
            radius="md"
            autosize
            minRows={2}
            maxRows={4}
            maxLength={500}
            value={wizard.notes}
            onChange={(event) => wizard.setNotes(event.currentTarget.value)}
          />
        </Stack>
      )}
    </StepCard>
  );
}
