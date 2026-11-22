import { Anchor, Box, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { Warehouse } from '@/module/inventory/domain/warehouse';
import { routes } from '@/router/routes';
import { dateFormatV1 } from '@/utils/formatDate';

type FieldProps = { label: string; children: React.ReactNode; muted?: boolean };

const Field = ({ label, children, muted }: Readonly<FieldProps>) => (
  <Box>
    <Text size="xs" c="dimmed" fw={600}>
      {label}
    </Text>
    <Text size="sm" c={muted ? 'dimmed' : 'dark.8'} mt={2}>
      {children}
    </Text>
  </Box>
);

/** Where the warehouse is, who looks after it, and its last and running stock counts. */
export function WarehouseInfoCard({ warehouse }: Readonly<{ warehouse: Warehouse }>) {
  const { t } = useTranslation('warehouses');
  const blank = t('detail.info.blank');
  const cityPostal = [warehouse.city, warehouse.postalCode].filter(Boolean).join(' ');
  const created = [
    warehouse.createdBy?.name,
    warehouse.createdAt ? dateFormatV1(warehouse.createdAt, 'D MMM YYYY') : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Paper withBorder radius="md" p="lg" bg="white">
      <Stack gap="md">
        <Box style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ThemeIcon size={36} radius="md" variant="light" color="primary">
            <IconInfoCircle size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} fz={15} c="dark.9" lh={1.3}>
              {t('detail.info.title')}
            </Text>
            <Text fz={12} c="dimmed">
              {t('detail.info.subtitle')}
            </Text>
          </Box>
        </Box>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" verticalSpacing="md">
          <Field label={t('detail.info.address')} muted={!warehouse.address}>
            {warehouse.address || blank}
          </Field>
          <Field label={t('detail.info.cityPostal')} muted={!cityPostal}>
            {cityPostal || blank}
          </Field>
          <Field label={t('detail.info.pic')} muted={!warehouse.picUser}>
            {warehouse.picUser?.name ?? t('table.unassigned')}
          </Field>
          <Field label={t('detail.info.phone')} muted={!warehouse.phone}>
            {warehouse.phone || blank}
          </Field>
          <Field label={t('detail.info.created')} muted={!created}>
            {created || blank}
          </Field>
          <Field label={t('detail.info.notes')} muted={!warehouse.notes}>
            {warehouse.notes || blank}
          </Field>
          <Field label={t('detail.info.lastOpname')} muted={!warehouse.lastOpname}>
            {warehouse.lastOpname
              ? `${dateFormatV1(warehouse.lastOpname.date, 'D MMM YYYY')} · ${warehouse.lastOpname.number}`
              : t('detail.info.none')}
          </Field>
          <Field label={t('detail.info.runningOpname')} muted={!warehouse.runningOpname}>
            {warehouse.runningOpname ? (
              <Anchor component={Link} to={routes.inventory.stockTake} size="sm">
                {warehouse.runningOpname.number}
              </Anchor>
            ) : (
              t('detail.info.none')
            )}
          </Field>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
