import { Paper, SimpleGrid, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconBuildingStore, IconRoute, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ProcurementRoute } from '@/module/purchases/domain/purchaseRequest';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

interface RoutePickerProps {
  loading: boolean;
  onPick: (route: ProcurementRoute) => void;
}

const ROUTES = [
  { route: 'BIDDING', icon: IconScale },
  { route: 'SINGLE', icon: IconBuildingStore },
] as const;

/** The first choice of procurement: bidding among vendors, or a single vendor. */
export const ProcurementRoutePicker = ({ loading, onPick }: Readonly<RoutePickerProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconRoute}
      title={t('procurement.pickTitle')}
      subtitle={t('procurement.pickSubtitle')}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {ROUTES.map(({ route, icon: RouteIcon }) => (
          <UnstyledButton
            key={route}
            disabled={loading}
            onClick={() => onPick(route)}
            aria-label={t(`procurement.route.${route}`)}
          >
            <Paper withBorder radius="md" p="md" bg="white" style={{ height: '100%' }}>
              <Stack gap={6}>
                <ThemeIcon size={36} radius="md" variant="light" color="primary">
                  <RouteIcon size={18} stroke={1.8} />
                </ThemeIcon>
                <Text fw={600}>{t(`procurement.route.${route}`)}</Text>
                <Text size="sm" c="dimmed">
                  {t(`procurement.routeHint.${route}`)}
                </Text>
              </Stack>
            </Paper>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </SectionCard>
  );
};
