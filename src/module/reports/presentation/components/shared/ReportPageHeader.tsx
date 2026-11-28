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
  /** Page actions shown on the right side of the header. */
  actions?: ReactNode;
  showBackButton?: boolean;
  compact?: boolean;
}

export function ReportPageHeader({
  icon,
  title,
  description,
  actions,
  showBackButton = true,
  compact = false,
}: ReportPageHeaderProps) {
  const { t } = useTranslation('reports');
  return (
    <ModuleHeader
      icon={icon}
      title={title}
      description={description}
      compact={compact}
      actions={
        <>
          {showBackButton && <ReportBackButton />}
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
