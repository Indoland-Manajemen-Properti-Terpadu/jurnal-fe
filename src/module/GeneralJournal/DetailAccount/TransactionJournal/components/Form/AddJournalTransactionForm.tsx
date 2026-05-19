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
  Anchor,
  TagsInput,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconCalendar, IconPlus, IconSearch } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { TextMediumGR } from '@/components/Text/CustomText';
import { navigate } from '@/router';
import { routes } from '@/router/routes';
import { PageHeader } from '@/components';
import { gradientColors, themeColors } from '@/theme';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';
import TransactionForm from './TransactionForm';
import ImportFiles from '../ImportFile';
import TotalAmount from '../Amounts';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import TransactionJournalFormLayout from '../../pages/Layout';
import { useSubmitTransactionJournal } from '../../services/CreateTransactionAccount.service';
import { TransactionJournalPayload } from '@/module/GeneralJournal/DetailAccount/TransactionJournal/types/AddTransactionPayload';
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';

const items = [
  { title: 'General Journal', href: () => navigate(-1) },
  { title: 'Add Transaction', href: undefined }
]

const AddJournalTransactionForm = () => {
  const navigate = useNavigate();
  const { addTransaction, notes, setNotes, transactions } = useTransactionStore();
  const disableTransaction = useTransactionStore((state) => state.disableTransaction());
  const [transactionNumber, setTransactionNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState(dayjs().format('YYYY-MM-DD'));
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
        <Group h="100%" px="xl" >
          <Group justify="space-between" style={{ flex: 1 }}>
            <TagsInput
              key="tags"
              placeholder="Tags"
              data={['React', 'Angular', 'Svelte']}
              rightSection={<IconSearch size={14} />}
            />
            <Group >
              <Button
                variant="light"
                color={themeColors.gray[7]}
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                gradient={gradientColors.gradient}
                onClick={handleSubmit}
                disabled={disableTransaction}
              >
                Add Transaction
              </Button>
            </Group>
          </Group>
        </Group>
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper p="md" shadow="md" radius="md">
            <PageHeaderV2 type='withBreadcrumbs' title="Add Transaction Journal" breadcrumbItems={items} />
          </Paper>
          <Paper p="md" shadow="md" radius="md">
            <Group grow>
              <TextInput
                key="transactionNumber"
                label="Transaction Number"
                placeholder="Add name"
                withAsterisk
                onChange={(e) => setTransactionNumber(e.target.value)}
                value={transactionNumber}
              />
              <DatePickerInput
                label="Transaction Date"
                dropdownType="popover"
                value={dayjs(transactionDate).toDate()}
                onChange={(date) => setTransactionDate(dayjs(date).format('YYYY-MM-DD'))}
                withAsterisk
                maxDate={new Date()}
                placeholder="Add Date"
                rightSection={<IconCalendar size={14} />}
              />
            </Group>
          </Paper>
          <Paper p="md" shadow="md" radius="md">
            <Stack align="stretch" justify="flex-start" gap="sm">
              <Group justify="space-between">
                <TextMediumGR>Transaction Account</TextMediumGR>
                <Button
                  variant="filled"
                  color={themeColors.black[9]}
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => addTransaction()}
                >
                  Add Account
                </Button>
              </Group>
              <Box bg={themeColors.gray[0]} bd="sm" p={10}>
                <TotalAmount />
              </Box>
              <TransactionForm />
              <Textarea
                label="Notes"
                placeholder="Add Notes"
                resize="vertical"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <CustomDropzone
                onDrop={handleDrop}
                onReject={handleReject}
                accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                description="Attach images or documents, each file should not exceed 5mb"
              />
              <ImportFiles />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </TransactionJournalFormLayout>
  );
};

export default AddJournalTransactionForm;
