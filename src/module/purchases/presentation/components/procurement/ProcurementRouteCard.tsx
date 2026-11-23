import { Paper, SegmentedControl, Text } from '@mantine/core';
import { IconBuildingStore, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ProcurementRoute } from '@/module/purchases/domain/purchaseRequest';

interface ProcurementRouteCardProps {
  route: ProcurementRoute | null;
  /** The route can be changed now: a draft with at most one quote. */
  canChange: boolean;
  /** Quotes entered so far: they stay saved when the route changes, except bidding quotes going to a single vendor. */
  quoteCount?: number;
  busy: boolean;
  onChange: (route: ProcurementRoute) => void;
}

/** "Jalur pengadaan": bidding or a single vendor as one switch, with a line on what the route means. */
export const ProcurementRouteCard = ({
  route,
  canChange,
  quoteCount = 0,
  busy,
  onChange,
}: Readonly<ProcurementRouteCardProps>) => {
  const { t } = useTranslation('purchases');
  const current = route ?? 'BIDDING';
  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Text fz="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.04em' }} mb="sm">
        {t('procurement.routeCard.title')}
      </Text>
      <SegmentedControl
        fullWidth
        radius="md"
        value={current}
        disabled={!canChange || busy}
        onChange={(value) => onChange(value as ProcurementRoute)}
        data={[
          {
            value: 'BIDDING',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <IconScale size={16} />
                {t('procurement.route.BIDDING')}
              </span>
            ),
          },
          {
            value: 'SINGLE',
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <IconBuildingStore size={16} />
                {t('procurement.route.SINGLE')}
              </span>
            ),
          },
        ]}
      />
      <Text size="sm" c="dimmed" mt="sm">
        {canChange ? t(`procurement.routeHint.${current}`) : t('procurement.routeLocked')}
        {canChange &&
          quoteCount > 0 &&
          ` ${t(current === 'BIDDING' && quoteCount > 1 ? 'procurement.routeDiscard' : 'procurement.routeKeep')}`}
      </Text>
    </Paper>
  );
};
