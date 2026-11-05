import { useState } from 'react';
import { Alert, Box, Button, Grid, Stack } from '@mantine/core';
import { IconArrowLeft, IconInfoCircle, IconReceipt2 } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { CreateSalePaymentPayload } from '../../domain/sale';
import { PaySaleModal } from '../components/PaySaleModal';
import { SaleActionBar } from '../components/detail/SaleActionBar';
import { SaleDetailError, SaleDetailLoading } from '../components/detail/SaleDetailStates';
import { SaleItemsCard } from '../components/detail/SaleItemsCard';
import { SaleNotesCard } from '../components/detail/SaleNotesCard';
import { SaleOverviewCard } from '../components/detail/SaleOverviewCard';
import { SaleSidebar } from '../components/detail/SaleSidebar';
import { useSaleDisplay } from '../hooks/useSaleDisplay';
import { useCreateSalePayment } from '../hooks/useSaleMutations';
import { useSaleDetail } from '../hooks/useSaleQueries';

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const display = useSaleDisplay();
  const { t } = display;
  const { t: ts } = useTranslation('sales');
  const [payOpened, setPayOpened] = useState(false);
  const { data: sale, isLoading, isError, refetch } = useSaleDetail(id);
  const payMutation = useCreateSalePayment();

  const goBack = () => navigate(routes.sales.main);

  const handlePaySubmit = async (payload: CreateSalePaymentPayload) => {
    await payMutation.mutateAsync(payload);
    setPayOpened(false);
  };

  if (isLoading) return <SaleDetailLoading />;
  if (isError || !sale) {
    return <SaleDetailError display={display} onBack={goBack} onRetry={() => refetch()} />;
  }

  const { code } = sale.displayStatus;
  const note = code === 'DRAFT' ? 'view.draftNote' : code === 'VOID' ? 'view.voidNote' : null;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceipt2}
            title={t('title')}
            description={t('description')}
            breadcrumbs={[
              { label: t('sales'), to: routes.sales.main },
              { label: sale.transactionNumber },
            ]}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={goBack}>
                {t('back')}
              </Button>
            }
          />
          {note && (
            <Alert color="gray" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
              {ts(note)}
            </Alert>
          )}
          <SaleOverviewCard
            sale={sale}
            display={display}
            actions={<SaleActionBar sale={sale} onPay={() => setPayOpened(true)} />}
          />
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                <SaleItemsCard sale={sale} display={display} />
                {(sale.message || sale.memo) && <SaleNotesCard sale={sale} display={display} />}
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <SaleSidebar sale={sale} display={display} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
      <PaySaleModal
        opened={payOpened}
        sale={sale}
        isSubmitting={payMutation.isPending}
        onClose={() => setPayOpened(false)}
        onSubmit={handlePaySubmit}
      />
    </AppShellLayout>
  );
}

export default SaleDetailPage;
