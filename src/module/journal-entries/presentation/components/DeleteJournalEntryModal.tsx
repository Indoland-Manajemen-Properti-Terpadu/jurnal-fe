import { Button, Group, Stack, Text, Modal, Image } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { headingStyles, textStyles, themeColors } from '@/theme';
import DeleteIllustration from '@/assets/images/illustrations/delete-confirm.svg';

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
        <Text style={headingStyles.h6} c={themeColors.black[9]}>
          {t('deleteModal.title')}
        </Text>
      }
      padding="lg"
      radius="lg"
      styles={{
        header: {
          backgroundColor: 'var(--mantine-color-gray-0)',
          padding: '16px 20px',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
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
            style={{ ...textStyles.labelLg, maxWidth: '280px' }}
            fw={600}
            ta="center"
            c={themeColors.black[9]}
          >
            {t('deleteModal.question')}
          </Text>
          <Text style={textStyles.bodyXs} c={themeColors.gray[5]} ta="center">
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
                backgroundColor: 'var(--mantine-color-gray-1)',
                color: 'var(--mantine-color-gray-9)',
                '&:hover': {
                  backgroundColor: 'var(--mantine-color-gray-2)',
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
