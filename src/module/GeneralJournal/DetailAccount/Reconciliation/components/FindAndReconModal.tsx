import { themeColors } from "@/theme"
import { Button, Stack, Text, Input, Group, Paper, Badge } from "@mantine/core"
import { IconCalendar } from "@tabler/icons-react"
import CustomConfirmModal from "@/components/Modals/ConfirmModal"
import { useState } from "react"
import { DataTable } from "mantine-datatable"
import { formatCurrency } from "@/utils/FormatCurrency"
import { DatePickerInput } from "@mantine/dates"
import { GetTransactionByAccountRecon } from "../services/TransactionByAccountRecon.service"
import { useParams } from "react-router-dom"
import { dateFormatV1 } from "@/utils/FormatDate"
import { BankStatementData } from "../types/GetReconciliationModel"
import { ArrowCircleDown, ArrowCircleUp, MagnifyingGlass } from "@phosphor-icons/react"
import useFilterTransaction from "../../Main/store/FilterTransaction"

interface FindAndReconModalProps {
    opened: boolean;
    onClose: () => void;
    SelectedBankStatament: BankStatementData | null;
}

export const FindAndReconModal: React.FC<FindAndReconModalProps> = ({ opened, onClose, SelectedBankStatament }) => {
    const { idAccount } = useParams<{ idAccount: string }>();
    const { searchQuery, setSearchQuery, selectedDate, setSelectedDate } = useFilterTransaction();
    const { data: ReconTransaction } = GetTransactionByAccountRecon(idAccount!, false);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

    const filteredTransaction = ReconTransaction?.filter((item: any) => {
        const matchesQuery =
            (item.transactionNumber && String(item.transactionNumber)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (dateFormatV1(item.transactionDate) && dateFormatV1(item.transactionDate)
                .toLowerCase()
                .includes(searchQuery.toLowerCase()));

        const matchesDate =
            !selectedDate ||
            (item.transactionDate && new Date(item.transactionDate)
                .toDateString() === selectedDate.toDateString());

        return matchesQuery && matchesDate;
    });

    const totalNominal = Math.abs(SelectedBankStatament?.amount || 0);
    const selectedNominal = selectedRecords.reduce((total, record) => {
        return total + (record.debit || record.credit || 0);
    }, 0);
    const shortageNominal = totalNominal - selectedNominal;

    const columns = [
        {
            accessor: 'transactionNumber',
            title: <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>No Transaksi</Text>,
            render: (element: any) => (
                <Text size="sm" c={themeColors.figmaTeal[6]} fw={500} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    Jurnal Transaksi #{element.transactionNumber}
                </Text>
            ),
        },
        {
            accessor: 'transactionDate',
            title: <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>Tanggal</Text>,
            render: (element: any) => <Text size="sm" c={themeColors.defaultBlack[10]}>{dateFormatV1(element.transactionDate)}</Text>,
        },
        {
            accessor: 'debit',
            title: <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>Debit (Dalam Rp)</Text>,
            render: (element: any) => <Text size="sm" c={themeColors.defaultBlack[10]}>{formatCurrency(element.debit || 0)}</Text>,
        },
        {
            accessor: 'credit',
            title: <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>Kredit (Dalam Rp)</Text>,
            render: (element: any) => <Text size="sm" c={themeColors.defaultBlack[10]}>{formatCurrency(element.credit || 0)}</Text>,
        }
    ];

    return (
        <CustomConfirmModal
            size="65rem"
            opened={opened}
            onClose={onClose}
            withCloseButton={true}
            title={<Text fw={700} fz={18} c={themeColors.defaultBlack[10]}>Cocokkan dengan Rekening Koran</Text>}
            labels={{
                confirm:
                    <Button
                        variant="filled"
                        bg={shortageNominal === 0 ? themeColors.grey[2] : themeColors.grey[1]}
                        onClick={onClose}
                        disabled={shortageNominal !== 0}
                        style={{ 
                            color: shortageNominal === 0 ? themeColors.defaultBlack[10] : themeColors.grey[5] 
                        }}
                    >
                        Cocokkan
                    </Button>,
                cancel:
                    <Button
                        variant="filled"
                        bg={themeColors.blue[0]}
                        c={themeColors.blue[6]}
                        onClick={onClose}
                    >
                        Batal
                    </Button>
            }}
        >
            <Stack gap="md">
                {/* Bank Statement Summary Card */}
                {SelectedBankStatament && (
                    <Paper withBorder p="md" radius="sm" bg="white">
                        <Stack gap="xs">
                            <Text size="xs" fw={600} c={themeColors.defaultBlack[10]}>Rekening Koran</Text>
                            <Group justify="space-between" align="flex-start">
                                <Stack gap={2}>
                                    <Text size="xs" c={themeColors.grey[6]}>{dateFormatV1(SelectedBankStatament.date)}</Text>
                                    <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>{SelectedBankStatament.description}</Text>
                                </Stack>
                                <Stack align="flex-end" gap={4}>
                                    <Badge 
                                        variant="light" 
                                        color={SelectedBankStatament.amount > 0 ? "green" : "red"}
                                        leftSection={SelectedBankStatament.amount > 0 ? <ArrowCircleDown size={14} /> : <ArrowCircleUp size={14} />}
                                    >
                                        <Text size="xs" fw={700} c={SelectedBankStatament.amount > 0 ? themeColors.green[8] : themeColors.red[8]}>
                                            {SelectedBankStatament.amount > 0 ? "Diterima" : "Dikirim"}
                                        </Text>
                                    </Badge>
                                    <Text size="sm" fw={700} c={themeColors.defaultBlack[10]}>{formatCurrency(Math.abs(SelectedBankStatament.amount))}</Text>
                                </Stack>
                            </Group>
                        </Stack>
                    </Paper>
                )}

                <Text fw={600} size="sm" c={themeColors.defaultBlack[10]}>Cari Jurnal Transaksi</Text>

                {/* Filters */}
                <Group grow>
                    <Input
                        placeholder="Cari kode atau nama akun..."
                        leftSection={<MagnifyingGlass size={16} color={themeColors.grey[6]} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        styles={{ input: { color: themeColors.defaultBlack[10] } }}
                    />
                    <DatePickerInput
                        placeholder="Semua Tanggal"
                        leftSection={<IconCalendar size={18} color={themeColors.grey[6]} />}
                        value={selectedDate}
                        onChange={setSelectedDate}
                        clearable
                        styles={{ input: { color: themeColors.defaultBlack[10] } }}
                    />
                </Group>

                {/* Journal Transactions Table */}
                <DataTable
                    withTableBorder
                    borderRadius="sm"
                    fz="sm"
                    columns={columns}
                    records={filteredTransaction || []}
                    selectedRecords={selectedRecords}
                    onSelectedRecordsChange={setSelectedRecords}
                    minHeight={200}
                    paginationColor="teal"
                    styles={{
                        header: { color: themeColors.defaultBlack[10] },
                        row: { color: themeColors.defaultBlack[10] }
                    }}
                />

                {/* Modal Footer Info */}
                <Group justify="space-between" mt="sm">
                    <Group gap="lg">
                        <Group gap={4}>
                            <Text size="sm" fw={500} c={themeColors.defaultBlack[10]}>Total Nominal:</Text>
                            <Text size="sm" fw={700} c={themeColors.defaultBlack[10]}>{formatCurrency(totalNominal)}</Text>
                        </Group>
                        <Group gap={4}>
                            <Text size="sm" fw={500} c={themeColors.defaultBlack[10]}>Dipilih:</Text>
                            <Text size="sm" fw={700} c={themeColors.defaultBlack[10]}>{formatCurrency(selectedNominal)}</Text>
                        </Group>
                        <Group gap={4}>
                            <Text size="sm" fw={500} c={themeColors.defaultBlack[10]}>Kekurangan:</Text>
                            <Text size="sm" fw={700} c={shortageNominal > 0 ? themeColors.red[7] : themeColors.figmaTeal[6]}>
                                {formatCurrency(Math.abs(shortageNominal))}
                            </Text>
                        </Group>
                    </Group>
                </Group>
            </Stack>
        </CustomConfirmModal>
    )
}
