import {
    Stack,
    Paper,
    Anchor,
    Container,
    Input,
    Autocomplete,
    Loader,
    useCombobox,
    Combobox,
    InputBase,
    TextInput,
    Switch,
    Group,
    Tabs,
    Button,
    Space,
    Text
} from '@mantine/core';
import { useRef, useState } from 'react';
import { IconCards, IconChevronDown, IconUsers } from '@tabler/icons-react';
import { PageHeader } from '@/components';
import { navigate } from '@/router';
import { routes } from '@/router/routes';
import { useLocation, useNavigate } from 'react-router-dom';
import { gradientColors, themeColors } from '@/theme';
import UserType from '@/../public/mocks/UserType.json';
import { TextMediumGR } from '@/components/Text/CustomText';
// import { useRoleStore } from '@/store/useRole';

import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';
import EditUserFormLayout from '../components/EditUserForm/Layout';
import { GetUserByEmail } from '../service/User.service';

const items = [
    { title: 'User Management', href: () => navigate(-1) },
    { title: 'Add User', href: undefined },
]

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

function EditUserForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const userEmail = location.state?.email;
    const { data: UserDetail, isLoading, error } = GetUserByEmail(userEmail!);

    const timeoutRef = useRef<number>(-1);
    const [email, setEmail] = useState('');
    const [emailDisplay, setEmailDisplay] = useState<string[]>([]);
    const [userType, setUserType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTabRole, setActiveTabRole] = useState<string>('DefaultRole');


    // * Combobox UserType Handler
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const options = UserType.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    // * Input Email Handler
    const handleChange = (val: string) => {
        window.clearTimeout(timeoutRef.current);
        setEmail(val);
        setEmailDisplay([]);
        if (val.trim().length === 0 || val.includes('@')) {
            setLoading(false);
        } else {
            setLoading(true);
            timeoutRef.current = window.setTimeout(() => {
                setLoading(false);
                setEmailDisplay(
                    ['gmail.com', 'outlook.com', 'yahoo.com'].map((provider) => `${val}@${provider}`)
                );
            }, 1000);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }



    return (
        <EditUserFormLayout
            footer={
                <Group h="100%" px="md" >
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Switch
                            defaultChecked
                            color={themeColors.primary[6]}
                            label="Active"
                            size="lg"
                        />
                        <Group >
                            <Button
                                variant="light"
                                color={themeColors.gray[7]}
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="gradient"
                                gradient={gradientColors.gradient}
                                onClick={() => navigate(routes.userManagement.main)}
                            >
                                Finish
                            </Button>
                        </Group>
                    </Group>
                </Group>
            }
        >
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <PageHeaderV2 type='withBreadcrumbs' title="Edit User" breadcrumbItems={items} />
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Stack align="stretch" justify="flex-start" gap="sm">
                            <TextInput
                                label='Name'
                                withAsterisk
                            />
                            <Text>{UserDetail?.name} </Text>

                            <Autocomplete
                                value={email}
                                data={emailDisplay}
                                withAsterisk
                                onChange={handleChange}
                                rightSection={loading ? <Loader size="1rem" /> : null}
                                label="Email"
                                placeholder="Your email"
                            />
                            <Combobox
                                store={combobox}
                                onOptionSubmit={(val) => {
                                    setUserType(val);
                                    combobox.closeDropdown();
                                }}
                            >
                                <Combobox.Target>
                                    <InputBase
                                        component="button"
                                        type="button"
                                        withAsterisk
                                        pointer
                                        label="Type User"
                                        rightSection={<IconChevronDown size={14} />}
                                        rightSectionPointerEvents="none"
                                        onClick={() => combobox.toggleDropdown()}
                                    >
                                        {userType ?? <Input.Placeholder>Chose type user</Input.Placeholder>}
                                    </InputBase>
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>{options}</Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                            <TextMediumGR>Role Access </TextMediumGR>
                            <Tabs
                                variant="outline"
                                value={activeTabRole}
                                onChange={(value) => setActiveTabRole(value!)}
                                color={themeColors.primary[6]}
                                styles={{ tabLabel: { color: themeColors.primary[6] } }}
                            >
                                <Tabs.List>
                                    <Tabs.Tab value="DefaultRole" leftSection={<IconUsers size={14} />}>
                                        Default Role
                                    </Tabs.Tab>
                                    <Tabs.Tab value="AdditionalRole" leftSection={<IconCards size={14} />}>
                                        Additional Role
                                    </Tabs.Tab>
                                </Tabs.List>
                                <Tabs.Panel value="DefaultRole">
                                    <Space h='xs' />
                                    {/* <AcordionRoleAccess roles={defaultRoles} /> */}
                                </Tabs.Panel>
                                <Tabs.Panel value='AdditionalRole'>
                                    <Space h='xs' />
                                    {/* <AcordionRoleAccess roles={additionalRoles} /> */}
                                </Tabs.Panel>
                            </Tabs>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </EditUserFormLayout >
    );
}

export default EditUserForm;