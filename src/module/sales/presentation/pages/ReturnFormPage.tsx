import { useMemo } from 'react';
import { Alert, Box, Button, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconReceiptRefund } from '@tabler/icons-react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { returnActions } from '../../domain/saleReturn';
import { canReturnSale, emptyReturnForm, returnToFormValues } from '../../domain/saleReturnForm';
import { ReturnFormBody } from '../components/returns/ReturnFormBody';
import { useReturn } from '../hooks/useReturnQueries';
import { useSaleDetail } from '../hooks/useSaleQueries';

const detailPath = (id: string) => routes.sales.returnDetail.replace(':id', id);
const localToday = (): string => new Date().toLocaleDateString('en-CA');

/** Create a return for `?sale=<invoice id>`, or edit a draft when the route carries an id. */
export function ReturnFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('salesReturns');
  const isEdit = Boolean(id);
  const returnQuery = useReturn(id);
  const saleId = isEdit ? (returnQuery.data?.sale ?? undefined) : (params.get('sale') ?? undefined);
  const saleQuery = useSaleDetail(saleId);
  const sale = saleQuery.data;
  const ret = returnQuery.data;

  const initial = useMemo(() => {
    if (!sale) return undefined;
    if (isEdit) return ret ? returnToFormValues(ret, sale) : undefined;
    return emptyReturnForm(sale, localToday());
  }, [sale, ret, isEdit]);

  const back = () => navigate(id ? detailPath(id) : routes.sales.returns);

  if (!isEdit && !saleId) return <Navigate to={routes.sales.returns} replace />;
  if (isEdit && returnQuery.isError) return <Navigate to={routes.sales.returns} replace />;
  // Only a draft can be changed; any other return opens on its detail instead.
  if (isEdit && ret && !returnActions(ret).edit) {
    return <Navigate to={detailPath(ret.id)} replace />;
  }

  const loading = (isEdit && returnQuery.isLoading) || saleQuery.isLoading;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceiptRefund}
            title={isEdit ? t('form.titleEdit') : t('form.titleNew')}
            description={isEdit ? t('form.descriptionEdit') : t('form.descriptionNew')}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
                {t('detail.backToList')}
              </Button>
            }
          />
          {loading && (
            <Stack align="center" gap="xs" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                {t('form.loading')}
              </Text>
            </Stack>
          )}
          {saleQuery.isError && (
            <Alert color="red" title={t('detail.errorTitle')}>
              {t('detail.errorDescription')}
            </Alert>
          )}
          {sale && !isEdit && !canReturnSale(sale) && (
            <Alert color="yellow">{t('form.notReturnable')}</Alert>
          )}
          {sale && initial && (isEdit || canReturnSale(sale)) && (
            <ReturnFormBody key={id ?? 'new'} sale={sale} initial={initial} returnId={id} />
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default ReturnFormPage;
