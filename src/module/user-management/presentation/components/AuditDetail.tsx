import { Badge, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  changedFields,
  changedPermissions,
  type AuditEntry,
  type AuditSnapshot,
} from '@/module/user-management/domain/auditLog';
import { permissionsFromLetters } from '@/module/user-management/domain/rolePermissions';
import { pillProps } from './pillProps';

const KNOWN_FIELDS = ['name', 'email', 'description', 'isActive', 'accessRole'] as const;

type Lookups = {
  menuName: (menuId: string) => string;
  roleName: (roleId: string) => string;
};

const RightChips = ({ rights }: Readonly<{ rights: string[] }>) => {
  const { t } = useTranslation('userManagement');
  if (rights.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        {t('history.rightsNone')}
      </Text>
    );
  }
  return (
    <Group gap={4}>
      {rights.map((right) => (
        <Badge key={right} size="sm" variant="light" color="primary" {...pillProps}>
          {t(`perm.${right}`)}
        </Badge>
      ))}
    </Group>
  );
};

export function AuditDetail({
  entry,
  lookups,
}: Readonly<{ entry: Pick<AuditEntry, 'before' | 'after'>; lookups: Lookups }>) {
  const { t } = useTranslation('userManagement');

  const show = (field: string, value: unknown): string => {
    if (value === undefined || value === null || value === '') return t('history.empty_value');
    if (field === 'isActive') return value ? t('history.yes') : t('history.no');
    if (field === 'accessRole' && Array.isArray(value)) {
      return value.map((id) => lookups.roleName(String(id))).join(', ') || t('history.empty_value');
    }
    return String(value);
  };

  const fields = changedFields(entry.before, entry.after).filter((change) =>
    (KNOWN_FIELDS as readonly string[]).includes(change.field)
  );
  const passwordReset = Boolean((entry.after as AuditSnapshot | undefined)?.passwordChanged);
  const permissions = changedPermissions(entry.before, entry.after);
  // A role that was just created has no earlier snapshot, so list what it was given.
  const created = !entry.before
    ? (entry.after as AuditSnapshot | undefined)?.permissions
    : undefined;
  const givenAtCreation =
    created && typeof created === 'object'
      ? Object.entries(created as Record<string, string>).map(([menuId, letters]) => ({
          menuId,
          before: [] as string[],
          after: permissionsFromLetters(letters) as string[],
        }))
      : [];
  const rightRows = permissions.length > 0 ? permissions : givenAtCreation;

  if (fields.length === 0 && rightRows.length === 0 && !passwordReset) {
    return (
      <Text size="sm" c="dimmed">
        {t('history.noDetail')}
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {fields.map((change) => (
        <Group key={change.field} gap="md" align="flex-start" wrap="wrap">
          <Text size="sm" fw={600} w={110}>
            {t(`history.field.${change.field}`)}
          </Text>
          {entry.before && (
            <Text size="sm" c="dimmed" td="line-through">
              {show(change.field, change.before)}
            </Text>
          )}
          <Text size="sm">{show(change.field, change.after)}</Text>
        </Group>
      ))}

      {passwordReset && (
        <Group gap="md" align="flex-start" wrap="wrap">
          <Text size="sm" fw={600} w={110}>
            {t('history.field.password')}
          </Text>
          <Text size="sm">{t('history.passwordReset')}</Text>
        </Group>
      )}

      {rightRows.length > 0 && (
        <Stack gap={6}>
          <Text size="sm" fw={600}>
            {t('history.rightsTitle')}
          </Text>
          {rightRows.map((row) => (
            <Group key={row.menuId} gap="md" align="center" wrap="wrap">
              <Text size="sm" w={160}>
                {lookups.menuName(row.menuId)}
              </Text>
              {entry.before && row.before.length > 0 && <RightChips rights={row.before} />}
              {entry.before && row.before.length > 0 && <Text size="sm">→</Text>}
              <RightChips rights={row.after} />
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
