import { ActionIcon, Center, Menu, rem } from '@mantine/core';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';

import { useTranslation } from '@/i18n';

type UserActionProps = {
  onDelete: () => void;
};

const UserAction = ({ onDelete }: UserActionProps) => {
  const { t: tu } = useTranslation('userManagement');
  const navigate = useNavigate();
  const ICON_SIZE = {
    width: rem(14),
    height: rem(14),
  };

  return (
    <Center>
      <Menu>
        <Menu.Target>
          <ActionIcon variant="light" color="gray" aria-label={tu('common.settings')}>
            <IconDots style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconEdit style={ICON_SIZE} />}
            onClick={() => navigate(routes.userManagement.editUser)}
          >
            {tu('common.edit')}
          </Menu.Item>
          <Menu.Item
            leftSection={<IconTrash style={ICON_SIZE} />}
            onClick={onDelete}
            c={themeColors.red[6]}
          >
            {tu('common.delete')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Center>
  );
};

export default UserAction;
