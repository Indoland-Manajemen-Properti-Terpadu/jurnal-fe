import { Stack, Text } from '@mantine/core';
import { IconCalculator } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ReturnPreview } from '@/module/purchases/domain/returnForm';
import { ReturnValueRows } from '@/module/purchases/presentation/components/returns/ReturnValueRows';
import { FormActions } from '@/module/purchases/presentation/components/shared/FormActions';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface ReturnPreviewCardProps {
  preview: ReturnPreview;
  appliedToBill: number;
  credit: number;
  submitLabel: string;
  loading: boolean;
  blockedReason: string | null;
  onSubmit: () => void;
  onCancel: () => void;
}

/** What the return is worth and where that value will go; saving only keeps a draft. */
export const ReturnPreviewCard = ({
  preview,
  appliedToBill,
  credit,
  submitLabel,
  loading,
  blockedReason,
  onSubmit,
  onCancel,
}: Readonly<ReturnPreviewCardProps>) => {
  const { t } = useTranslation('purchases');
  const hasValue = preview.finalAmount > 0;

  let effect = '';
  if (hasValue) {
    if (appliedToBill === 0) {
      effect = t('returns.form.effectCredit', { credit: formatAmount(credit) });
    } else if (credit === 0) {
      effect = t('returns.form.effectOpen', { applied: formatAmount(appliedToBill) });
    } else {
      effect = t('returns.form.effectSplit', {
        applied: formatAmount(appliedToBill),
        credit: formatAmount(credit),
      });
    }
  }

  return (
    <SectionCard icon={IconCalculator} title={t('returns.form.previewTitle')}>
      {hasValue ? (
        <Stack gap="sm">
          <ReturnValueRows figures={preview} ns="returns.form" />
          <Text size="sm" lh={1.55}>
            {effect}
          </Text>
          <Text size="xs" c="dimmed">
            {t('returns.form.estimateNote')}
          </Text>
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">
          {t('returns.form.previewNone')}
        </Text>
      )}
      <Text size="xs" c="dimmed">
        {t('returns.form.draftNote')}
      </Text>
      {blockedReason && (
        <Text size="xs" c="red" role="alert">
          {blockedReason}
        </Text>
      )}
      <FormActions
        loading={loading}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </SectionCard>
  );
};
