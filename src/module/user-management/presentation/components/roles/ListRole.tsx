import { useState } from 'react';
import { Stack, Tabs } from '@mantine/core';
import { IconCards, IconUsers } from '@tabler/icons-react';
import AdditionalRoleTable from '@/module/user-management/presentation/components/roles/AdditionalRole';
import classes from '@/module/user-management/presentation/components/roles/ListRole.module.css';
import DefaultRoleTable from '@/module/user-management/presentation/components/roles/DefaultRole';


const ListRole = () => {
    const [activeTabRole, setActiveTabRole] = useState<string>('DefaultRole');


    return (
        <Stack align="stretch" justify="flex - start" gap="md" mt="md">
            {/* <Grid  >
                <Grid.Col span={4}>
                    <Autocomplete
                        rightSection={<IconSearch size={12} />}
                        placeholder="Find Role"
                        data={filteredRoles.length > 0 ? filteredRoles : roles.map((role) => role.name)}
                        onSearchChange={handleFilterRoles}
                    />
                </Grid.Col>
            </Grid > */}
            <Tabs
                value={activeTabRole}
                onChange={(value) => setActiveTabRole(value!)}
                variant="outline"
                classNames={classes}
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
                    <DefaultRoleTable />
                </Tabs.Panel>
                <Tabs.Panel value="AdditionalRole" >
                    <AdditionalRoleTable />
                </Tabs.Panel>
            </Tabs>
        </Stack >
    );
};

export default ListRole;
