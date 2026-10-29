import { Button, Divider, Stack, Text } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { useTranslation } from '@/i18n';

interface SaveAsDraftModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SaveAsDraftModal = ({ opened, onClose, onSave }: SaveAsDraftModalProps) => {
  const { t } = useTranslation('periodClosing');
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <CustomConfirmModal
      opened={opened}
      onClose={onClose}
      withCloseButton={true}
      title={
        <Text fz={16} fw={600} c={themeColors.black[9]}>
          {t('saveDraft.title')}
        </Text>
      }
      labels={{
        confirm: (
          <Button variant="gradient" gradient={gradientColors.mainGR} onClick={handleSave}>
            {t('saveDraft.save')}
          </Button>
        ),
        cancel: (
          <Button variant="light" color={themeColors.gray[7]} onClick={onClose}>
            {t('common.cancel')}
          </Button>
        ),
      }}
    >
      <Stack gap="md" align="stretch" justify="center">
        <Divider />
        <Text fz={14} fw={400} c={themeColors.gray[7]}>
          {t('saveDraft.question')}
        </Text>
      </Stack>
    </CustomConfirmModal>
  );
};

export default SaveAsDraftModal;
