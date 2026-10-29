import React from 'react';
import { Box, Button, Grid, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';
import { useTransactionStore } from '../store/useTransactionStore';
import JournalLineRow from './JournalLineRow';
import JournalTotals from './JournalTotals';

const RequiredMark = () => (
  <Text span c="red">
    *
  </Text>
);

const JournalLinesEditor: React.FC = () => {
  const { t } = useTranslation('journalEntries');
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

  const accountOptions = journalAccounts
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
      const oldIndex = transactions.findIndex((row) => row.key === active.id);
      const newIndex = transactions.findIndex((row) => row.key === over.id);
      reorderTransaction(oldIndex, newIndex);
    }
  };

  return (
    <Stack gap="xs">
      <Grid columns={24} gutter="sm" px="xs" py={4} bg="gray.1" style={{ borderRadius: 6 }}>
        <Grid.Col span={1} ta="center">
          <Text fz={11} fw={700} c="dimmed">
            {t('editor.headNumber')}
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            {t('editor.headAccount')} <RequiredMark />
          </Text>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            {t('editor.headDescription')}
          </Text>
        </Grid.Col>
        <Grid.Col span={4} ta="right">
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            {t('editor.headDebit')} <RequiredMark />
          </Text>
        </Grid.Col>
        <Grid.Col span={4} ta="right">
          <Text fz={11} fw={700} c="dimmed" tt="uppercase">
            {t('editor.headCredit')} <RequiredMark />
          </Text>
        </Grid.Col>
        <Grid.Col span={1} ta="center">
          <Text fz={11} fw={700} c="dimmed">
            {t('editor.headAction')}
          </Text>
        </Grid.Col>
      </Grid>

      {transactions.length === 0 ? (
        <Box py="xl" style={{ textAlign: 'center' }}>
          <Text c="dimmed" fz="sm">
            {t('editor.empty')}
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
              items={transactions.map((row) => row.key)}
              strategy={verticalListSortingStrategy}
            >
              {transactions.map((item, index) => (
                <JournalLineRow
                  key={item.key}
                  item={item}
                  index={index}
                  rowCount={transactions.length}
                  minimumTransaction={minimumTransaction}
                  accountOptions={accountOptions}
                  updateTransaction={updateTransaction}
                  removeTransaction={removeTransaction}
                />
              ))}
            </SortableContext>
          </DndContext>

          <JournalTotals />

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
            {t('editor.addRow')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default JournalLinesEditor;
