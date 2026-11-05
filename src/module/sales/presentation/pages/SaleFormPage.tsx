import { useMemo } from 'react';
import { Box, Button, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconReceipt2 } from '@tabler/icons-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { saleToFormValues } from '../../domain/saleForm';
import { SaleFormBody } from '../components/form/SaleFormBody';
import { useSaleDetail } from '../hooks/useSaleQueries';

/** Create an invoice, or edit a draft when the route carries an id. */
export function SaleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('sales');
  const { data: sale, isLoading, isError } = useSaleDetail(id);
  const initial = useMemo(() => (sale ? saleToFormValues(sale) : undefined), [sale]);

  const isEdit = Boolean(id);
  const back = () => navigate(id ? routes.sales.detail.replace(':id', id) : routes.sales.main);

  if (isEdit && sale && !(sale.displayStatus.code === 'DRAFT' && sale.canEdit)) {
    return <Navigate to={routes.sales.detail.replace(':id', sale.id)} replace />;
  }
  if (isEdit && isError) return <Navigate to={routes.sales.main} replace />;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceipt2}
            title={isEdit ? t('form.titleEdit') : t('form.titleNew')}
            description={isEdit ? t('form.descriptionEdit') : t('form.descriptionNew')}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
                {t('common.back')}
              </Button>
            }
          />
          {isEdit && isLoading && (
            <Stack align="center" gap="xs" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                {t('form.loading')}
              </Text>
            </Stack>
          )}
          {(!isEdit || initial) && <SaleFormBody key={id ?? 'new'} saleId={id} initial={initial} />}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default SaleFormPage;
