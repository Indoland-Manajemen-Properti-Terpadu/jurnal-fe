import AppShellLayout from '@/components/AppShellLayout';
import BaseModulePage from '@/components/BaseModulePage';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

function BudgetPlanningPage() {
  const { t } = useTranslation('budgeting');

  return (
    <AppShellLayout>
      <BaseModulePage
        title={t('title')}
        description={t('description')}
        routePath={routes.budgeting.planning}
      />
    </AppShellLayout>
  );
}

export default BudgetPlanningPage;
