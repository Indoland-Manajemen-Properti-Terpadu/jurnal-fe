import { Button, Paper, Skeleton, Text } from '@mantine/core';
import { IconArrowLeft, IconCoins } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { isValidObjectId } from '@/module/petty-cash/domain/pettyCashView';
import { PettyCashWorkspace } from '@/module/petty-cash/presentation/components/PettyCashWorkspace';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { usePettyCashFund } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { PettyCashPageFrame } from '@/module/petty-cash/presentation/pages/PettyCashPageFrame';

export default function PettyCashDetailPage() {
  const { fundId } = useParams<{ fundId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('pettyCash');
  const validId = isValidObjectId(fundId);
  const query = usePettyCashFund(fundId, validId);
  const fund = query.data;
  // A malformed id is answered with a 400 and no screen of its own, so it is treated as not found.
  const notFound = !validId || query.error?.code === 'NOT_FOUND';
  const goBack = () => navigate(routes.pettyCash.main);

  return (
    <PettyCashPageFrame>
      <ModuleHeader
        icon={IconCoins}
        title={fund?.name ?? t('workspace.title')}
        description={fund ? fund.code : t('workspace.subtitle')}
        actions={
          <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={goBack}>
            {t('common.back')}
          </Button>
        }
      />

      {validId && query.isLoading && <Skeleton height={240} radius="lg" />}

      {notFound && (
        <Paper withBorder radius="lg" p={{ base: 'xl', sm: 48 }} ta="center" maw={680} mx="auto">
          <Text fz="var(--jurnal-text-xl)" fw={700}>
            {t('workspace.notFound')}
          </Text>
          <Text c="dimmed" mt="xs">
            {t('workspace.notFoundDescription')}
          </Text>
          <Button mt="xl" variant="light" onClick={goBack}>
            {t('workspace.backToList')}
          </Button>
        </Paper>
      )}

      {validId && query.isError && !notFound && (
        <QueryErrorState
          title={t('workspace.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      {validId && fund && <PettyCashWorkspace key={fund.id} fund={fund} />}
    </PettyCashPageFrame>
  );
}
