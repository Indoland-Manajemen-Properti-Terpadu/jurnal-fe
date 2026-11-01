import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { pillProps } from './pillProps';

export function StatusBadge({ active }: Readonly<{ active: boolean }>) {
  const { t } = useTranslation('userManagement');
  return (
    <Badge variant="light" color={active ? 'green' : 'gray'} {...pillProps}>
      {active ? t('common.active') : t('common.inactive')}
    </Badge>
  );
}
