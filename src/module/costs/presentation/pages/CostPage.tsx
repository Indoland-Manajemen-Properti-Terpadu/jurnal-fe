import AppShellLayout from '@/components/AppShellLayout';
import BaseModulePage from '@/components/BaseModulePage';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

function CostPage() {
  const { t } = useTranslation('costs');

  return (
    <AppShellLayout>
      <BaseModulePage
        title={t('title')}
        description={t('description')}
        routePath={routes.costs.main}
      />
    </AppShellLayout>
  );
}

export default CostPage;
