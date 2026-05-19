import { Button, Divider, Stack, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { notifications } from '@mantine/notifications';

interface DeleteAdditionalRoleModalProps {
    opened: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const DeleteAdditionalRoleModal = ({ opened, onClose, onDelete }: DeleteAdditionalRoleModalProps) => {
    const handleDelete = () => {
        onDelete();
        onClose();
    };

    return (
        <CustomConfirmModal
            opened={opened}
            onClose={onClose}
            withCloseButton={true}
            title={<Text fz={16} fw={600} c={themeColors.black[9]}>Delete Additional Role</Text>}
            labels={{
                confirm: (
                    <Button variant="filled" color={themeColors.red[6]} onClick={handleDelete}>
                        Delete
                    </Button>
                ),
                cancel: <Button variant="light" color={themeColors.gray[7]} onClick={onClose}>Cancel</Button>,
            }}
        >
            <Stack gap="md" align="stretch" justify="center">
                <Divider />
                <Text fz={14} fw={400} c={themeColors.gray[7]}>
                    Are you sure you want to delete this additional role?
                </Text>
            </Stack>
        </CustomConfirmModal>
    );
};

export default DeleteAdditionalRoleModal;
