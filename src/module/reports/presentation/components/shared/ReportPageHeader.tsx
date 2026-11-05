import type { Icon } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { ReportBackButton } from '@/module/reports/presentation/components/shared/ReportBackButton';

import { useTranslation } from '@/i18n';

interface ReportPageHeaderProps {
  icon: Icon;
  title: string;
  description: string;
}

export function ReportPageHeader({ icon, title, description }: ReportPageHeaderProps) {
  const { t } = useTranslation('reports');
  return (
    <ModuleHeader
      icon={icon}
      title={title}
      description={description}
      actions={<ReportBackButton />}
      breadcrumbs={[
        { label: t('common.reportsBreadcrumb'), to: routes.reports.main },
        { label: title },
      ]}
    />
  );
}
