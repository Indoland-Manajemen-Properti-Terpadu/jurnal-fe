import type { Icon } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';

interface ReportPageHeaderProps {
  icon: Icon;
  title: string;
  description: string;
}

export function ReportPageHeader({ icon, title, description }: ReportPageHeaderProps) {
  return (
    <ModuleHeader
      icon={icon}
      title={title}
      description={description}
      breadcrumbs={[{ label: 'Laporan', to: routes.resultReport.main }, { label: title }]}
    />
  );
}

