import { Checkbox, Group, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import { roleBlockReason, type MyGrants } from '@/module/user-management/domain/grantRules';
import { grantedMenus } from '@/module/user-management/domain/rolePermissions';

type Props = {
  roles: AccessRole[];
  selected: string[];
  /** Roles the user already holds stay choosable even when they are above your own rights. */
  held: string[];
  grants: MyGrants;
  error?: string;
  onChange: (ids: string[]) => void;
};

export function RolePicker({ roles, selected, held, grants, error, onChange }: Readonly<Props>) {
  const { t } = useTranslation('userManagement');

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

  const group = (title: string, items: AccessRole[]) =>
    items.length === 0 ? null : (
      <Stack gap="xs" key={title}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          {title}
        </Text>
        {items.map((role) => {
          const reason = held.includes(role.id) ? null : roleBlockReason(grants, role);
          const count = grantedMenus(role.permissions).length;
          return (
            <Tooltip
              key={role.id}
              label={reason ? t(`userForm.roleBlocked.${reason}`) : ''}
              disabled={!reason}
              withArrow
              multiline
              w={240}
            >
              <Checkbox.Card
                radius="md"
                p="sm"
                checked={selected.includes(role.id)}
                disabled={Boolean(reason)}
                onClick={() => !reason && toggle(role.id)}
                aria-disabled={Boolean(reason)}
              >
                <Group wrap="nowrap" align="flex-start" gap="sm">
                  <Checkbox.Indicator disabled={Boolean(reason)} mt={2} />
                  <div>
                    <Text size="sm" fw={500}>
                      {role.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {role.description.split('\n')[0] || t('roles.noDescription')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('userForm.roleSummary', { count })}
                    </Text>
                  </div>
                </Group>
              </Checkbox.Card>
            </Tooltip>
          );
        })}
      </Stack>
    );

  if (roles.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t('userForm.noRolesAvailable')}
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {group(
        t('userForm.groupCustom'),
        roles.filter((role) => !role.isDefault)
      )}
      {group(
        t('userForm.groupDefault'),
        roles.filter((role) => role.isDefault)
      )}
      {error && (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      )}
    </Stack>
  );
}
