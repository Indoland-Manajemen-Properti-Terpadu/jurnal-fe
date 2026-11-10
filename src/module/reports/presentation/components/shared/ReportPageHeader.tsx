import type { ReactNode } from 'react';
import type { Icon } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { ReportBackButton } from '@/module/reports/presentation/components/shared/ReportBackButton';

import { useTranslation } from '@/i18n';

interface ReportPageHeaderProps {
  icon: Icon;
  title: string;
  description: string;
  /** Page actions shown after the way back to the report center. */
  actions?: ReactNode;
}

export function ReportPageHeader({ icon, title, description, actions }: ReportPageHeaderProps) {
  const { t } = useTranslation('reports');
  return (
    <ModuleHeader
      icon={icon}
      title={title}
      description={description}
      actions={
        <>
          <ReportBackButton />
          {actions}
        </>
      }
      breadcrumbs={[
        { label: t('common.reportsBreadcrumb'), to: routes.reports.main },
        { label: title },
      ]}
    />
  );
}
