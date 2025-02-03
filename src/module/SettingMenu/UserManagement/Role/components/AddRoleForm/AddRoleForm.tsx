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
import classes from './AddRoleForm.module.css';
import AddRoleFormLayout from './Layout';
import { routes } from '@/router';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import apiClient from '@/services/apiClient';
import { useAddRole } from '../../Service/AddRole.service';
import { AddRolePayload } from '../../Types/AddRolePayload';

type PermissionType = 'read' | 'create' | 'update' | 'delete';
type CheckedRoles = Record<string, Record<string, Record<PermissionType, boolean>>>;
interface Menu {
    menus: [];
    menuId: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

const AddRoleForm = () => {
    const [menus, setMenus] = useState<any[]>([])
    const [menusAccessRole, setMenusAccessRole] = useState<any[]>([])
    const [checkedRoles, setCheckedRoles] = useState<Menu[]>([]);

    useEffect(() => {
        apiClient.get('/v1/menus').then((resp) => {
            if (resp.data.length > 0) {
                setMenus(() => resp.data);
                console.log(resp.data)
                setCheckedRoles(() => {
                    return resp.data.flatMap((menu: any) => {
                        // Main menu entry
                        const mainMenu = {
                            menuId: menu.menuId,
                            create: false,
                            read: false,
                            update: false,
                            delete: false,
                        };

                        // Submenus if they exist
                        const subMenus = (menu.menus || []).map((subMenu: any) => ({
                            menuId: subMenu.menuId,
                            create: false,
                            read: false,
                            update: false,
                            delete: false,
                        }));

                        // Combine main menu and submenus
                        return [mainMenu, ...subMenus];
                    });
                })

                apiClient.get('/v1/access-role/66a789a72130a2814424b25c').then((resp2) => {

                    if (!!resp2?.data?.menuAccessRolePermission) {
                        setMenusAccessRole(resp2.data.menuAccessRolePermission);
                    }
                })
            }
        })
    }, [])

    const { mutate: addRole } = useAddRole()

    const form = useForm<AddRolePayload>({
        initialValues: {
            name: '',
            menuAccessRolePermission: []
        }
    })

    const navigate = useNavigate();
    const [expandedRoles, setExpandedRoles] = useState<{ [key: string]: boolean }>({});

    const handleRowClick = (roleName: string) => {
        setExpandedRoles((prev) => ({
            ...prev,
            [roleName]: !prev[roleName],
        }));
    };

    const handleCheckboxChange = (menuId: string, permissionType: PermissionType) => {
        console.log(menuId, permissionType)
        const menuF = menus.find((menu) => menu.menus?.some((subMenu: any) => subMenu.menuId === menuId))

        const updatedCheckedRoles = checkedRoles.map((menu: Menu) =>
            menu.menuId === menuId
                ? { ...menu, [permissionType]: !menu[permissionType] }
                : menu
        )

        if (menuF) {
            menuF.menus?.forEach((subMenu: any) => {
                const childRole = updatedCheckedRoles.find((cRole: any) => cRole.menuId === subMenu.menuId);
                if (childRole && childRole[permissionType] === false) {
                    updatedCheckedRoles.forEach((menu: any) => {
                        if (menu.menuId === menuF.menuId) {
                            menu[permissionType] = false; // Set the parent checkbox to unchecked
                        }
                    });
                }
            });

            const allChildrenUnchecked = menuF.menus?.every((subMenu: any) => {
                const childRole = updatedCheckedRoles.find((cRole: any) => cRole.menuId === subMenu.menuId);
                return childRole?.[permissionType] === false; // Check if all children are unchecked
            });

            if (!allChildrenUnchecked) {
                // If at least one child is checked, set the master checkbox to checked
                updatedCheckedRoles.forEach((menu: any) => {
                    if (menu.menuId === menuF.menuId) {
                        menu[permissionType] = true;
                    }
                });
            }
        }

        setCheckedRoles(updatedCheckedRoles);

    };

    const handleHeadCheckboxChange = (menuId: string, permissionType: PermissionType, statusChecked: boolean) => {
        setCheckedRoles((prevRoles) => {
            // Find the menu that corresponds to the clicked checkbox
            const parentMenu = menus.find((menu) => menu.menuId === menuId);

            if (parentMenu && parentMenu.menus) {
                // If the parent menu has children (menus), update the child menus as well
                const updatedRoles = prevRoles.map((menu) => {
                    if (menu.menuId === menuId) {
                        // Update the parent menu permission
                        return { ...menu, [permissionType]: statusChecked };
                    }

                    // If this menu is a child of the parent menu, update its permission
                    if (parentMenu.menus.some((subMenu: any) => subMenu.menuId === menu.menuId && subMenu.enabled.includes(permissionType.substring(0, 1)))) {
                        return { ...menu, [permissionType]: statusChecked };
                    }

                    return menu;
                });

                return updatedRoles;
            }

            // If the clicked menu has no children, just update that menu
            return prevRoles.map((menu) =>
                menu.menuId === menuId
                    ? { ...menu, [permissionType]: statusChecked }
                    : menu
            );
        });
    };

    const handleAddRole = () => {
        const { name } = form.values;

        const payload: AddRolePayload = {
            name,
            menuAccessRolePermission: checkedRoles
        }
        console.log(menus)
        console.log(payload)
        // addRole(payload)
    }

    return (
        <AddRoleFormLayout
            footer={
                <Group h="100%" px="xl" >
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Switch
                            defaultChecked
                            color={themeColors.primary[6]}
                            label="Active"
                            size="lg"
                        />
                        <Group>
                            <Button
                                variant='light'
                                color={themeColors.grey[7]}
                                onClick={() => navigate(routes.userManagement.main)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant='gradient'
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
                        <Textarea
                            label="Description"
                            placeholder="Add description"
                            maxRows={4}
                        />
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
                                    return <React.Fragment key={menu.name}>
                                        <Table.Tr style={{ backgroundColor: themeColors.primary[0], cursor: 'pointer' }}>
                                            <Table.Td onClick={() => {
                                                if (menu.menus && menu.menus.length > 0) {
                                                    handleRowClick(menu.name);
                                                }
                                            }}>
                                                {
                                                    menu.menus && menu.menus.length > 0 ? (
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
                                                            <Text pl={30} c={themeColors.defaultBlack[10]} fz={14}>
                                                                {menu.name}
                                                            </Text>
                                                        </>
                                                    )
                                                }
                                            </Table.Td>
                                            {(['read', 'create', 'update', 'delete'] as PermissionType[]).map((permissionType) => (
                                                <Table.Td key={permissionType}>
                                                    <Center>
                                                        <Checkbox
                                                            disabled={!menu.enabled.includes(permissionType.substring(0, 1))}
                                                            checked={
                                                                !!checkedRoles.find(
                                                                    (menuF: any) =>
                                                                        menuF.menuId === menu.menuId && menuF[permissionType] === true
                                                                )
                                                            }
                                                            onChange={(e) => {
                                                                menu.menus && menu.menus.length > 0 ?
                                                                    handleHeadCheckboxChange(
                                                                        menu.menuId,
                                                                        permissionType,
                                                                        e.target.checked
                                                                    ) :
                                                                    handleCheckboxChange(
                                                                        menu.menuId,
                                                                        permissionType
                                                                    )
                                                            }}
                                                        />
                                                    </Center>
                                                </Table.Td>
                                            ))}
                                        </Table.Tr>

                                        {expandedRoles[menu.name] &&
                                            menu.menus.map((menu2: any, index: number) => (
                                                <Table.Tr key={`${menu2.menuId}-${menu2}-${index}`}>
                                                    <Table.Td pl={40}>{menu2.name}</Table.Td>
                                                    {(['read', 'create', 'update', 'delete'] as PermissionType[]).map((permissionType) => {
                                                        const isDisabled = !menu2.enabled.includes(permissionType.substring(0, 1));
                                                        const isChecked = checkedRoles.some(
                                                            (role: any) => role.menuId === menu2.menuId && role[permissionType] === true
                                                        );
                                                        return (
                                                            <Table.Td key={permissionType}>
                                                                <Center>
                                                                    <Checkbox
                                                                        disabled={isDisabled}
                                                                        checked={!isDisabled && isChecked}
                                                                        onChange={() => handleCheckboxChange(menu2.menuId, permissionType)}
                                                                    />
                                                                </Center>
                                                            </Table.Td>
                                                        );
                                                    })}
                                                </Table.Tr>
                                            ))}
                                    </React.Fragment>
                                })}

                            </Table.Tbody>
                        </Table>
                    </Stack>
                </Paper>
            </Container>
        </AddRoleFormLayout>
    );
};

export default AddRoleForm;