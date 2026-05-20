import { Button, Group, Stack, Text, Modal, Image } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { themeText } from '@/theme/constants';
import DeleteIllustration from '@/assets/img/vectors/delete_modal.svg';

interface DeleteTransactionModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteTransactionModal = ({ opened, onClose, onDelete }: DeleteTransactionModalProps) => {
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
          Hapus Jurnal Transaksi
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
        <Image
          src={DeleteIllustration}
          alt="Delete Illustration"
          w={240}
        />

        <Stack gap={4} align="center">
          <Text
            style={{ ...themeText.label.label1, maxWidth: '280px' }}
            fw={600}
            ta="center"
            c={themeColors.black[9]}
          >
            Apakah Anda yakin ingin menghapus data jurnal transaksi ini?
          </Text>
          <Text
            style={themeText.body.body4}
            c={themeColors.gray[5]}
            ta="center"
          >
            Data yang dihapus tidak dapat dipulihkan kembali.
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
            Batal
          </Button>
          <Button
            variant="filled"
            color={themeColors.red[6]}
            onClick={handleDelete}
            h={44}
            radius="sm"
            leftSection={<IconTrash size={18} />}
          >
            Hapus
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DeleteTransactionModal;
