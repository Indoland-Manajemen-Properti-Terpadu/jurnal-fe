import { Button, Divider, Stack, Text } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { notifications } from '@mantine/notifications';

interface SaveAsDraftModalProps {
    opened: boolean;
    onClose: () => void;
    onSave: () => void;
}

const SaveAsDraftModal = ({ opened, onClose, onSave }: SaveAsDraftModalProps) => {
    const handleDelete = () => {
        onSave();
        onClose();
    };

    return (
        <CustomConfirmModal
            opened={opened}
            onClose={onClose}
            withCloseButton={true}
            title={<Text fz={16} fw={600} c={themeColors.black[9]}>Cancel or Save as draft</Text>}
            labels={{
                confirm: (
                    <Button variant="gradient" gradient={gradientColors.mainGR} onClick={handleDelete}>
                        Save as draft
                    </Button>
                ),
                cancel: <Button variant="light" color={themeColors.gray[7]} onClick={onClose}>Cancel</Button>,
            }}
        >
            <Stack gap="md" align="stretch" justify="center">
                <Divider />
                <Text fz={14} fw={400} c={themeColors.gray[7]}>
                    Are you sure you want to cancel or save as draft the closing books?
                </Text>
            </Stack>
        </CustomConfirmModal>
    );
};

export default SaveAsDraftModal;
