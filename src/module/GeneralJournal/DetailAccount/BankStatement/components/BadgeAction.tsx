// components/BankStatement/BadgeAction.tsx
import { ActionIcon } from '@mantine/core';
import { IconPuzzle, IconPuzzleOff } from '@tabler/icons-react';
import { themeColors } from '@/theme';

interface BadgeActionProps {
    status: string;
}

const BadgeAction = ({ status }: BadgeActionProps) => {
    switch (status) {
        case 'Reconciled':
            return (
                <ActionIcon variant="light" color={themeColors.gray[6]}>
                    <IconPuzzleOff size={16} />
                </ActionIcon>
            );
        case 'Inreconciled':
            return (
                <ActionIcon variant="light" color={themeColors.gray[6]}>
                    <IconPuzzle size={16} />
                </ActionIcon>
            );
        default:
            return (
                <ActionIcon variant="light" color={themeColors.red[6]}>
                    <IconPuzzleOff size={16} />
                </ActionIcon>
            );
    }
};

export default BadgeAction;
