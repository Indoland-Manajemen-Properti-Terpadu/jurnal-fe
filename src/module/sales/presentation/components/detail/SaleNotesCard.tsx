import { Paper, SimpleGrid } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import type { Sale } from '@/module/sales/domain/sale';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { DetailCardHeader } from './DetailCardHeader';
import { DetailField } from './DetailField';

export function SaleNotesCard({ sale, display }: Readonly<{ sale: Sale; display: SaleDisplay }>) {
  const { t } = display;

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <DetailCardHeader
        icon={<IconNotes size={19} />}
        title={t('notesTitle')}
        subtitle={t('notesSubtitle')}
      />
      <SimpleGrid cols={{ base: 1, sm: sale.message && sale.memo ? 2 : 1 }} spacing="lg">
        {sale.message && <DetailField label={t('customerMessage')}>{sale.message}</DetailField>}
        {sale.memo && <DetailField label={t('internalMemo')}>{sale.memo}</DetailField>}
      </SimpleGrid>
    </Paper>
  );
}
