import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Grid,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconPlus, IconTrash } from '@tabler/icons-react';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';
import { themeColors } from '@/theme';
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative' as const,
    boxShadow: isDragging ? '0 6px 16px rgba(0,0,0,0.12)' : 'none',
    opacity: isDragging ? 0.9 : 1,
  };

  const isDebitFilled = item.debit > 0;
  const isCreditFilled = item.credit > 0;

  return (
    <Grid
      ref={setNodeRef}
      columns={24}
      bg="white"
      gutter="sm"
      align="center"
      px="xs"
      py="xs"
      style={{
        ...style,
        borderRadius: 8,
        border: `1px solid ${isDragging ? themeColors.primary[5] : themeColors.slate[2]}`,
        backgroundColor: isDragging ? 'var(--mantine-color-primary-0)' : 'white',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <Grid.Col span={1} ta="center">
        <Tooltip label="Tahan dan geser untuk memindahkan posisi baris" position="top">
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Drag handle"
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab' }}
          >
            <DotsSixVerticalIcon size={20} color={themeColors.slate[5]} weight="bold" />
          </ActionIcon>
        </Tooltip>
      </Grid.Col>

      <Grid.Col span={7}>
        <Select
          key="accounts"
          placeholder="Pilih akun pembukuan..."
          data={listJournalAccount}
          value={item.account}
          searchable
          clearable
          onChange={(value) => updateTransaction(index, 'account', value || '')}
          rightSection={<IconChevronDown size={14} />}
          comboboxProps={{ width: 450, position: 'bottom-start' }}
          styles={{ input: { height: 38, fontSize: 13 } }}
        />
      </Grid.Col>

      <Grid.Col span={7}>
        <TextInput
          placeholder="Deskripsi transaksi (opsional)..."
          value={item.description}
          onChange={(e) => updateTransaction(index, 'description', e.target.value)}
          styles={{ input: { height: 38, fontSize: 13 } }}
        />
      </Grid.Col>

      <Grid.Col span={4}>
        <NumberInput
          key="debit"
          hideControls
          placeholder="0"
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
          onChange={(value) =>
            updateTransaction(index, 'debit', value === '' ? 0 : Number(value) || 0)
          }
          disabled={isCreditFilled}
          styles={{
            input: {
              height: 38,
              fontSize: 13,
              fontWeight: isDebitFilled ? 600 : 400,
              color: isDebitFilled ? 'var(--mantine-color-teal-8)' : undefined,
              backgroundColor: isCreditFilled ? 'var(--mantine-color-gray-1)' : 'white',
              textAlign: 'right',
            },
          }}
        />
      </Grid.Col>

      <Grid.Col span={4}>
        <NumberInput
          key="credit"
          hideControls
          placeholder="0"
          prefix="Rp "
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
          onChange={(value) =>
            updateTransaction(index, 'credit', value === '' ? 0 : Number(value) || 0)
          }
          disabled={isDebitFilled}
          styles={{
            input: {
              height: 38,
              fontSize: 13,
              fontWeight: isCreditFilled ? 600 : 400,
              color: isCreditFilled ? 'var(--mantine-color-red-8)' : undefined,
              backgroundColor: isDebitFilled ? 'var(--mantine-color-gray-1)' : 'white',
              textAlign: 'right',
            },
          }}
        />
      </Grid.Col>

      <Grid.Col span={1} ta="center">
        <Tooltip label="Hapus baris ini">
          <ActionIcon
            disabled={arr.length <= minimumTransaction}
            variant="subtle"
            color="red"
            onClick={() => removeTransaction(index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Grid.Col>
    </Grid>
  );
};

const TransactionForm: React.FC = () => {
  const {
    minimumTransaction,
    transactions,
    updateTransaction,
    removeTransaction,
    reorderTransaction,
    addTransaction,
  } = useTransactionStore();

  const { accounts } = useJournalAccounts();
  const journalAccounts = Array.isArray(accounts) ? accounts : [];

  const listJournalAccount = journalAccounts
    .filter((account) => account.name && account.accountNumber)
    .map((account) => ({
      value: account.id,
      label: `[${account.accountNumber}] ${account.name}${account.category ? ` • ${account.category.name}` : ''}`,
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
      <Grid columns={24} gutter="sm" px="xs" py={4} bg="gray.1" style={{ borderRadius: 6 }}>
        <Grid.Col span={1} ta="center">
          <Text fz={11} fw={700} c="dimmed">
            #
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            Akun Rekening{' '}
            <Text span c="red">
              *
            </Text>
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            Deskripsi / Keterangan
          </Text>
        </Grid.Col>
        <Grid.Col span={4} ta="right">
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            Debit (Rp){' '}
            <Text span c="red">
              *
            </Text>
          </Text>
        </Grid.Col>
        <Grid.Col span={4} ta="right">
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            Kredit (Rp){' '}
            <Text span c="red">
              *
            </Text>
          </Text>
        </Grid.Col>
        <Grid.Col span={1} ta="center">
          <Text fz={11} fw={700} c="dimmed">
            Aksi
          </Text>
        </Grid.Col>
      </Grid>

      {/* Rows */}
      {transactions.length === 0 ? (
        <Box py="xl" style={{ textAlign: 'center' }}>
          <Text c="dimmed" fz="sm">
            Belum ada baris transaksi. Silakan tambah baris baru.
          </Text>
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
            variant="light"
            color="primary"
            fullWidth
            h={42}
            leftSection={<IconPlus size={16} />}
            onClick={() => addTransaction()}
            radius="md"
            styles={{
              root: {
                borderStyle: 'dashed',
                borderWidth: 1.5,
              },
            }}
          >
            Tambah Baris Akun Baru
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default TransactionForm;
