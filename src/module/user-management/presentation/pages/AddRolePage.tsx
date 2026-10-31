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
  Box,
  Center,
  Accordion,
  Flex,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserRole from '@/../public/mocks/Role.json';
import { gradientColors, themeColors } from '@/theme';
import classes from '@/module/user-management/presentation/pages/AddRolePage.module.css';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import apiClient from '@/lib/http/apiClient';
import { useAddRole } from '@/module/user-management/infrastructure/AddRole.service';
import { AddRolePayload } from '@/module/user-management/domain/rolePayload';

import {
  buildRolePayload,
  createInitialPermissions,
  setMenuPermission,
  supportsPermission,
  toggleChildPermission,
  type MenuPermission,
  type PermissionType,
} from '@/module/user-management/domain/rolePermissions';
const AddRolePage = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [menusAccessRole, setMenusAccessRole] = useState<any[]>([]);
  const [checkedRoles, setCheckedRoles] = useState<MenuPermission[]>([]);

  useEffect(() => {
    apiClient.get('/v1/menus').then((resp) => {
      if (resp.data.length > 0) {
        setMenus(() => resp.data);
        setCheckedRoles(createInitialPermissions(resp.data));

        apiClient.get('/v1/access-role/66a789a72130a2814424b25c').then((resp2) => {
          if (!!resp2?.data?.menuAccessRolePermission) {
            setMenusAccessRole(resp2.data.menuAccessRolePermission);
          }
        });
      }
    });
  }, []);

  const { mutate: addRole } = useAddRole();

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
            <Switch defaultChecked color={themeColors.primary[6]} label="Active" size="lg" />
            <Group>
              <Button
                variant="light"
                color={themeColors.gray[7]}
                onClick={() => navigate(routes.userManagement.main)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                gradient={gradientColors.gradient}
                onClick={() => handleAddRole()}
              >
                Add Role
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
              Role Information
            </Text>
            <TextInput
              label="Role Name"
              placeholder="Role name"
              withAsterisk
              {...form.getInputProps('name')}
            />
            <Textarea label="Description" placeholder="Add description" maxRows={4} />
            <Text variant="gradient" gradient={gradientColors.mainGR} fw={500} size="lg">
              Role Permissions
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Feature</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>View</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Create</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Modify</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Delete</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {menus.map((menu) => {
                  return (
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
                              <Text pl={30} c={themeColors.black[9]} fz={14}>
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
                                      (menuF: any) =>
                                        menuF.menuId === menu.menuId &&
                                        menuF[permissionType] === true
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
                        menu.menus.map((menu2: any, index: number) => (
                          <Table.Tr key={`${menu2.menuId}-${menu2}-${index}`}>
                            <Table.Td pl={40}>{menu2.name}</Table.Td>
                            {(['read', 'create', 'update', 'delete'] as PermissionType[]).map(
                              (permissionType) => {
                                const isDisabled = !menu2.enabled.includes(
                                  permissionType.substring(0, 1)
                                );
                                const isChecked = checkedRoles.some(
                                  (role: any) =>
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
                  );
                })}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Container>
    </AppShellLayout>
  );
};

export default AddRolePage;
