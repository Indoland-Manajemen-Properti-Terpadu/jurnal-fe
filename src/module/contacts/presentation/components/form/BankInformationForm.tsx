import React, { useState, useEffect } from 'react';
import {
  Button,
  Grid,
  Stack,
  TextInput,
  Notification,
  Select,
  Text,
  ActionIcon,
  Center,
  Menu,
  Group,
  Container,
} from '@mantine/core';
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconChevronDown,
  IconPlus,
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { themeColors } from '@/theme';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { showNotification } from '@mantine/notifications';
import { JournalAccounts } from '@/module/chart-of-accounts';

interface BankData {
  id: number;
  bank: string | null;
  branch: string;
  accountHolder: string;
  accountNumber: string;
}

interface NewBankData {
  bank: string | null;
  branch: string;
  accountHolder: string;
  accountNumber: string;
}

const BankInformationForm: React.FC = () => {
  const [bankData, setBankData] = useState<BankData[]>([]);
  const [editingRow, setEditingRow] = useState<BankData | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<BankData[]>([]);

  const [newBank, setNewBank] = useState<NewBankData>({
    bank: null,
    branch: '',
    accountHolder: '',
    accountNumber: '',
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('bankData') || '[]') as BankData[];
    setBankData(savedData);
  }, []);

  const isEmpty = (data: BankData[]): boolean => data.length === 0;

  const saveLocalDate = (data: BankData[]) => {
    localStorage.setItem('bankData', JSON.stringify(data));
  };

  useEffect(() => () => localStorage.removeItem('bankData'), []);

  const saveAddData = () => {
    if (!newBank.bank || !newBank.branch || !newBank.accountHolder || !newBank.accountNumber) {
      showNotification({
        title: 'Fields cannot be empty',
        message: 'All fields are required. Please fill in all the fields.',
        color: 'red',
      });
      return;
    }

    const updatedData: BankData[] = [...bankData, { id: Date.now(), ...newBank }];

    setBankData(updatedData);
    saveLocalDate(updatedData);
    setNewBank({ bank: '', branch: '', accountHolder: '', accountNumber: '' });
  };

  const editRowData = (record: BankData) => setEditingRow({ ...record });

  const saveUpdateData = () => {
    if (!editingRow) return;

    const updatedData = bankData.map((row) => (row.id === editingRow.id ? { ...editingRow } : row));
    setBankData(updatedData);
    saveLocalDate(updatedData);
    setEditingRow(null);
  };

  const cancelEdit = () => setEditingRow(null);

  const deleteRowData = (id: number) => {
    const updatedData = bankData.filter((row) => row.id !== id);
    setBankData(updatedData);
    saveLocalDate(updatedData);
  };

  const columns = [
    {
      accessor: 'bank',
      title: (
        <Text size="sm" fz={14} fw={600} c={themeColors.black[9]}>
          Bank
        </Text>
      ),
      render: (record: BankData) =>
        editingRow && editingRow.id === record.id ? (
          <Select
            value={editingRow.bank}
            rightSection={<IconChevronDown size={14} />}
            data={['Mandiri', 'BCA', 'BNI', 'DKI Jakarta']}
            onChange={(value) => setEditingRow({ ...editingRow, bank: value || '' })}
          />
        ) : (
          record.bank
        ),
    },
    {
      accessor: 'branch',
      title: (
        <Text size="sm" fz={14} fw={600} c={themeColors.black[9]}>
          Branch
        </Text>
      ),
      render: (record: BankData) =>
        editingRow && editingRow.id === record.id ? (
          <TextInput
            value={editingRow.branch}
            onChange={(e) => setEditingRow({ ...editingRow, branch: e.target.value })}
          />
        ) : (
          record.branch
        ),
    },
    {
      accessor: 'accountHolder',
      title: (
        <Text size="sm" fz={14} fw={600} c={themeColors.black[9]}>
          Account Holder
        </Text>
      ),
      render: (record: BankData) =>
        editingRow && editingRow.id === record.id ? (
          <TextInput
            value={editingRow.accountHolder}
            onChange={(e) => setEditingRow({ ...editingRow, accountHolder: e.target.value })}
          />
        ) : (
          record.accountHolder
        ),
    },
    {
      accessor: 'accountNumber',
      title: (
        <Text size="sm" fz={14} fw={600} c={themeColors.black[9]}>
          Account Number
        </Text>
      ),
      render: (record: BankData) =>
        editingRow && editingRow.id === record.id ? (
          <TextInput
            value={editingRow.accountNumber}
            onChange={(e) => setEditingRow({ ...editingRow, accountNumber: e.target.value })}
          />
        ) : (
          record.accountNumber
        ),
    },
    {
      accessor: 'actions',
      title: (
        <Text size="sm" fz={14} fw={600} ta="center" c={themeColors.black[9]}>
          Action
        </Text>
      ),
      render: (record: BankData) =>
        editingRow && editingRow.id === record.id ? (
          <Center>
            <ActionIcon onClick={saveUpdateData}>
              <IconCheck />
            </ActionIcon>
            <ActionIcon onClick={cancelEdit}>
              <IconX />
            </ActionIcon>
          </Center>
        ) : (
          <Center>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon>
                  <IconDots />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconPencil />} onClick={() => editRowData(record)}>
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash />}
                  onClick={() => deleteRowData(record.id)}
                  color="red"
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Center>
        ),
    },
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text c={themeColors.primary[6]} fz={18} fw={500}>
          Add Bank Information
        </Text>
        <Button
          variant="filled"
          size="xs"
          color={themeColors.black[9]}
          leftSection={<IconPlus size={14} />}
          onClick={saveAddData}
        >
          Add Bank
        </Button>
      </Group>
      <Grid>
        <Grid.Col span={6}>
          <Select
            withAsterisk
            label="Bank"
            placeholder="Choose bank"
            rightSection={<IconChevronDown size={14} />}
            data={['Mandiri', 'BCA', 'BNI', 'DKI Jakarta']}
            value={newBank.bank}
            onChange={(value) => setNewBank({ ...newBank, bank: value })}
            // onChange={(value) => setNewBank({ ...newBank, bank: value || "" })}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            withAsterisk
            label="Bank Branch"
            placeholder="Add branch"
            value={newBank.branch}
            onChange={(e) => setNewBank({ ...newBank, branch: e.target.value })}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            withAsterisk
            label="Bank Account Holder"
            placeholder="Add account holder"
            value={newBank.accountHolder}
            onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            withAsterisk
            label="Account Number"
            placeholder="Add account number (Example: 123-456-7890)"
            value={newBank.accountNumber}
            onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
          />
        </Grid.Col>
      </Grid>
      <Text c={themeColors.primary[6]} fz={18} fw={500}>
        List Bank
      </Text>
      {isEmpty(bankData) ? (
        <Container fluid p="xl">
          <EmptyState />
        </Container>
      ) : (
        <DataTable
          columns={columns}
          records={bankData}
          withTableBorder
          highlightOnHover
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
        />
      )}
    </Stack>
  );
};

export default BankInformationForm;
