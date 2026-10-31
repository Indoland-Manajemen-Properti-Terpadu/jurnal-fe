import { useState } from 'react';
import { Stack, Tabs } from '@mantine/core';
import { IconCards, IconUsers } from '@tabler/icons-react';
import AdditionalRoleTable from '@/module/user-management/presentation/components/roles/AdditionalRole';
import classes from '@/module/user-management/presentation/components/roles/ListRole.module.css';
import DefaultRoleTable from '@/module/user-management/presentation/components/roles/DefaultRole';

import { useTranslation } from '@/i18n';

const ListRole = () => {
  const { t: tu } = useTranslation('userManagement');
  const [activeTabRole, setActiveTabRole] = useState<string>('DefaultRole');

  return (
    <Stack align="stretch" justify="flex - start" gap="md" mt="md">
      <Tabs
        value={activeTabRole}
        onChange={(value) => setActiveTabRole(value!)}
        variant="outline"
        classNames={classes}
      >
        <Tabs.List>
          <Tabs.Tab value="DefaultRole" leftSection={<IconUsers size={14} />}>
            {tu('common.defaultRole')}
          </Tabs.Tab>
          <Tabs.Tab value="AdditionalRole" leftSection={<IconCards size={14} />}>
            {tu('common.additionalRole')}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="DefaultRole">
          <DefaultRoleTable />
        </Tabs.Panel>
        <Tabs.Panel value="AdditionalRole">
          <AdditionalRoleTable />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default ListRole;
