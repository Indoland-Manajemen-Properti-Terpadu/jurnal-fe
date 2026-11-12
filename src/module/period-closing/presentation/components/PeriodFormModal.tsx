import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle, IconLock, IconBook2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import {
  countDays,
  findOverlap,
  isCalendarDay,
  lockPresetRange,
  validatePeriodValues,
  type DateRange,
  type PeriodFormErrors,
} from '@/module/period-closing/domain/periodRules';
import {
  useActivePeriods,
  useCreatePeriod,
  useUpdatePeriod,
} from '@/module/period-closing/presentation/hooks/usePeriodQueries';
import {
  formatDay,
  formatRange,
  suggestPeriodName,
  todayDay,
} from '@/module/period-closing/presentation/periodFormat';
import { PeriodRangeFields } from './PeriodRangeFields';

interface PeriodFormModalProps {
  opened: boolean;
  /** `null` creates a new lock; a period opens it for editing. */
  period: AccountingPeriod | null;
  onClose: () => void;
}

interface FormState {
  name: string;
  notes: string;
  range: DateRange;
  isActive: boolean;
  /** Once the user types a name it is no longer replaced by the suggested one. */
  nameEdited: boolean;
}

const initialState = (
  period: AccountingPeriod | null,
  suggest: (range: DateRange) => string
): FormState => {
  if (period) {
    return {
      name: period.name,
      notes: period.notes,
      range: { startDate: period.startDate, endDate: period.endDate },
      isActive: period.isActive,
      nameEdited: true,
    };
  }
  const range = lockPresetRange('lastMonth', todayDay());
  return { name: suggest(range), notes: '', range, isActive: true, nameEdited: false };
};

/** Lock a new period, or edit one: a closing only changes its name and notes. */
export function PeriodFormModal({ opened, period, onClose }: Readonly<PeriodFormModalProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const suggest = (range: DateRange) => suggestPeriodName('LOCK', range, currentLanguage, t);
  const [state, setState] = useState<FormState>(() => initialState(period, suggest));
  const [errors, setErrors] = useState<PeriodFormErrors>({});

  const isEdit = Boolean(period);
  const isClosing = period?.type === 'CLOSE';
  const type = period?.type ?? 'LOCK';
  const active = useActivePeriods(type, opened && !isClosing);
  const create = useCreatePeriod();
  const update = useUpdatePeriod();
  const saving = create.isPending || update.isPending;

  const rangeComplete = isCalendarDay(state.range.startDate) && isCalendarDay(state.range.endDate);
  const overlap =
    !isClosing && rangeComplete && state.isActive && state.range.endDate >= state.range.startDate
      ? findOverlap(state.range, type, active.data?.items ?? [], period?.id)
      : undefined;

  const setRange = (range: DateRange) => {
    setState((current) => ({
      ...current,
      range,
      name: current.nameEdited ? current.name : suggest(range),
    }));
    setErrors((current) => ({ ...current, startDate: undefined, endDate: undefined }));
  };

  const submit = () => {
    const found = validatePeriodValues({ name: state.name, ...state.range });
    setErrors(found);
    if (Object.keys(found).length > 0 || overlap || saving) return;

    const onSuccess = () => onClose();
    if (!period) {
      create.mutate(
        { name: state.name, type: 'LOCK', notes: state.notes, ...state.range },
        { onSuccess }
      );
      return;
    }
    update.mutate(
      {
        id: period.id,
        values: isClosing
          ? { name: state.name, notes: state.notes }
          : { name: state.name, notes: state.notes, ...state.range, isActive: state.isActive },
      },
      { onSuccess }
    );
  };

  const errorText = (field: keyof PeriodFormErrors) =>
    errors[field] ? t(`form.errors.${errors[field]}`) : undefined;

  const title = !isEdit
    ? t('form.createTitle')
    : isClosing
      ? t('form.editCloseTitle')
      : t('form.editLockTitle');

  return (
    <Modal
      opened={opened}
      onClose={saving ? () => undefined : onClose}
      centered
      size="lg"
      radius="lg"
      title={
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color={isClosing ? 'primary' : 'orange'}>
            {isClosing ? <IconBook2 size={20} /> : <IconLock size={20} />}
          </ThemeIcon>
          <div>
            <Text fw={700}>{title}</Text>
            <Text size="xs" c="dimmed">
              {period
                ? t('form.editSubtitle', { range: formatRange(period, currentLanguage) })
                : t('form.createSubtitle')}
            </Text>
          </div>
        </Group>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Stack gap="md">
          {isClosing && (
            <Alert variant="light" color="gray" radius="md" icon={<IconInfoCircle size={18} />}>
              {t('form.closeLocked')}
            </Alert>
          )}

          <PeriodRangeFields
            range={state.range}
            onChange={setRange}
            disabled={isClosing}
            today={isEdit ? undefined : todayDay()}
            errors={{ startDate: errorText('startDate'), endDate: errorText('endDate') }}
          />

          {overlap ? (
            <Alert variant="light" color="red" radius="md" icon={<IconAlertTriangle size={18} />}>
              {t('form.overlap', {
                name: overlap.name,
                range: formatRange(overlap, currentLanguage),
              })}
            </Alert>
          ) : (
            !isClosing &&
            rangeComplete &&
            state.range.endDate >= state.range.startDate && (
              <Alert
                variant="light"
                color={state.isActive ? 'orange' : 'gray'}
                radius="md"
                icon={<IconLock size={18} />}
              >
                {state.isActive
                  ? t('form.impact', {
                      start: formatDay(state.range.startDate, currentLanguage),
                      end: formatDay(state.range.endDate, currentLanguage),
                      days: countDays(state.range),
                    })
                  : t('form.impactInactive')}
              </Alert>
            )
          )}

          <TextInput
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            radius="md"
            withAsterisk
            value={state.name}
            error={errorText('name')}
            maxLength={120}
            onChange={(event) => {
              const name = event.currentTarget.value;
              setState((current) => ({ ...current, name, nameEdited: true }));
              setErrors((current) => ({ ...current, name: undefined }));
            }}
          />

          <Textarea
            label={t('form.notes')}
            placeholder={t('form.notesPlaceholder')}
            radius="md"
            autosize
            minRows={2}
            maxRows={4}
            maxLength={500}
            value={state.notes}
            onChange={(event) => {
              const notes = event.currentTarget.value;
              setState((current) => ({ ...current, notes }));
            }}
          />

          {isEdit && !isClosing && (
            <Switch
              label={t('form.active')}
              description={t('form.activeHint')}
              checked={state.isActive}
              onChange={(event) => {
                const isActive = event.currentTarget.checked;
                setState((current) => ({ ...current, isActive }));
              }}
            />
          )}

          <Group justify="flex-end" gap="sm" mt="xs">
            <Button variant="default" radius="md" onClick={onClose} disabled={saving}>
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              color="primary"
              radius="md"
              loading={saving}
              disabled={Boolean(overlap)}
              leftSection={isEdit ? undefined : <IconLock size={16} />}
            >
              {isEdit ? t('actions.save') : t('actions.lockPeriod')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
