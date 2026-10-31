import {
  Table,
  Checkbox,
  Stack,
  Paper,
  Container,
  Text,
  TextInput,
  Textarea,
  Button,
  Group,
  Switch,
  Center,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gradientColors, themeColors } from '@/theme';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { AddRolePayload } from '@/module/user-management/domain/rolePayload';

import {
  buildRolePayload,
  setMenuPermission,
  supportsPermission,
  toggleChildPermission,
  type MenuPermission,
  type PermissionType,
} from '@/module/user-management/domain/rolePermissions';
import { useRoleMenus } from '@/module/user-management/presentation/hooks/useRoleMenus';
import { useTranslation } from '@/i18n';

const AddRolePage = () => {
  const { t: tu } = useTranslation('userManagement');
  const { menus, initialPermissions } = useRoleMenus();
  const [checkedRoles, setCheckedRoles] = useState<MenuPermission[]>([]);

  useEffect(() => {
    setCheckedRoles(initialPermissions);
  }, [initialPermissions]);

  const form = useForm<AddRolePayload>({
    initialValues: {
      name: '',
      menuAccessRolePermission: [],
    },
  });

  const navigate = useNavigate();
  const [expandedRoles, setExpandedRoles] = useState<{ [key: string]: boolean }>({});

  const handleRowClick = (roleName: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleName]: !prev[roleName],
    }));
  };

  const handleCheckboxChange = (menuId: string, permissionType: PermissionType) => {
    setCheckedRoles((prev) => toggleChildPermission(menus, prev, menuId, permissionType));
  };

  const handleHeadCheckboxChange = (
    menuId: string,
    permissionType: PermissionType,
    statusChecked: boolean
  ) => {
    setCheckedRoles((prev) =>
      setMenuPermission(menus, prev, menuId, permissionType, statusChecked)
    );
  };

  // The role is not sent to the API yet (see the module README); the button keeps its old no-op behavior.
  const handleAddRole = () => {
    buildRolePayload(form.values.name ?? '', checkedRoles);
  };

  return (
    <AppShellLayout
      footer={
        <Group h="100%" px="xl">
          <Group justify="space-between" style={{ flex: 1 }}>
            <Switch
              defaultChecked
              color={themeColors.primary[6]}
              label={tu('common.active')}
              size="lg"
            />
            <Group>
              <Button
                variant="light"
                color={themeColors.gray[7]}
                onClick={() => navigate(routes.userManagement.main)}
              >
                {tu('common.cancel')}
              </Button>
              <Button
                variant="gradient"
                gradient={gradientColors.gradient}
                onClick={() => handleAddRole()}
              >
                {tu('role.add')}
              </Button>
            </Group>
          </Group>
        </Group>
      }
    >
      <Container fluid>
        <Paper shadow="md" p="md" radius="md">
          <Stack gap="md">
            <Text variant="gradient" gradient={gradientColors.mainGR} fw={500} size="lg">
              {tu('role.info')}
            </Text>
            <TextInput
              label={tu('common.roleName')}
              placeholder={tu('role.nameField')}
              withAsterisk
              {...form.getInputProps('name')}
            />
            <Textarea
              label={tu('common.description')}
              placeholder={tu('role.addDescription')}
              maxRows={4}
            />
            <Text variant="gradient" gradient={gradientColors.mainGR} fw={500} size="lg">
              {tu('role.permissions')}
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{tu('role.feature')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>{tu('role.view')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>{tu('role.create')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>{tu('role.modify')}</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>{tu('common.delete')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {menus.map((menu) => (
                  <React.Fragment key={menu.name}>
                    <Table.Tr
                      style={{ backgroundColor: themeColors.primary[0], cursor: 'pointer' }}
                    >
                      <Table.Td
                        onClick={() => {
                          if (menu.menus && menu.menus.length > 0) {
                            handleRowClick(menu.name);
                          }
                        }}
                      >
                        {menu.menus && menu.menus.length > 0 ? (
                          <Group>
                            {expandedRoles[menu.name] ? (
                              <IconChevronDown size={16} />
                            ) : (
                              <IconChevronRight size={16} />
                            )}
                            {menu.name}
                          </Group>
                        ) : (
                          <>
                            <Text pl={30} c={themeColors.black[9]} fz="var(--jurnal-text-sm)">
                              {menu.name}
                            </Text>
                          </>
                        )}
                      </Table.Td>
                      {(['read', 'create', 'update', 'delete'] as PermissionType[]).map(
                        (permissionType) => (
                          <Table.Td key={permissionType}>
                            <Center>
                              <Checkbox
                                disabled={!supportsPermission(menu, permissionType)}
                                checked={
                                  !!checkedRoles.find(
                                    (menuF) =>
                                      menuF.menuId === menu.menuId && menuF[permissionType] === true
                                  )
                                }
                                onChange={(e) => {
                                  menu.menus && menu.menus.length > 0
                                    ? handleHeadCheckboxChange(
                                        menu.menuId,
                                        permissionType,
                                        e.target.checked
                                      )
                                    : handleCheckboxChange(menu.menuId, permissionType);
                                }}
                              />
                            </Center>
                          </Table.Td>
                        )
                      )}
                    </Table.Tr>

                    {expandedRoles[menu.name] &&
                      menu.menus?.map((menu2) => (
                        <Table.Tr key={menu2.menuId}>
                          <Table.Td pl={40}>{menu2.name}</Table.Td>
                          {(['read', 'create', 'update', 'delete'] as PermissionType[]).map(
                            (permissionType) => {
                              const isDisabled = !supportsPermission(menu2, permissionType);
                              const isChecked = checkedRoles.some(
                                (role) =>
                                  role.menuId === menu2.menuId && role[permissionType] === true
                              );
                              return (
                                <Table.Td key={permissionType}>
                                  <Center>
                                    <Checkbox
                                      disabled={isDisabled}
                                      checked={!isDisabled && isChecked}
                                      onChange={() =>
                                        handleCheckboxChange(menu2.menuId, permissionType)
                                      }
                                    />
                                  </Center>
                                </Table.Td>
                              );
                            }
                          )}
                        </Table.Tr>
                      ))}
                  </React.Fragment>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Container>
    </AppShellLayout>
  );
};

export default AddRolePage;
