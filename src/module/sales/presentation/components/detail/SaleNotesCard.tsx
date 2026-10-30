import { Paper, SimpleGrid, Title } from '@mantine/core';
import type { Sale } from '@/module/sales/domain/sale';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { DetailField } from './DetailField';

export function SaleNotesCard({ sale, display }: Readonly<{ sale: Sale; display: SaleDisplay }>) {
  const { t } = display;

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Title order={3} size="md" mb="md">
        {t('notesTitle')}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: sale.message && sale.memo ? 2 : 1 }} spacing="lg">
        {sale.message && <DetailField label={t('customerMessage')}>{sale.message}</DetailField>}
        {sale.memo && <DetailField label={t('internalMemo')}>{sale.memo}</DetailField>}
      </SimpleGrid>
    </Paper>
  );
}
