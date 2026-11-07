import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { AccessLevel } from '@/module/user-management/domain/userDirectory';
import { pillProps } from './pillProps';

const COLOR: Record<AccessLevel, string> = {
  full: 'primary',
  limited: 'cyan',
  readOnly: 'gray',
  none: 'gray',
};

/** One word for how much a person can do; the exact rights are in their roles. */
export function AccessLevelBadge({ level }: Readonly<{ level: AccessLevel }>) {
  const { t } = useTranslation('userManagement');
  return (
    <Badge variant={level === 'none' ? 'outline' : 'light'} color={COLOR[level]} {...pillProps}>
      {t(`users.access.${level}`)}
    </Badge>
  );
}
