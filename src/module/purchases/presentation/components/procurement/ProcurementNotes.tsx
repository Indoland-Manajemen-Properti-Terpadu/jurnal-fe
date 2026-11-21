import { useEffect, useState } from 'react';
import { Button, Stack, Text, Textarea } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Procurement } from '@/module/purchases/domain/procurement';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

export interface NotesValues {
  singleReason: string;
  belowMinQuotesReason: string;
  reason: string;
  negotiationNote: string;
}

/** Which written reasons this procurement needs, from what the service checks before submitting. */
export const neededNotes = (procurement: Procurement) => {
  const winner = procurement.quotes.find((quote) => quote.vendor.id === procurement.winnerId);
  const complete = Object.values(procurement.totals).filter((totals) => totals.complete).length;
  const negotiated = Boolean(
    winner?.lines.some((line) => line.finalPrice !== null && line.finalPrice > line.unitPrice)
  );
  return {
    single: procurement.route === 'SINGLE',
    belowMin: procurement.route !== 'SINGLE' && complete < procurement.minQuotes,
    notCheapest:
      procurement.route !== 'SINGLE' &&
      winner !== undefined &&
      procurement.cheapestVendorId !== null &&
      procurement.cheapestVendorId !== procurement.winnerId,
    negotiated,
  };
};

interface ProcurementNotesProps {
  procurement: Procurement;
  editable: boolean;
  saving: boolean;
  onSave: (values: NotesValues) => void;
}

const fromProcurement = (procurement: Procurement): NotesValues => ({
  singleReason: procurement.singleReason,
  belowMinQuotesReason: procurement.belowMinQuotesReason,
  reason: procurement.reason,
  negotiationNote: procurement.negotiationNote,
});

/** The reasons the approver reads: why one vendor, why not the cheapest, why the price went up. */
export const ProcurementNotes = ({
  procurement,
  editable,
  saving,
  onSave,
}: Readonly<ProcurementNotesProps>) => {
  const { t } = useTranslation('purchases');
  const needed = neededNotes(procurement);
  const [values, setValues] = useState<NotesValues>(() => fromProcurement(procurement));

  useEffect(() => {
    setValues(fromProcurement(procurement));
  }, [procurement]);

  const dirty = (Object.keys(values) as (keyof NotesValues)[]).some(
    (key) => values[key].trim() !== procurement[key].trim()
  );
  const fields: { key: keyof NotesValues; needed: boolean }[] = [
    { key: 'singleReason', needed: needed.single },
    { key: 'belowMinQuotesReason', needed: needed.belowMin },
    { key: 'reason', needed: needed.notCheapest },
    { key: 'negotiationNote', needed: needed.negotiated },
  ];
  const visible = fields.filter((field) => field.needed || values[field.key].trim() !== '');

  if (visible.length === 0) return null;

  return (
    <SectionCard
      icon={IconNotes}
      title={t('procurement.notes.title')}
      subtitle={t('procurement.notes.subtitle')}
    >
      <Stack gap="md">
        {visible.map(({ key, needed: required }) => (
          <Textarea
            key={key}
            radius="md"
            autosize
            minRows={2}
            withAsterisk={required}
            disabled={!editable}
            label={t(`procurement.notes.${key}`)}
            description={t(`procurement.notes.${key}Hint`)}
            value={values[key]}
            onChange={(event) => setValues({ ...values, [key]: event.currentTarget.value })}
          />
        ))}
        {editable ? (
          <div>
            <Button
              variant="default"
              disabled={!dirty}
              loading={saving}
              onClick={() => onSave(values)}
            >
              {t('procurement.notes.save')}
            </Button>
          </div>
        ) : (
          <Text size="xs" c="dimmed">
            {t('procurement.notes.locked')}
          </Text>
        )}
      </Stack>
    </SectionCard>
  );
};
