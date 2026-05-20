import { Grid, NumberInput, Select, TextInput, ActionIcon, Text, Box, Stack, Button } from '@mantine/core';
import { IconChevronDown, IconTrash, IconPlus } from '@tabler/icons-react';
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';
import { themeColors } from '@/theme';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TotalAmount from '../Amounts';

interface SortableRowProps {
    item: any;
    index: number;
    arr: any[];
    minimumTransaction: number;
    listJournalAccount: any[];
    updateTransaction: (index: number, field: string, value: any) => void;
    removeTransaction: (index: number) => void;
}

const SortableRow = ({
    item,
    index,
    arr,
    minimumTransaction,
    listJournalAccount,
    updateTransaction,
    removeTransaction,
}: SortableRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.key });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        position: 'relative' as const,
        // backgroundColor: isDragging ? themeColors.slate[1] : 'transparent',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        borderRadius: isDragging ? '4px' : '0',
    };

    return (
        <Grid
            ref={setNodeRef}
            columns={24}
            bg={themeColors.slate[0]}
            gutter="md"
            align="center"
            px="xs"
            py='xs'
            style={{
                ...style,
                borderRadius: 8,
                border: `1px solid ${themeColors.slate[2]}`,
            }}
        >
            <Grid.Col span={1}>
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Drag handle"
                    {...attributes}
                    {...listeners}
                    style={{ cursor: 'grab' }}
                >
                    <DotsSixVerticalIcon size={24} color={themeColors.slate[5]} weight="duotone" />
                </ActionIcon>
            </Grid.Col>
            <Grid.Col span={7}>
                <Select
                    key="accounts"
                    placeholder="Pilih akun"
                    data={listJournalAccount}
                    value={item.account}
                    searchable
                    onChange={(value) => updateTransaction(index, 'account', value)}
                    rightSection={<IconChevronDown size={14} />}
                    comboboxProps={{ width: 500, position: 'bottom-start' }}
                    styles={{ input: { height: 40, fontSize: 13 } }}
                />
            </Grid.Col>
            <Grid.Col span={7}>
                <TextInput
                    placeholder="Pembayaran kas kecil untuk o..."
                    value={item.description}
                    onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                    styles={{ input: { height: 40, fontSize: 13 } }}
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput
                    key="debit"
                    hideControls
                    placeholder="Masukan debit"
                    prefix="Rp "
                    thousandSeparator="."
                    decimalSeparator=","
                    min={0}
                    value={item.debit === 0 ? '' : item.debit}
                    onFocus={() => {
                        if (item.debit === 0) {
                            updateTransaction(index, 'debit', '');
                        }
                    }}
                    onBlur={(e) => {
                        if (e.target.value === '') {
                            updateTransaction(index, 'debit', 0);
                        }
                    }}
                    onChange={(value) => updateTransaction(index, 'debit', value)}
                    disabled={item.credit > 0}
                    styles={{ input: { height: 40, fontSize: 13, backgroundColor: item.credit > 0 ? themeColors.gray[0] : 'white' } }}
                />
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput
                    key="credit"
                    hideControls
                    placeholder="Masukan kredit" prefix="Rp "
                    min={0}
                    value={item.credit === 0 ? '' : item.credit}
                    onFocus={() => {
                        if (item.credit === 0) {
                            updateTransaction(index, 'credit', '');
                        }
                    }}
                    onBlur={(e) => {
                        if (e.target.value === '') {
                            updateTransaction(index, 'credit', 0);
                        }
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    onChange={(value) => updateTransaction(index, 'credit', value)}
                    disabled={item.debit > 0}
                    styles={{ input: { height: 40, fontSize: 13, backgroundColor: item.debit > 0 ? themeColors.gray[0] : 'white' } }}
                />
            </Grid.Col>
            <Grid.Col span={1}>
                <ActionIcon
                    disabled={index < minimumTransaction && arr.length < minimumTransaction + 1}
                    variant="subtle"
                    color="gray"
                    onClick={() => removeTransaction(index)}
                >
                    <IconTrash size={18} color={themeColors.gray[3]} />
                </ActionIcon>
            </Grid.Col>
        </Grid>
    );
};

const TransactionForm = () => {
    const { minimumTransaction, transactions, updateTransaction, removeTransaction, reorderTransaction, addTransaction } =
        useTransactionStore();
    const { accounts } = useJournalAccounts();
    const JournalAccounts = Array.isArray(accounts) ? accounts : [];

    const listJournalAccount = JournalAccounts.filter(
        (account) => account.name && account.accountNumber
    ).map((account) => ({
        value: account.id,
        label: `${account.name} (${account.accountNumber}${account.category ? ` - ${account.category.name}` : ''})`,
    }));

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = transactions.findIndex((t) => t.key === active.id);
            const newIndex = transactions.findIndex((t) => t.key === over.id);
            reorderTransaction(oldIndex, newIndex);
        }
    };

    return (
        <Stack gap="xs">
            {/* Table Header */}
            <Grid columns={24} gutter="md" px="xs">
                <Grid.Col span={1} />
                <Grid.Col span={7}>
                    <Text fz="xs" fw={600} c={themeColors.gray[6]}>Akun<Text component="span" c="red">*</Text></Text>
                </Grid.Col>
                <Grid.Col span={7}>
                    <Text fz="xs" fw={600} c={themeColors.gray[6]}>Deskripsi</Text>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Text fz="xs" fw={600} c={themeColors.gray[6]}>Debit (Rp)<Text component="span" c="red">*</Text></Text>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Text fz="xs" fw={600} c={themeColors.gray[6]}>Kredit (Rp)<Text component="span" c="red">*</Text></Text>
                </Grid.Col>
                <Grid.Col span={1} />
            </Grid>

            {transactions.length === 0 ? (
                <Box py="md" style={{ textAlign: 'center' }}>
                    <Text c="gray">Please add a transaction</Text>
                </Box>
            ) : (
                <Stack gap="xs">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={transactions.map((t) => t.key)}
                            strategy={verticalListSortingStrategy}
                        >
                            {transactions.map((item, index, arr) => (
                                <SortableRow
                                    key={item.key}
                                    item={item}
                                    index={index}
                                    arr={arr}
                                    minimumTransaction={minimumTransaction}
                                    listJournalAccount={listJournalAccount}
                                    updateTransaction={updateTransaction}
                                    removeTransaction={removeTransaction}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <TotalAmount />

                    <Button
                        variant="outline"
                        color="gray"
                        fullWidth
                        h={40}
                        leftSection={<IconPlus size={16} />}
                        onClick={() => addTransaction()}
                        styles={{
                            root: {
                                borderStyle: 'dashed',
                                borderColor: themeColors.gray[3],
                                '&:hover': {
                                    backgroundColor: themeColors.gray[0]
                                }
                            },
                            label: { color: themeColors.gray[6], fontWeight: 500, fontSize: 13 }
                        }}
                    >
                        Tambah Baris Baru
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

export default TransactionForm;
