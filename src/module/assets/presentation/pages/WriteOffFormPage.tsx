import { Box, Button, Skeleton, Stack } from '@mantine/core';
import { IconArrowLeft, IconFileCertificate } from '@tabler/icons-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { WriteOffFormContent } from '@/module/assets/presentation/components/WriteOffFormContent';
import { WriteOffStateCard } from '@/module/assets/presentation/components/WriteOffStateCard';
import { useAsset } from '@/module/assets/presentation/hooks/useAssetQueries';
import { usePendingWriteOffForAsset } from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { routes } from '@/router/routes';

/**
 * "Ajukan Berita Acara Pelepasan" for the asset in `?asset=`. Only an active asset without a
 * pending report gets the form; every other case explains itself. The router wraps it in
 * `AppShellLayout`.
 */
export function WriteOffFormPage() {
  const { t } = useTranslation('assetWriteOffs');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('asset') ?? undefined;
  const asset = useAsset(assetId);
  const active = asset.data?.status === 'active';
  const pending = usePendingWriteOffForAsset(assetId, active);

  const assetDetail = assetId ? routes.assets.detail.replace(':id', assetId) : routes.assets.main;
  const goBack = () => navigate(asset.data ? assetDetail : routes.assets.main);

  const backToList = (
    <Button component={Link} to={routes.assets.main} variant="default" radius="md">
      {t('backToAssets')}
    </Button>
  );

  const renderBody = () => {
    if (asset.isLoading || (active && pending.isLoading)) {
      return (
        <Stack gap="lg">
          <Skeleton h={180} radius="lg" />
          <Skeleton h={240} radius="lg" />
        </Stack>
      );
    }
    if (!asset.data) {
      return (
        <WriteOffStateCard
          illustration="lost"
          title={t('assetNotFoundTitle')}
          body={t('assetNotFoundBody')}
          action={backToList}
        />
      );
    }
    if (!active) {
      return (
        <WriteOffStateCard
          illustration="fully_depreciated"
          title={t('assetNotActiveTitle')}
          body={t('assetNotActiveBody')}
          action={
            <Button component={Link} to={assetDetail} variant="default" radius="md">
              {t('viewAsset')}
            </Button>
          }
        />
      );
    }
    if (pending.data) {
      return (
        <WriteOffStateCard
          illustration="submitted"
          title={t('hasPendingTitle')}
          body={t('hasPendingBody', { number: pending.data.number })}
          action={
            <Button
              component={Link}
              to={routes.assets.writeOffDetail.replace(':id', pending.data.id)}
              radius="md"
            >
              {t('openReport')}
            </Button>
          }
        />
      );
    }
    return <WriteOffFormContent asset={asset.data} />;
  };

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={IconFileCertificate}
          title={t('formTitle')}
          description={asset.data ? `${asset.data.code} · ${asset.data.name}` : ''}
          actions={
            <Button
              variant="default"
              size="md"
              radius="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={goBack}
            >
              {t('back')}
            </Button>
          }
        />
        {renderBody()}
      </Stack>
    </Box>
  );
}

export default WriteOffFormPage;
