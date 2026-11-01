import { Fragment } from 'react';
import {
  ActionIcon,
  Box,
  Checkbox,
  Popover,
  Stack,
  Table,
  Text,
  Tooltip,
  VisuallyHidden,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { canGrantRight, type MyGrants } from '@/module/user-management/domain/grantRules';
import {
  PERMISSION_TYPES,
  flattenMenus,
  isGranted,
  setColumnPermission,
  setPermission,
  supportsPermission,
  type MenuPermission,
  type PermissionMenu,
  type PermissionType,
} from '@/module/user-management/domain/rolePermissions';

type Props = {
  menus: PermissionMenu[];
  permissions: MenuPermission[];
  /** What the role granted before this edit; a right already held may stay even above your own. */
  original: MenuPermission[];
  grants: MyGrants;
  readOnly: boolean;
  onChange: (next: MenuPermission[]) => void;
};

export function PermissionMatrix({
  menus,
  permissions,
  original,
  grants,
  readOnly,
  onChange,
}: Readonly<Props>) {
  const { t } = useTranslation('userManagement');

  const blocked = (menuId: string, type: PermissionType) =>
    !canGrantRight(grants, menuId, type) && !isGranted(original, menuId, type);

  const changeable = (menu: PermissionMenu, type: PermissionType) =>
    supportsPermission(menu, type) && !blocked(menu.menuId, type);

  const columnState = (type: PermissionType) => {
    const targets = flattenMenus(menus).filter((menu) => changeable(menu, type));
    const on = targets.filter((menu) => isGranted(permissions, menu.menuId, type)).length;
    return {
      total: targets.length,
      checked: targets.length > 0 && on === targets.length,
      some: on > 0,
    };
  };

  const renderCell = (menu: PermissionMenu, type: PermissionType) => {
    if (!supportsPermission(menu, type)) {
      return (
        <Text span c="dimmed" aria-hidden="true">
          –
        </Text>
      );
    }
    const isBlocked = blocked(menu.menuId, type);
    return (
      <Tooltip label={t('roleForm.blockedCell')} disabled={!isBlocked || readOnly} withArrow>
        <Box component="span" display="inline-block">
          <Checkbox
            checked={isGranted(permissions, menu.menuId, type)}
            disabled={readOnly || isBlocked}
            aria-label={t('roleForm.cellLabel', { menu: menu.name, action: t(`perm.${type}`) })}
            onChange={(event) =>
              onChange(setPermission(permissions, menu.menuId, type, event.currentTarget.checked))
            }
          />
        </Box>
      </Tooltip>
    );
  };

  const renderRow = (menu: PermissionMenu, indent: boolean) => (
    <Table.Tr key={menu.menuId}>
      <Table.Td>
        <Box pl={indent ? 'lg' : 0} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text size="sm" fw={indent ? 400 : 600}>
            {menu.name}
          </Text>
          {(menu.description || menu.actions) && (
            <Popover width={300} position="bottom-start" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label={t('roleForm.menuInfo', { name: menu.name })}
                >
                  <IconInfoCircle size={16} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={6}>
                  {menu.description && <Text size="sm">{menu.description}</Text>}
                  {PERMISSION_TYPES.filter((type) => menu.actions?.[type]).map((type) => (
                    <Text key={type} size="xs" c="dimmed">
                      <Text span fw={600} inherit>
                        {t(`perm.${type}`)}:
                      </Text>{' '}
                      {menu.actions?.[type]}
                    </Text>
                  ))}
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}
        </Box>
      </Table.Td>
      {PERMISSION_TYPES.map((type) => (
        <Table.Td key={type} ta="center">
          {renderCell(menu, type)}
          {!supportsPermission(menu, type) && (
            <VisuallyHidden>{t('roleForm.notSupported')}</VisuallyHidden>
          )}
        </Table.Td>
      ))}
    </Table.Tr>
  );

  return (
    <Table.ScrollContainer minWidth={520}>
      <Table verticalSpacing="xs" highlightOnHover={!readOnly}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th scope="col">{t('roleForm.menu')}</Table.Th>
            {PERMISSION_TYPES.map((type) => {
              const state = columnState(type);
              return (
                <Table.Th key={type} scope="col" ta="center" w={96}>
                  <Stack gap={4} align="center">
                    <Text size="sm" fw={600}>
                      {t(`perm.${type}`)}
                    </Text>
                    {!readOnly && state.total > 0 && (
                      <Checkbox
                        size="xs"
                        checked={state.checked}
                        indeterminate={!state.checked && state.some}
                        aria-label={t(
                          state.checked ? 'roleForm.columnClear' : 'roleForm.columnSelect',
                          {
                            action: t(`perm.${type}`),
                          }
                        )}
                        onChange={() =>
                          onChange(
                            setColumnPermission(
                              menus,
                              permissions,
                              type,
                              !state.checked,
                              (menuId) => !blocked(menuId, type)
                            )
                          )
                        }
                      />
                    )}
                  </Stack>
                </Table.Th>
              );
            })}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {menus.map((menu) => (
            <Fragment key={menu.menuId}>
              {renderRow(menu, false)}
              {menu.menus?.map((sub) => renderRow(sub, true))}
            </Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
