import { Button, Group, Stack, Text, Modal, Image } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import { themeText } from '@/theme/constants';
import DeleteIllustration from '@/assets/img/vectors/delete_modal.svg';

interface DeleteJournalEntryModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteJournalEntryModal = ({ opened, onClose, onDelete }: DeleteJournalEntryModalProps) => {
  const { t } = useTranslation('journalEntries');
  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton
      title={
        <Text style={themeText.heading.h6} c={themeColors.black[9]}>
          {t('deleteModal.title')}
        </Text>
      }
      padding="lg"
      radius="lg"
      styles={{
        header: {
          backgroundColor: '#F9FAFB',
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
        },
        body: {
          paddingTop: '24px',
        },
      }}
    >
      <Stack align="center" gap="lg">
        <Image src={DeleteIllustration} alt={t('deleteModal.imageAlt')} w={240} />

        <Stack gap={4} align="center">
          <Text
            style={{ ...themeText.label.label1, maxWidth: '280px' }}
            fw={600}
            ta="center"
            c={themeColors.black[9]}
          >
            {t('deleteModal.question')}
          </Text>
          <Text style={themeText.body.body4} c={themeColors.gray[5]} ta="center">
            {t('deleteModal.warning')}
          </Text>
        </Stack>

        <Group grow w="100%" gap="md" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            h={44}
            radius="sm"
            styles={{
              root: {
                backgroundColor: '#F3F4F6',
                color: '#111827',
                '&:hover': {
                  backgroundColor: '#E5E7EB',
                },
              },
            }}
          >
            {t('deleteModal.cancel')}
          </Button>
          <Button
            variant="filled"
            color={themeColors.red[6]}
            onClick={handleDelete}
            h={44}
            radius="sm"
            leftSection={<IconTrash size={18} />}
          >
            {t('deleteModal.confirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DeleteJournalEntryModal;
