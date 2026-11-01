import { Button, Paper, Skeleton, Text } from '@mantine/core';
import { IconArrowLeft, IconFileInvoice } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { isValidObjectId } from '@/module/petty-cash/domain/pettyCashView';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { VoucherForm } from '@/module/petty-cash/presentation/components/VoucherForm';
import { useAllowedVoucherActions } from '@/module/petty-cash/presentation/hooks/useAllowedVoucherActions';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import {
  usePettyCashFund,
  usePettyCashVoucher,
} from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { PettyCashPageFrame } from '@/module/petty-cash/presentation/pages/PettyCashPageFrame';

export default function VoucherEditPage() {
  const { fundId, voucherId } = useParams<{ fundId: string; voucherId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const validIds = isValidObjectId(fundId) && isValidObjectId(voucherId);
  const fundQuery = usePettyCashFund(fundId, validIds);
  const voucherQuery = usePettyCashVoucher(validIds ? voucherId : undefined);
  const fund = fundQuery.data;
  const voucher = voucherQuery.data;
  const allowed = useAllowedVoucherActions(voucher, fund);
  // The voucher must belong to the fund in the address, otherwise its checks would use the wrong fund.
  const canEdit = allowed.includes('edit') && voucher?.fund.id === fundId;
  const loading = (validIds && (fundQuery.isLoading || voucherQuery.isLoading)) || access.isLoading;
  const error = fundQuery.error ?? voucherQuery.error;
  const back = () => navigate(`${routes.pettyCash.main}?fund=${fundId ?? ''}`);

  return (
    <PettyCashPageFrame>
      <ModuleHeader
        icon={IconFileInvoice}
        title={voucher ? `${t('form.editTitle')} ${voucher.voucherNumber}` : t('form.editTitle')}
        description={t('form.editSubtitle')}
        actions={
          <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
            {t('common.back')}
          </Button>
        }
      />

      {loading && <Skeleton height={320} radius="lg" />}

      {!validIds && (
        <Paper withBorder radius="lg" p="xl" ta="center" maw={680} mx="auto">
          <Text fw={700}>{t('workspace.invalidFundId')}</Text>
        </Paper>
      )}

      {validIds && error && (
        <QueryErrorState
          title={t('drawer.loadFailed')}
          error={error}
          onRetry={() => {
            fundQuery.refetch();
            voucherQuery.refetch();
          }}
        />
      )}

      {access.isError && (
        <QueryErrorState
          title={t('drawer.loadFailed')}
          error={access.error}
          onRetry={() => access.refetch()}
        />
      )}

      {!loading && fund && voucher && !access.isError && !canEdit && (
        <Paper withBorder radius="lg" p="xl" ta="center" maw={680} mx="auto">
          <Text fw={700}>{t('form.notEditableTitle')}</Text>
          <Text c="dimmed" mt="xs">
            {t('form.notEditableBody')}
          </Text>
        </Paper>
      )}

      {!loading && fund && voucher && canEdit && (
        <VoucherForm key={voucher.id} fund={fund} voucher={voucher} />
      )}
    </PettyCashPageFrame>
  );
}
