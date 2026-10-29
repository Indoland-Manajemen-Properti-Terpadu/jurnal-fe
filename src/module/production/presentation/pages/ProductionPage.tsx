import AppShellLayout from '@/components/AppShellLayout';
import BaseModulePage from '@/components/BaseModulePage';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

function ProductionPage() {
  const { t } = useTranslation('production');

  return (
    <AppShellLayout>
      <BaseModulePage
        title={t('title')}
        description={t('description')}
        routePath={routes.baseModules.production}
      />
    </AppShellLayout>
  );
}

export default ProductionPage;
