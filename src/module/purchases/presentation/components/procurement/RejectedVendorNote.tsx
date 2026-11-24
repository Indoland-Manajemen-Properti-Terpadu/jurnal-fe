import { Alert, Text } from '@mantine/core';
import { IconBan } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { latestRejection, type Procurement } from '@/module/purchases/domain/procurement';
import { formatDay, toIsoDay } from '@/module/purchases/presentation/components/shared/format';

interface RejectedVendorNoteProps {
  procurement: Procurement;
  vendorId: string;
}

/** Tells who turned this vendor down, when and why; nothing is drawn for a vendor never rejected. */
export const RejectedVendorNote = ({
  procurement,
  vendorId,
}: Readonly<RejectedVendorNoteProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const rejection = latestRejection(procurement, vendorId);
  if (!rejection) return null;
  const date = rejection.rejectedAt
    ? formatDay(toIsoDay(rejection.rejectedAt), currentLanguage)
    : '-';

  return (
    <Alert color="red" variant="light" radius="md" icon={<IconBan size={16} />} p="sm">
      <Text size="sm" fw={600}>
        {rejection.rejectedByName
          ? t('procurement.rejected.withName', { name: rejection.rejectedByName, date })
          : t('procurement.rejected.withoutName', { date })}
      </Text>
      <Text size="sm">
        {rejection.reason
          ? t('procurement.rejected.reason', { reason: rejection.reason })
          : t('procurement.rejected.noReason')}
      </Text>
      <Text size="xs" c="dimmed" mt={4}>
        {t('procurement.rejected.cannotChoose')}
      </Text>
      {/* The way forward: a single-vendor route has no other quote to pick, so it says how to get one. */}
      <Text size="xs" fw={600} mt={4}>
        {t(
          procurement.route === 'SINGLE'
            ? 'procurement.rejected.nextSingle'
            : 'procurement.rejected.nextBidding'
        )}
      </Text>
    </Alert>
  );
};
