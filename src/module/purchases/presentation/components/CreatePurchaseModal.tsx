import React, { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconPlus, IconReceipt2, IconTrash } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { CreatePurchaseFormValues } from '@/module/purchases/domain/purchase';
import { calculateTotals } from '@/module/purchases/domain/purchaseTotals';
import { useTranslation } from '@/i18n';

interface CreatePurchaseModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreatePurchaseFormValues) => boolean;
}

interface ItemLineState {
  itemName: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxRate: number;
}

export const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
  opened,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation('purchases');
  const [vendorName, setVendorName] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState<string>(dayjs().add(30, 'day').format('YYYY-MM-DD'));
  const [paymentTerm, setPaymentTerm] = useState('Net 30');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<ItemLineState[]>([
    {
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 11,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { itemName: '', description: '', quantity: 1, unitPrice: 0, taxRate: 11 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = <K extends keyof ItemLineState>(
    index: number,
    field: K,
    value: ItemLineState[K]
  ) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const {
    subtotal,
    taxAmount: taxTotal,
    totalAmount,
  } = calculateTotals(
    items.map((it) => ({
      quantity: Number(it.quantity) || 0,
      unitPrice: Number(it.unitPrice) || 0,
      taxRate: it.taxRate || 0,
    }))
  );

  const handleSubmit = () => {
    if (!vendorName.trim()) return;
    if (!transactionDate || !dueDate) return;

    const success = onSubmit({
      vendorName,
      billNumber: billNumber.trim() || undefined,
      transactionDate,
      dueDate,
      paymentTerm,
      notes,
      items: items.map((it) => ({
        itemName: it.itemName.trim() || t('create.defaultItemName'),
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        taxRate: it.taxRate,
      })),
    });

    if (success) {
      onClose();
      // Reset form
      setVendorName('');
      setBillNumber('');
      setItems([{ itemName: '', description: '', quantity: 1, unitPrice: 0, taxRate: 11 }]);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={38} radius="md" color="primary" variant="light">
            <IconReceipt2 size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="dark.9">
              {t('create.title')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('create.subtitle')}
            </Text>
          </Box>
        </Group>
      }
      size="56rem"
      radius="lg"
      centered
      padding="lg"
    >
      <Stack gap="md">
        {/* Vendor & General Info */}
        <Grid gutter="sm">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('create.vendor')}
              placeholder={t('create.vendorPlaceholder')}
              value={vendorName}
              onChange={(e) => setVendorName(e.currentTarget.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('create.billNumber')}
              placeholder={t('create.billNumberPlaceholder')}
              value={billNumber}
              onChange={(e) => setBillNumber(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <DateInput
              label={t('create.transactionDate')}
              value={transactionDate ? new Date(transactionDate) : null}
              onChange={(val) => setTransactionDate(val ? dayjs(val).format('YYYY-MM-DD') : '')}
              valueFormat="DD/MM/YYYY"
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <DateInput
              label={t('create.dueDate')}
              value={dueDate ? new Date(dueDate) : null}
              onChange={(val) => setDueDate(val ? dayjs(val).format('YYYY-MM-DD') : '')}
              valueFormat="DD/MM/YYYY"
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label={t('create.paymentTerm')}
              value={paymentTerm}
              onChange={(val) => setPaymentTerm(val || 'Net 30')}
              data={[
                { value: 'Cash on Delivery', label: t('create.termCod') },
                { value: 'Net 15', label: t('create.termNet15') },
                { value: 'Net 30', label: t('create.termNet30') },
                { value: 'Net 60', label: t('create.termNet60') },
              ]}
            />
          </Grid.Col>
        </Grid>

        <Divider label={t('create.itemsDivider')} labelPosition="center" />

        {/* Item Lines Table */}
        <Box style={{ overflowX: 'auto' }}>
          <Table withTableBorder withColumnBorders style={{ minWidth: 600 }}>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th style={{ width: '40%' }}>{t('create.colItem')}</Table.Th>
                <Table.Th style={{ width: '15%' }}>{t('create.colQuantity')}</Table.Th>
                <Table.Th style={{ width: '25%' }}>{t('create.colUnitPrice')}</Table.Th>
                <Table.Th style={{ width: '15%' }}>{t('create.colTax')}</Table.Th>
                <Table.Th style={{ width: 45, textAlign: 'center' }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    <TextInput
                      placeholder={t('create.itemPlaceholder')}
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, 'itemName', e.currentTarget.value)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      min={1}
                      value={item.quantity}
                      onChange={(v) => handleItemChange(idx, 'quantity', v || 1)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      min={0}
                      thousandSeparator="."
                      decimalSeparator=","
                      value={item.unitPrice}
                      onChange={(v) => handleItemChange(idx, 'unitPrice', v || 0)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      value={String(item.taxRate)}
                      onChange={(v) => handleItemChange(idx, 'taxRate', Number(v) || 0)}
                      data={[
                        { value: '0', label: '0%' },
                        { value: '11', label: '11%' },
                        { value: '12', label: '12%' },
                      ]}
                    />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(idx)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>

        <Group justify="space-between" align="center">
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddItem}
          >
            {t('create.addItem')}
          </Button>

          {/* Totals Summary */}
          <Paper withBorder p="sm" radius="md" bg="gray.0" w={280}>
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('create.subtotal')}
                </Text>
                <Text size="xs" fw={600}>
                  {formatCurrency(subtotal)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('create.taxTotal')}
                </Text>
                <Text size="xs" fw={600}>
                  {formatCurrency(taxTotal)}
                </Text>
              </Group>
              <Divider my={2} />
              <Group justify="space-between">
                <Text size="sm" fw={700}>
                  {t('create.grandTotal')}
                </Text>
                <Text size="sm" fw={800} c="primary.8">
                  {formatCurrency(totalAmount)}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Group>

        <Textarea
          label={t('create.notes')}
          placeholder={t('create.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={2}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('create.cancel')}
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            {t('create.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
