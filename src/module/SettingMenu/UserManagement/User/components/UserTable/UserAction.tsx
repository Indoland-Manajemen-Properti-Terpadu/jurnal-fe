import { ActionIcon, Tooltip, Group, Center, Menu, rem } from '@mantine/core';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router';
import { themeColors } from '@/theme';

type UserActionProps = {
    onDelete: () => void;
};

const UserAction = ({ onDelete }: UserActionProps) => {
    const navigate = useNavigate();
    const ICON_SIZE = {
        width: rem(14),
        height: rem(14)
    }

    return (
        <Center>
            <Menu>
                <Menu.Target>
                    <ActionIcon variant="light" color="gray" aria-label="Settings">
                        <IconDots style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<IconEdit style={ICON_SIZE} />}
                        onClick={() => navigate(routes.userManagement.editUser)}
                    >
                        Edit
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<IconTrash style={ICON_SIZE} />}
                        onClick={onDelete}
                        c={themeColors.red[6]}
                    >
                        Delete
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Center>
    );
};

export default UserAction;
