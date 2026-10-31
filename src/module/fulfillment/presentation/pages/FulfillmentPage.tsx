import { AppShellLayout } from '@/components/AppShellLayout';
import { BaseModulePage } from '@/components/BaseModulePage';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';

function FulfillmentPage() {
  const { t } = useTranslation('fulfillment');

  return (
    <AppShellLayout>
      <BaseModulePage
        title={t('title')}
        description={t('description')}
        routePath={routes.fulfillment.main}
      />
    </AppShellLayout>
  );
}

export default FulfillmentPage;
