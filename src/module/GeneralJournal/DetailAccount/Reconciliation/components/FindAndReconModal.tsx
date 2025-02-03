import { themeColors, buttonGradient, gradientColors } from "@/theme"
import { Button, Stack, Divider, Text, Input, SimpleGrid, Group, Checkbox, Box, Flex } from "@mantine/core"
import { IconCalendar, IconSearch } from "@tabler/icons-react"
import CustomConfirmModal from "@/components/Modals/ConfirmModal"
import { useState } from "react"
import { DataTable } from "mantine-datatable"
import { formatCurrency } from "@/utils/FormatCurrency"
import { DatePickerInput } from "@mantine/dates"
import { BankStatementModel } from "../../BankStatement/types/BankStatementModel"
import { GetTransactionByAccountRecon } from "../service/TransactionByAccountRecon.service"
import { useParams } from "react-router-dom"
import { dateFormatV1 } from "@/utils/FormatDate"
import { BankStatementData } from "../types/GetReconciliationModel"
import { useMemo } from "react";
import useFilterTransaction from "../../Main/store/FilterTransaction"

interface FindAndReconModalProps {
    opened: boolean;
    onClose: () => void;
    SelectedBankStatament: BankStatementData | null;
}

export const FindAndReconModal: React.FC<FindAndReconModalProps> = ({ opened, onClose, SelectedBankStatament }) => {
    const initialFromDate = new Date("2024-01-01");
    const initialToDate = new Date();
    const [value, setValue] = useState<[Date | null, Date | null]>([initialFromDate, initialToDate]);
    const [expenditure, setExpenditure] = useState(false);
    const { idAccount } = useParams<{ idAccount: string }>();
    const { data: ReconTransaction } = GetTransactionByAccountRecon(idAccount!, expenditure);
    const [selectedRecords, setSelectedRecords] = useState<TransactionByAccountRecon[]>([]);
    const { searchQuery, setSearchQuery, selectedDate, setSelectedDate } = useFilterTransaction();


    const filteredTransaction = ReconTransaction?.filter((item: TransactionByAccountRecon) => {
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

    // Validation for check Reconciliate matched beetween bank statement === journal transaction
    const reconcileMatch = useMemo(() => {
        if (!SelectedBankStatament || selectedRecords.length === 0) return false;

        // Bank Statement details
        const bankAmount = SelectedBankStatament.debit || SelectedBankStatament.credit;
        const bankDate = dateFormatV1(SelectedBankStatament.transactionDate);

        // Selected journal transaction details
        const match = selectedRecords.some((record) => {
            const journalAmount = selectedRecords.length > 1
                ? selectedRecords.reduce((total, { debit, credit }) => total + (debit || credit || 0), 0)
                : record.debit || record.credit;
            const journalDate = dateFormatV1(record.transactionDate);
            return journalAmount === bankAmount && journalDate === bankDate;
        });

        return match;
    }, [SelectedBankStatament, selectedRecords]);


    const bankStatementColumn = [
        {
            accessor: 'bankStatement',
            title: 'Bank Statement',
            render: (element: BankStatementData) =>
                <Text c={themeColors.defaultBlack[10]} fz={14}>{element.transactionName}</Text>
        },
        {
            accessor: 'transactionDate',
            title: 'Transaction Date',
            render: (element: BankStatementData) => <Text c={themeColors.defaultBlack[10]} fz={14}>{dateFormatV1(element.transactionDate)}</Text>,
        },
        {
            accessor: 'received',
            title: 'Received',
            render: (element: BankStatementData) => <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(element.debit)}</Text>,
        },
        {
            accessor: 'sent',
            title: 'Sent',
            render: (element: BankStatementData) => <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(element.credit)}</Text>,
        }
    ]
    const journalTransactiontColumn = [
        {
            accessor: 'bankStatement',
            title: 'Journal Transaction',
            render: (element: TransactionByAccountRecon) =>
                <Text c={themeColors.defaultBlack[10]} fz={14}>Journal Entry #{element.transactionNumber}</Text>
        },
        {
            accessor: 'transactionDate',
            title: 'Transaction Date',
            render: (element: TransactionByAccountRecon) => <Text c={themeColors.defaultBlack[10]} fz={14}>{dateFormatV1(element.transactionDate)}</Text>,
        },
        {
            accessor: 'received',
            title: 'Received',
            render: (element: TransactionByAccountRecon) => <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(element.debit)}</Text>,
        },
        {
            accessor: 'sent',
            title: 'Sent',
            render: (element: TransactionByAccountRecon) => <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(element.credit)}</Text>,
        }
    ]


    const NominalDetails = () => {
        const bankStatementAmount = SelectedBankStatament
            ? SelectedBankStatament.debit > 0
                ? SelectedBankStatament.debit
                : SelectedBankStatament.credit
            : 0;

        const selectedTransactionAmount = selectedRecords.reduce((total, record) => {
            return total + (record.debit > 0 ? record.debit : record.credit);
        }, 0);

        // Calculated values
        const adjustNominal = Math.max(0, selectedTransactionAmount - bankStatementAmount);
        const shortageNominal = Math.max(0, bankStatementAmount - selectedTransactionAmount);

        return (
            <Box bg={themeColors.grey[0]} bd="sm" p={10} style={{ borderRadius: 5 }}>
                <Group grow justify="space-between" align="center">
                    <Text fz={14} fw={400} c={themeColors.grey[7]}>
                        Adjust Nominal
                    </Text>
                    <Text fz={14} fw={400} c={themeColors.defaultBlack[10]} ta="right">
                        {formatCurrency(adjustNominal)}
                    </Text>
                </Group>
                <Group grow justify="space-between" align="center">
                    <Text fz={14} fw={400} c={themeColors.grey[7]}>
                        Selected Nominal
                    </Text>
                    <Text fz={14} fw={400} c={themeColors.defaultBlack[10]} ta="right">
                        {formatCurrency(selectedTransactionAmount)}
                    </Text>
                </Group>
                <Group grow justify="space-between" align="center">
                    <Text fz={14} fw={400} c={themeColors.red[6]}>
                        Nominal Shortage
                    </Text>
                    <Text fz={14} fw={400} c={themeColors.red[6]} ta="right">
                        {formatCurrency(shortageNominal)}
                    </Text>
                </Group>
            </Box>
        );
    };



    return (
        <CustomConfirmModal
            size="55rem"
            opened={opened}
            onClose={onClose}
            withCloseButton={true}
            title={<Text variant="gradient" gradient={gradientColors.mainGR} fz={16} fw={500}>Reconcile the journal transactions with the bank statement</Text>}
            labels={{
                confirm:
                    <Button
                        variant="gradient"
                        gradient={buttonGradient.gradient}
                        onClick={onClose}
                        disabled={!reconcileMatch}
                    >
                        Reconcile
                    </Button>,
                cancel:
                    <Button
                        variant="light"
                        color={themeColors.grey[7]}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
            }}
        >
            <Stack gap='xs' align="stretch" justify="center">
                <Divider />
                <Text c={themeColors.defaultBlack[10]} fz={16} fw={500}>Bank Statement</Text>
                <DataTable
                    withTableBorder
                    borderRadius="md"
                    striped
                    highlightOnHover
                    fz="sm"
                    columns={bankStatementColumn}
                    records={SelectedBankStatament ? [SelectedBankStatament] : []}
                />
                <Text c={themeColors.defaultBlack[10]} fz={16} fw={500}>Find Transaction Journal</Text>
                <SimpleGrid cols={3}>
                    <Input
                        key='bankStatement'
                        placeholder="Find Transaction"
                        size="xs"
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <DatePickerInput
                        type="range"
                        placeholder="Select start date and end date"
                        value={value}
                        valueFormat="DD/MM/YYYY"
                        onChange={setValue}
                        size="xs"
                        highlightToday
                        clearable
                        rightSection={!value ? <IconCalendar size={16} /> : null}
                        maxDate={new Date()}
                    />
                    <Button variant="default" size="xs">
                        <Checkbox
                            defaultChecked
                            label="Show Expenditur"
                            color="cyan"
                            variant="outline"
                            size="xs"
                            checked={expenditure}
                            onChange={() => setExpenditure((prev) => !prev)}
                        />
                    </Button>
                </SimpleGrid >
                <DataTable
                    withTableBorder
                    borderRadius="md"
                    striped
                    highlightOnHover
                    fz="sm"
                    columns={journalTransactiontColumn}
                    records={filteredTransaction}
                    selectedRecords={selectedRecords}
                    onSelectedRecordsChange={setSelectedRecords}
                />
                <NominalDetails />
                <Divider />
            </Stack>
        </CustomConfirmModal>
    )
}
