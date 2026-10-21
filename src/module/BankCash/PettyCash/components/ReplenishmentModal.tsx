import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { IconBuildingBank, IconRefresh, IconScale } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { dateFormatV1 } from '@/utils/FormatDate';
import { PettyCashFund, PettyCashReimbursement, PettyCashVoucher } from '../types/pettyCash.types';

interface Props {
  opened: boolean;
  onClose: () => void;
  funds: PettyCashFund[];
  selectedFund?: PettyCashFund | null;
  vouchers: PettyCashVoucher[];
  onSubmitReimbursement: (newReimbursement: PettyCashReimbursement) => void;
}

export const ReplenishmentModal: React.FC<Props> = ({
  opened,
  onClose,
  funds,
  selectedFund,
  vouchers,
  onSubmitReimbursement,
}) => {
  const [fundId, setFundId] = useState<string>(selectedFund?.id || funds[0]?.id || '');
  const activeFund = funds.find((f) => f.id === fundId) || selectedFund || funds[0];

  // Bank Account Selection
  const [bankId, setBankId] = useState<string>(activeFund?.bankSourceAccount.id || 'bank-bca-ops');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (opened && selectedFund) {
      setFundId(selectedFund.id);
      setBankId(selectedFund.bankSourceAccount.id);
    }
  }, [opened, selectedFund]);

  // Eligible vouchers for this fund
  const eligibleVouchers = useMemo(
    () =>
      vouchers.filter(
        (v) =>
          v.fundId === activeFund?.id && (v.status === 'PENDING_REIMBURSE' || v.status === 'PAID')
      ),
    [vouchers, activeFund?.id]
  );

  // Selected voucher IDs for this reimbursement
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>(
    eligibleVouchers.map((v) => v.id)
  );

  // Sync selection when fund changes
  React.useEffect(() => {
    setSelectedVoucherIds(eligibleVouchers.map((v) => v.id));
  }, [eligibleVouchers]);

  const selectedVoucherObjects = useMemo(
    () => eligibleVouchers.filter((v) => selectedVoucherIds.includes(v.id)),
    [eligibleVouchers, selectedVoucherIds]
  );

  const totalReimburseAmount = selectedVoucherObjects.reduce((acc, v) => acc + (v.amount || 0), 0);

  // Expense grouping for accounting journal preview
  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, { code: string; name: string; amount: number }>();
    selectedVoucherObjects.forEach((v) => {
      const existing = map.get(v.expenseAccount.code);
      if (existing) {
        existing.amount += v.amount;
      } else {
        map.set(v.expenseAccount.code, {
          code: v.expenseAccount.code,
          name: v.expenseAccount.name,
          amount: v.amount,
        });
      }
    });
    return Array.from(map.values());
  }, [selectedVoucherObjects]);

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVoucherIds(eligibleVouchers.map((v) => v.id));
    } else {
      setSelectedVoucherIds([]);
    }
  };

  const handleToggleSingle = (id: string) => {
    setSelectedVoucherIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !activeFund ||
      activeFund.status === 'FROZEN' ||
      selectedVoucherIds.length === 0 ||
      totalReimburseAmount <= 0
    ) {
      return;
    }

    const now = new Date();
    const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const reimbursementNumber = `PCR/${period}/${String(now.getTime()).slice(-6)}`;

    onSubmitReimbursement({
      id: `rem-${Date.now()}`,
      fundId: activeFund.id,
      fundName: activeFund.name,
      reimbursementNumber,
      date: new Date().toISOString(),
      totalAmount: totalReimburseAmount,
      voucherCount: selectedVoucherIds.length,
      voucherIds: selectedVoucherIds,
      bankAccountId: bankId,
      bankAccountName: selectedBank?.name ?? activeFund.bankSourceAccount.name,
      bankAccountNumber: selectedBank?.accountNumber ?? activeFund.bankSourceAccount.accountNumber,
      status: 'SUBMITTED',
      notes: notes.trim(),
      requestedBy: activeFund.custodianName,
      expenseBreakdown: expenseBreakdown.map((item) => ({
        accountCode: item.code,
        accountName: item.name,
        amount: item.amount,
      })),
    });

    onClose();
  };

  const fundSelectData = funds.map((f) => ({
    value: f.id,
    label: `${f.name} (Pagu: ${formatCurrency(f.pagu)})`,
    disabled: f.status === 'FROZEN',
  }));

  const bankSelectData = [
    {
      value: 'bank-bca-ops',
      label: '1-1201 • Bank BCA Operasional IDR (829-0123-456)',
      name: 'Bank BCA Operasional IDR',
      accountNumber: '829-0123-456',
    },
    {
      value: 'bank-mandiri-ops',
      label: '1-1202 • Bank Mandiri Giro Operasional (123-00-9876543-2)',
      name: 'Bank Mandiri Giro Operasional',
      accountNumber: '123-00-9876543-2',
    },
  ];
  const selectedBank = bankSelectData.find((bank) => bank.value === bankId);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="md"
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" variant="light" color="primary">
            <IconRefresh size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={15} c="dark.9">
              Pengajuan Pengisian Kembali Kas Kecil (Reimbursement)
            </Text>
            <Text fz={11} c="dimmed">
              Metode Imprest: Penggantian dana atas bukti pengeluaran yang telah diverifikasi
            </Text>
          </div>
        </Group>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Fund & Bank Selector */}
          <Group grow align="flex-start">
            <Select
              label="Dana Kas Kecil yang Diganti"
              placeholder="Pilih akun kas kecil..."
              data={fundSelectData}
              value={fundId}
              onChange={(val) => val && setFundId(val)}
              required
            />
            <Select
              label="Rekening Bank Sumber Penggantian"
              placeholder="Pilih rekening bank pencair..."
              data={bankSelectData}
              value={bankId}
              onChange={(val) => val && setBankId(val)}
              leftSection={<IconBuildingBank size={16} />}
              required
            />
          </Group>

          {/* Fund Status Strip */}
          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Group justify="space-between" wrap="wrap">
              <div>
                <Text size="xs" c="dimmed">
                  Pagu Tetap (Limit):{' '}
                  <Text span fw={700} c="dark.8">
                    {formatCurrency(activeFund?.pagu || 0)}
                  </Text>
                </Text>
                <Text size="xs" c="dimmed">
                  Kas Fisik Saat Ini:{' '}
                  <Text span fw={700} c="teal.8">
                    {formatCurrency(activeFund?.currentBalance || 0)}
                  </Text>
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="dimmed">
                  Estimasi Kas Setelah Reimburse:{' '}
                  <Text span fw={800} c="teal.9">
                    {formatCurrency((activeFund?.currentBalance || 0) + totalReimburseAmount)}
                  </Text>
                </Text>
              </div>
            </Group>
          </Paper>

          {/* Vouchers Checklist Table */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Text fw={700} fz={13} c="dark.9">
                Pilih Voucher Pengeluaran untuk Diganti ({selectedVoucherIds.length} terpilih)
              </Text>
              <Checkbox
                label="Pilih Semua Voucher"
                size="xs"
                checked={
                  eligibleVouchers.length > 0 &&
                  selectedVoucherIds.length === eligibleVouchers.length
                }
                indeterminate={
                  selectedVoucherIds.length > 0 &&
                  selectedVoucherIds.length < eligibleVouchers.length
                }
                onChange={(e) => handleToggleSelectAll(e.currentTarget.checked)}
              />
            </Group>

            <Paper
              withBorder
              radius="md"
              bg="white"
              style={{ overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}
            >
              {eligibleVouchers.length === 0 ? (
                <Box p="md" ta="center">
                  <Text size="xs" c="dimmed">
                    Tidak ada voucher berstatus belum diganti pada kas kecil ini.
                  </Text>
                </Box>
              ) : (
                <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
                  <Table.Thead bg="gray.0">
                    <Table.Tr>
                      <Table.Th style={{ width: 40 }} />
                      <Table.Th>No. Voucher</Table.Th>
                      <Table.Th>Tanggal</Table.Th>
                      <Table.Th>Keperluan</Table.Th>
                      <Table.Th>Akun Beban</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Nominal</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {eligibleVouchers.map((v) => {
                      const isChecked = selectedVoucherIds.includes(v.id);
                      return (
                        <Table.Tr
                          key={v.id}
                          style={{
                            backgroundColor: isChecked
                              ? 'var(--mantine-color-primary-0)'
                              : undefined,
                          }}
                        >
                          <Table.Td>
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleToggleSingle(v.id)}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Text fz={12} fw={700} ff="monospace" c="primary.9">
                              {v.voucherNumber}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz={11} c="dimmed">
                              {dateFormatV1(v.date)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz={12} c="dark.8" lineClamp={1}>
                              {v.description}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge size="xs" variant="light" color="gray" radius="sm">
                              {v.expenseAccount.code}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Text fz={12} fw={700} c="dark.8" ff="monospace">
                              {formatCurrency(v.amount)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </Box>

          {/* Double-Entry Auto Journal Preview */}
          <Paper withBorder radius="md" p="md" bg="gray.0">
            <Group justify="space-between" mb="xs">
              <Group gap={6}>
                <ThemeIcon size={24} radius="md" variant="light" color="primary">
                  <IconScale size={14} />
                </ThemeIcon>
                <Text fw={700} fz={12} c="dark.9">
                  Simulasi Otomatis Jurnal Pengisian Kembali (General Ledger)
                </Text>
              </Group>
              <Badge color="primary" variant="light" size="sm">
                Seimbang: {formatCurrency(totalReimburseAmount)}
              </Badge>
            </Group>

            <Text fz={11} c="dimmed" mb="xs">
              Saat pengisian kembali ini dicairkan, sistem akan mendebit seluruh akun beban
              operasional dan mengkredit rekening bank penarik:
            </Text>

            <Box
              p="xs"
              bg="white"
              style={{
                borderRadius: 6,
                border: '1px solid var(--mantine-color-gray-2)',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
            >
              {expenseBreakdown.map((item) => (
                <Group key={item.code} justify="space-between" py={2}>
                  <Text fz={11} c="dark.8">
                    (Dr) {item.code} - {item.name}
                  </Text>
                  <Text fz={11} fw={700} c="dark.8">
                    {formatCurrency(item.amount)}
                  </Text>
                </Group>
              ))}
              <Divider my={4} />
              <Group justify="space-between" py={2}>
                <Text fz={11} c="dark.8">
                  (Cr) {selectedBank?.label ?? activeFund?.bankSourceAccount.name}
                </Text>
                <Text fz={11} fw={700} c="dark.8">
                  {formatCurrency(totalReimburseAmount)}
                </Text>
              </Group>
            </Box>
          </Paper>

          <Textarea
            label="Catatan Pengajuan (Opsional)"
            placeholder="Catatan tambahan untuk verifikasi bagian keuangan..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="filled"
              color="primary"
              disabled={selectedVoucherIds.length === 0 || totalReimburseAmount <= 0}
              leftSection={<IconRefresh size={16} />}
            >
              Ajukan Pengisian Kembali ({formatCurrency(totalReimburseAmount)})
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default ReplenishmentModal;
