import { useState } from 'react';
import { Box, Button, Grid, Stack } from '@mantine/core';
import { IconArrowLeft, IconReceipt2 } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import type { CreateSalePaymentPayload } from '../../domain/sale';
import { invoiceFilename } from '../../domain/saleFormat';
import { PaySaleModal } from '../components/PaySaleModal';
import { SaleDetailError, SaleDetailLoading } from '../components/detail/SaleDetailStates';
import { SaleItemsCard } from '../components/detail/SaleItemsCard';
import { SaleNotesCard } from '../components/detail/SaleNotesCard';
import { SaleOverviewCard } from '../components/detail/SaleOverviewCard';
import { SaleSidebar } from '../components/detail/SaleSidebar';
import { useSaleDisplay } from '../hooks/useSaleDisplay';
import {
  useCreateSalePayment,
  useDownloadInvoicePdf,
  useGenerateInvoiceLink,
  useSaleDetail,
} from '../hooks/useSaleQueries';

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const display = useSaleDisplay();
  const { t } = display;
  const [payModalOpened, setPayModalOpened] = useState(false);
  const { data: sale, isLoading, isError, refetch } = useSaleDetail(id);
  const payMutation = useCreateSalePayment(id);
  const generateLinkMutation = useGenerateInvoiceLink();
  const downloadPdfMutation = useDownloadInvoicePdf();

  const goBack = () => navigate(routes.sales.main);

  const handlePaySubmit = async (payload: CreateSalePaymentPayload) => {
    await payMutation.mutateAsync(payload);
    setPayModalOpened(false);
    refetch();
  };
  const handleGenerateLink = async () => {
    if (!sale) return;
    await generateLinkMutation.mutateAsync(sale.id);
    refetch();
  };
  const handleDownloadPdf = async () => {
    if (!sale) return;
    await downloadPdfMutation.mutateAsync({
      id: sale.id,
      filename: invoiceFilename(sale.transactionNumber),
    });
  };

  if (isLoading) return <SaleDetailLoading />;
  if (isError || !sale) {
    return <SaleDetailError display={display} onBack={goBack} onRetry={() => refetch()} />;
  }

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
          <SaleOverviewCard
            sale={sale}
            display={display}
            isDownloading={downloadPdfMutation.isPending}
            isGeneratingLink={generateLinkMutation.isPending}
            onDownloadPdf={handleDownloadPdf}
            onGenerateLink={handleGenerateLink}
            onRecordPayment={() => setPayModalOpened(true)}
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
        opened={payModalOpened}
        sale={sale}
        isSubmitting={payMutation.isPending}
        onClose={() => setPayModalOpened(false)}
        onSubmit={handlePaySubmit}
      />
    </AppShellLayout>
  );
}

export default SaleDetailPage;
