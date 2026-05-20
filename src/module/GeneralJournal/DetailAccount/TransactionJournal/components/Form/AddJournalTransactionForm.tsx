/* eslint-disable linebreak-style */
import {
  Container,
  Group,
  Paper,
  Stack,
  TextInput,
  Box,
  Textarea,
  Button,
  ActionIcon,
  Text,
  Badge,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconCalendar, IconArrowLeft, IconPlus, IconTag } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { themeColors } from '@/theme';
import { themeText } from '@/theme/constants';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';
import TransactionForm from './TransactionForm';
import TotalAmount from '../Amounts';
import { TagInput } from './TagInput';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import TransactionJournalFormLayout from '../../pages/Layout';
import { useSubmitTransactionJournal } from '../../services/CreateTransactionAccount.service';
import { TransactionJournalPayload } from '@/module/GeneralJournal/DetailAccount/TransactionJournal/types/AddTransactionPayload';
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';

const AddJournalTransactionForm = () => {
  const navigate = useNavigate();
  const { addTransaction, notes, setNotes, transactions } = useTransactionStore();
  const disableTransaction = useTransactionStore((state) => state.disableTransaction());
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [tags, setTags] = useState<string[]>([]);
  const { mutate } = useSubmitTransactionJournal();

  const [files, setFiles, clearFiles] = useFileStore((state) => [
    state.files,
    state.setFiles,
    state.clearFiles,
  ]);
  const handleDrop = (f: File[]) => {
    setFiles(f);
  };

  const handleReject = () => {
    notifications.show({
      color: 'red',
      title: 'Unsupported Files',
      message: 'Sorry, your file is not supported, please try again with supported files',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formattedDate = dayjs(transactionDate).format('YYYY-MM-DD');
    const payload: TransactionJournalPayload = {
      transactionNumber: parseInt(transactionNumber, 10),
      transactionDate: formattedDate,
      transactionDetail: transactions.map((detail) => ({
        ...detail,
        debit: detail.debit || 0,
        credit: detail.credit || 0,
      })),
      notes,
      attachments: files,
      tags,
    };

    mutate(payload);
  };

  useEffect(
    () => () => {
      clearFiles();
    },
    []
  );

  return (
    <TransactionJournalFormLayout
      footer={
        <Group h="100%" px="xl" justify="flex-end">
          <Button
            variant="filled"
            bg={themeColors.gray[0]}
            c={themeColors.black[9]}
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            c={themeColors.white[0]}
            bg={themeColors.teal[5]}
            onClick={handleSubmit}
            disabled={disableTransaction}
            leftSection={<IconPlus size={16} />}
          >
            Tambah
          </Button>
        </Group>
      }
    >
      <Container fluid >
        <Stack gap="lg">
          {/* Header Section */}
          <Paper withBorder p="lg" radius="sm">
            <Group align="flex-start" wrap="nowrap">
              <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)} mt={5}>
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Stack gap={4}>
                <Text fw={700} fz={18} c={themeColors.black[9]}>Tambah Transaksi</Text>
                <Text style={themeText.label.label3} c={themeColors.slate[5]}>Catat transaksi jurnal baru ke dalam daftar akun yang tersedia.</Text>
              </Stack>
            </Group>

            <Group grow mt="xl" align="flex-start">
              <Stack gap={4}>
                <TextInput
                  label='Nomor Transaksi'
                  placeholder="20"
                  onChange={(e) => setTransactionNumber(e.target.value)}
                  value={transactionNumber}
                  styles={{ input: { height: 42 } }}
                />
                <Text style={themeText.label.label3} c={themeColors.slate[5]}>Biarkan kosong untuk generate nomor otomatis, atau isi manual sesuai kebutuhan.</Text>
              </Stack>
              <Stack gap={4}>
                <DatePickerInput
                  withAsterisk
                  label='Tanggal Transaksi'
                  value={dayjs(transactionDate).toDate()}
                  onChange={(date) => setTransactionDate(dayjs(date).format('YYYY-MM-DD'))}
                  maxDate={new Date()}
                  placeholder="28/05/2026"
                  rightSection={<IconCalendar size={18} color={themeColors.gray[5]} />}
                  styles={{ input: { height: 42 } }}
                />
              </Stack>
            </Group>
          </Paper>

          {/* Journal Lines Section */}
          <Paper withBorder p="lg" radius="sm">
            <Stack gap="md">
              <Group grow align="flex-start">
                <Stack gap={0}>
                  <Text fw={700} fz={16} c={themeColors.black[9]}>Baris Jurnal</Text>
                  <Text fz="xs" c={themeColors.gray[6]}>Tambah baris untuk setiap akun yang terlibat. Debit & kredit harus seimbang.</Text>
                </Stack>
                <TagInput value={tags} onChange={setTags} />
              </Group>

              <Box>
                <TransactionForm />
              </Box>

              <Stack gap="xs" mt="md">
                <CustomDropzone
                  title='Lampiran'
                  onDrop={handleDrop}
                  onReject={handleReject}
                  accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                  description={
                    <Stack align="center" gap={4}>
                      <Text fz="xs" fw={600} c={themeColors.black[9]}>Seret file ke sini atau klik untuk memilih file</Text>
                      <Text fz="10px" c={themeColors.gray[5]}>Anda dapat mengunggah beberapa file sekaligus, dengan ukuran maksimal 30 MB per file.</Text>
                    </Stack>
                  }
                />
              </Stack>

              <Textarea
                label='Memo'
                placeholder="pembayaran invoice bulanan unit A0101"
                minRows={3}
                mt="md"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                styles={{ input: { fontSize: 13 } }}
              />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </TransactionJournalFormLayout>
  );
};

export default AddJournalTransactionForm;
