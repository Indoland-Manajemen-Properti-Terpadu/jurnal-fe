import { ActionIcon, Group, Text, TextInput, Modal, Stack, Button, Flex } from '@mantine/core';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { formatCurrency } from '@/utils/FormatCurrency';
import EmptyState from '@/components/EmptyState/EmptyTable';
import classes from '../pages/ImportBankStatementDraft.module.css'
import { IconCalendar, IconPencil, IconTrash } from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { BankStatementPreviewItem } from '../types/ImportBankStatement.model';
import { useState } from 'react';
import { DateInput } from '@mantine/dates';
import { format, parse } from 'date-fns';
import { useBankStatementStore } from '../store/useBankStatement.store';

interface ImportBankStatementDraftTableProps {
    records: BankStatementPreviewItem[];
    selectedRecords?: BankStatementPreviewItem[];
    onSelectedRecordsChange?: (records: BankStatementPreviewItem[]) => void;
}

const headTableStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: themeColors.defaultBlack[10]
}

const ImportBankStatementDraftTable = ({
    records,
    selectedRecords,
    onSelectedRecordsChange
}: ImportBankStatementDraftTableProps) => {
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [editData, setEditData] = useState<BankStatementPreviewItem | null>(null);
    const [originalData, setOriginalData] = useState<BankStatementPreviewItem | null>(null);
    const { updateItem, deleteItem } = useBankStatementStore();

    const handleEditClick = (item: BankStatementPreviewItem) => {
        setEditData({ ...item });
        setOriginalData(item);
        setEditModalOpened(true);
    };

    const isChanged = Boolean(
        originalData && editData && (
            originalData.Description !== editData.Description ||
            originalData.TransactionDate !== editData.TransactionDate ||
            originalData.Received !== editData.Received ||
            originalData.Spent !== editData.Spent
        )
    );

    const hasReceived = Boolean(editData?.Received && editData.Received !== '0' && editData.Received !== '');
    const hasSpent = Boolean(editData?.Spent && editData.Spent !== '0' && editData.Spent !== '');

    const handleFieldChange = (field: keyof BankStatementPreviewItem, value: any) => {
        if (editData) {
            setEditData({ ...editData, [field]: value });
        }
    };

    const handleSaveChange = () => {
        if (editData) {
            updateItem(editData.rowIndex, { 
                ...editData, 
                isValid: true, 
                errors: [],
                isDateValid: true,
                isReceivedValid: true,
                isSpentValid: true,
                isDescriptionValid: true
            });
            setEditModalOpened(false);
            setEditData(null);
        }
    };

    const handleDelete = (rowIndex: number) => {
        deleteItem(rowIndex);
    };

    const columns: DataTableColumn<BankStatementPreviewItem>[] = [
        {
            accessor: 'Description',
            title: <Text style={headTableStyle}>Deskripsi Transaksi</Text>,
            render: (element) => (
                <Text size="sm" fz={14} fw={400} c={!element.isDescriptionValid ? themeColors.red[6] : themeColors.defaultBlack[10]}>
                    {element.Description || '-'}
                </Text>
            ),
        },
        {
            accessor: 'TransactionDate',
            title: <Text style={headTableStyle} ta='center'>Tanggal</Text>,
            render: (element) => (
                <Text size="sm" fz={14} fw={400} c={!element.isDateValid ? themeColors.red[6] : themeColors.defaultBlack[10]} ta='center'>
                    {element.TransactionDate || '-'}
                </Text>
            ),
        },
        {
            accessor: 'Received',
            title: <Text style={headTableStyle}>Terima (Dalam Rp)</Text>,
            render: (element) => (
                <Text size="sm" fz={14} fw={400} c={!element.isReceivedValid ? themeColors.red[6] : themeColors.defaultBlack[10]}>
                    {element.Received ? formatCurrency(parseFloat(element.Received) || 0) : '-'}
                </Text>
            ),
        },
        {
            accessor: 'Spent',
            title: <Text style={headTableStyle}>Kirim (Dalam Rp)</Text>,
            render: (element) => (
                <Text size="sm" fz={14} fw={400} c={!element.isSpentValid ? themeColors.red[6] : themeColors.defaultBlack[10]}>
                    {element.Spent ? formatCurrency(parseFloat(element.Spent) || 0) : '-'}
                </Text>
            ),
        },
        {
            accessor: 'Balance',
            title: <Text style={headTableStyle}>Saldo</Text>,
            render: () => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]}>{formatCurrency(0)}</Text>
            ),
        },
        {
            accessor: 'action',
            title: <Text style={headTableStyle} ta='center'>Aksi</Text>,
            render: (element) => (
                <Group gap="xs" justify="center">
                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEditClick(element)}>
                        <IconPencil size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(element.rowIndex)}>
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            ),
        },
    ];

    return (
        <>
            <DataTable
                withTableBorder
                borderRadius="md"
                minHeight={300}
                highlightOnHover
                fz="sm"
                verticalAlign="center"
                columns={columns}
                records={records}
                selectedRecords={selectedRecords}
                onSelectedRecordsChange={onSelectedRecordsChange}
                emptyState={<EmptyState />}
                rowStyle={(record) => ({
                    backgroundColor: !record.isValid ? themeColors.red[0] : 'inherit',
                })}
                styles={{
                    root: { borderColor: '#E9ECEF' },
                }}
            />

            <Modal 
                opened={editModalOpened} 
                onClose={() => setEditModalOpened(false)} 
                title={<Text fw={600} c={themeColors.defaultBlack[10]}>Ubah Data Pratinjau</Text>}
                centered
            >
                <Stack gap="md">
                    <TextInput
                        label="Nama Transaksi"
                        placeholder="Masukkan nama transaksi"
                        value={editData?.Description || ''}
                        onChange={(e) => handleFieldChange('Description', e.currentTarget.value)}
                    />
                    <DateInput
                        label="Tanggal"
                        placeholder="Pilih tanggal"
                        valueFormat="DD/MM/YYYY"
                        rightSection={<IconCalendar size={16} />}
                        value={editData?.TransactionDate ? parse(editData.TransactionDate, 'dd/MM/yyyy', new Date()) : null}
                        onChange={(e) => handleFieldChange('TransactionDate', e ? format(e, 'dd/MM/yyyy') : '')}
                    />
                    <Group grow align="flex-start">
                        <TextInput
                            label="Terima (Dalam Rp)"
                            placeholder="0"
                            value={editData?.Received || ''}
                            onChange={(e) => handleFieldChange('Received', e.currentTarget.value)}
                            disabled={hasSpent}
                        />
                        <TextInput
                            label="Kirim (Dalam Rp)"
                            placeholder="0"
                            value={editData?.Spent || ''}
                            onChange={(e) => handleFieldChange('Spent', e.currentTarget.value)}
                            disabled={hasReceived}
                        />
                    </Group>
                    <Flex justify="flex-end" gap="sm" mt="md">
                        <Button variant="light" color="gray" onClick={() => setEditModalOpened(false)}>Batal</Button>
                        <Button 
                            variant="filled" 
                            color={themeColors.figmaTeal[5]} 
                            onClick={handleSaveChange}
                            leftSection={<IconPencil size={16} />}
                            disabled={!isChanged}
                        >
                            Simpan Perubahan
                        </Button>
                    </Flex>
                </Stack>
            </Modal>
        </>
    );
};

export default ImportBankStatementDraftTable;
