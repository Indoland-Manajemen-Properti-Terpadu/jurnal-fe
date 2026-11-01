import { Accordion, Alert, Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { ROLE_MENU_ID, USER_MENU_ID } from '@/module/user-management/domain/grantRules';
import {
  PERMISSION_TYPES,
  flattenMenus,
  grantedMenus,
  type MenuPermission,
  type PermissionMenu,
} from '@/module/user-management/domain/rolePermissions';
import { pillProps } from './pillProps';

type Props = {
  title?: string;
  menus: PermissionMenu[];
  permissions: MenuPermission[];
  /** The role-form card also explains what the rights mean and warns about sensitive ones. */
  withGuidance?: boolean;
  emptyText?: string;
  subtitle?: string;
};

const SENSITIVE_MENUS = [USER_MENU_ID, ROLE_MENU_ID];

/** Live list of the menus a set of rights opens and what can be done in each. */
export function RoleSummaryCard({
  title,
  menus,
  permissions,
  withGuidance = false,
  emptyText,
  subtitle,
}: Readonly<Props>) {
  const { t } = useTranslation('userManagement');
  const names = new Map(flattenMenus(menus).map((menu) => [menu.menuId, menu.name]));
  const granted = grantedMenus(permissions);
  const sensitive = granted.some(
    (entry) =>
      SENSITIVE_MENUS.includes(entry.menuId) && (entry.create || entry.update || entry.delete)
  );

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <div>
          <Text fw={600} fz={15}>
            {title ?? t('roleForm.summaryTitle')}
          </Text>
          <Text fz={12} c="dimmed">
            {subtitle ?? t('roleForm.summaryCount', { count: granted.length })}
          </Text>
        </div>

        {granted.length === 0 ? (
          <Text size="sm" c="dimmed">
            {emptyText ?? t('roleForm.summaryEmpty')}
          </Text>
        ) : (
          <Stack gap="xs">
            {granted.map((entry) => (
              <div key={entry.menuId}>
                <Text size="sm" fw={500}>
                  {names.get(entry.menuId) ?? entry.menuId}
                </Text>
                <Group gap={4} mt={2}>
                  {PERMISSION_TYPES.filter((type) => entry[type]).map((type) => (
                    <Badge key={type} size="sm" variant="light" color="primary" {...pillProps}>
                      {t(`perm.${type}`)}
                    </Badge>
                  ))}
                </Group>
              </div>
            ))}
          </Stack>
        )}

        {withGuidance && sensitive && (
          <Alert color="yellow" variant="light" icon={<IconAlertTriangle size={18} />}>
            {t('roleForm.summarySensitive')}
          </Alert>
        )}

        {withGuidance && (
          <Accordion variant="default" chevronPosition="left">
            <Accordion.Item value="help">
              <Accordion.Control icon={<IconInfoCircle size={16} />}>
                {t('roleForm.helpTitle')}
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" c="dimmed">
                  {t('roleForm.helpBody')}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Stack>
    </Paper>
  );
}
