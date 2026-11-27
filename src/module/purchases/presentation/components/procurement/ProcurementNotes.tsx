import { useEffect, useRef, useState } from 'react';
import { Stack, Text, Textarea } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Procurement } from '@/module/purchases/domain/procurement';
import {
  noteFields,
  type NoteKey,
  type NotesValues,
} from '@/module/purchases/domain/procurementNotes';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

interface ProcurementNotesProps {
  procurement: Procurement;
  editable: boolean;
  saving: boolean;
  /** Without its own card, to sit inside another card. */
  bare?: boolean;
  onSave: (values: NotesValues) => Promise<unknown> | void;
}

const fromProcurement = (procurement: Procurement): NotesValues => ({
  singleReason: procurement.singleReason,
  belowMinQuotesReason: procurement.belowMinQuotesReason,
  reason: procurement.reason,
  negotiationNote: procurement.negotiationNote,
});

/**
 * The reasons the approver reads: why one vendor, why this choice and how it was negotiated, why
 * fewer quotes. A field saves itself when it is left, so the submit button never waits on a
 * separate "save notes" step.
 */
export const ProcurementNotes = ({
  procurement,
  editable,
  saving,
  bare,
  onSave,
}: Readonly<ProcurementNotesProps>) => {
  const { t } = useTranslation('purchases');
  const route = procurement.route === 'SINGLE' ? 'SINGLE' : 'BIDDING';
  const [values, setValues] = useState<NotesValues>(() => fromProcurement(procurement));
  const [saveState, setSaveState] = useState<'idle' | 'pending' | 'saved' | 'failed'>('idle');
  const lastSaved = useRef<NotesValues>(fromProcurement(procurement));

  // A refreshed procurement updates the fields the person has not touched since the last sync;
  // what they are typing in another field stays.
  useEffect(() => {
    const saved = fromProcurement(procurement);
    setValues((current) => {
      const next = { ...current };
      (Object.keys(saved) as NoteKey[]).forEach((key) => {
        if (current[key].trim() === lastSaved.current[key].trim()) next[key] = saved[key];
      });
      return next;
    });
    lastSaved.current = saved;
  }, [procurement]);

  const fields = noteFields(procurement);
  const leave = () => {
    const changed = (Object.keys(values) as NoteKey[]).some(
      (key) => values[key].trim() !== procurement[key].trim()
    );
    if (!editable || !changed) return;
    setSaveState('pending');
    Promise.resolve(onSave(values)).then(
      () => setSaveState('saved'),
      () => setSaveState('failed')
    );
  };

  const body = (
    <Stack gap="md">
      {fields.map(({ key, needed }) => (
        <Textarea
          key={key}
          radius="md"
          autosize
          minRows={2}
          withAsterisk={needed}
          disabled={!editable}
          label={t(`procurement.notes.${key === 'reason' ? `reason.${route}` : key}`)}
          description={t(
            `procurement.notes.${key === 'reason' ? `reasonHint.${route}` : `${key}Hint`}`
          )}
          value={values[key]}
          onChange={(event) => setValues({ ...values, [key]: event.currentTarget.value })}
          onBlur={leave}
        />
      ))}
      <Text size="xs" c="dimmed">
        {editable
          ? saving || saveState === 'pending'
            ? t('procurement.notes.saving')
            : saveState === 'failed'
              ? t('procurement.notes.saveFailed')
              : saveState === 'saved'
                ? t('procurement.notes.saved')
                : t('procurement.notes.autosave')
          : t('procurement.notes.locked')}
      </Text>
    </Stack>
  );
  if (bare) return body;
  return (
    <SectionCard
      icon={IconNotes}
      title={t('procurement.notes.title')}
      subtitle={t('procurement.notes.subtitle')}
    >
      {body}
    </SectionCard>
  );
};
