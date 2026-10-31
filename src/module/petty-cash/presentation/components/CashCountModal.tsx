import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import type {
  PettyCashCount,
  PettyCashFund,
  PettyCashVoucher,
} from '@/module/petty-cash/domain/pettyCashTypes';
import classes from '@/module/petty-cash/presentation/components/PettyCashOverlay.module.css';

import { calculateCashCount } from '@/module/petty-cash/domain/cashCount';
import { useTranslation } from '@/i18n';

interface Props {
  opened: boolean;
  onClose: () => void;
  funds: PettyCashFund[];
  selectedFund?: PettyCashFund | null;
  vouchers: PettyCashVoucher[];
  onSubmitCount: (newCount: PettyCashCount) => void;
}

const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000];

const emptyCounts = () => Object.fromEntries(DENOMINATIONS.map((value) => [value, 0]));

export function CashCountModal({
  opened,
  onClose,
  funds,
  selectedFund,
  vouchers,
  onSubmitCount,
}: Props) {
  const { t: tp } = useTranslation('pettyCash');
  const [fundId, setFundId] = useState(selectedFund?.id || funds[0]?.id || '');
  const [counts, setCounts] = useState<Record<number, number>>(emptyCounts);
  const [witnessBy, setWitnessBy] = useState('');
  const [notes, setNotes] = useState('');
  const activeFund = funds.find((fund) => fund.id === fundId) || selectedFund || funds[0];

  useEffect(() => {
    if (!opened) return;
    setFundId(selectedFund?.id || funds[0]?.id || '');
    setCounts(emptyCounts());
    setWitnessBy('');
    setNotes('');
  }, [funds, opened, selectedFund]);

  const pagu = activeFund?.pagu || 0;
  const { totalPhysicalCash, totalUnreimbursedVouchers, actualTotal, variance, status } = useMemo(
    () =>
      calculateCashCount({
        fundId: activeFund?.id,
        pagu,
        denominations: DENOMINATIONS,
        counts,
        vouchers,
      }),
    [activeFund?.id, pagu, counts, vouchers]
  );
  const hasCountStarted = Object.values(counts).some((count) => count > 0);

  const handleFundChange = (value: string | null) => {
    if (!value) return;
    setFundId(value);
    setCounts(emptyCounts());
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!activeFund || activeFund.status === 'FROZEN' || !witnessBy.trim()) return;

    const now = new Date();
    const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    onSubmitCount({
      id: `cc-${now.getTime()}`,
      fundId: activeFund.id,
      fundName: activeFund.name,
      countNumber: `BAO/${period}/${String(now.getTime()).slice(-6)}`,
      date: now.toISOString(),
      countedBy: activeFund.custodianName,
      witnessBy: witnessBy.trim(),
      denominations: DENOMINATIONS.map((value) => ({
        value,
        label: formatCurrency(value),
        count: counts[value] || 0,
        subtotal: value * (counts[value] || 0),
      })),
      totalPhysicalCash,
      totalUnreimbursedVouchers,
      actualTotal,
      pagu,
      variance,
      status,
      notes: notes.trim(),
    });
    onClose();
  };

  const varianceTone = !hasCountStarted
    ? undefined
    : status === 'BALANCED'
      ? 'success'
      : status === 'SHORT'
        ? 'danger'
        : 'warning';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={880}
      radius="lg"
      padding={0}
      classNames={{ header: classes.modalHeader, body: classes.modalBody }}
      title={
        <Box>
          <Text fw={650} fz="lg" c="dark.9">
            {tp('cashCount.title')}
          </Text>
          <Text fz="sm" c="dimmed" mt={2}>
            {tp('cashCount.subtitle')}
          </Text>
        </Box>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Select
            label={tp('cashCount.fund')}
            data={funds.map((fund) => ({
              value: fund.id,
              label: fund.name,
              disabled: fund.status === 'FROZEN',
            }))}
            value={fundId}
            onChange={handleFundChange}
            required
          />

          <Box>
            <Group justify="space-between" mb="xs">
              <Text fz="sm" fw={650}>
                {tp('cashCount.physicalCash')}
              </Text>
              <Text fz="xs" c="dimmed">
                {tp('cashCount.physicalHint')}
              </Text>
            </Group>
            <Box className={classes.countSheet}>
              {DENOMINATIONS.map((value) => (
                <Box className={classes.countRow} key={value}>
                  <Text fz="sm" fw={550}>
                    {formatCurrency(value)}
                  </Text>
                  <NumberInput
                    aria-label={tp('cashCount.denominationAria', { value: formatCurrency(value) })}
                    min={0}
                    max={1000}
                    value={counts[value] || 0}
                    onChange={(quantity) =>
                      setCounts((current) => ({
                        ...current,
                        [value]: Math.max(0, typeof quantity === 'number' ? quantity : 0),
                      }))
                    }
                    size="xs"
                    styles={{ input: { textAlign: 'center' } }}
                  />
                  <Text className={classes.countSubtotal} fz="sm" fw={600} ta="right">
                    {formatCurrency(value * (counts[value] || 0))}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={classes.summary}>
            {[
              [tp('cashCount.counted'), totalPhysicalCash],
              [tp('cashCount.pendingVouchers'), totalUnreimbursedVouchers],
              [tp('cashCount.ceiling'), pagu],
              [tp('cashCount.variance'), variance],
            ].map(([label, value]) => (
              <Box className={classes.summaryItem} key={String(label)}>
                <Text fz={11} c="dimmed">
                  {label}
                </Text>
                <Text fz="sm" fw={650} mt={3}>
                  {formatCurrency(Number(value))}
                </Text>
              </Box>
            ))}
          </Box>

          <Box className={classes.varianceNote} data-tone={varianceTone}>
            <IconInfoCircle size={18} style={{ flex: '0 0 auto' }} />
            <Text fz="xs" lh={1.5}>
              {!hasCountStarted
                ? tp('cashCount.hintStart')
                : status === 'BALANCED'
                  ? tp('cashCount.hintBalanced')
                  : status === 'SHORT'
                    ? tp('cashCount.hintShort', { amount: formatCurrency(Math.abs(variance)) })
                    : tp('cashCount.hintOver', { amount: formatCurrency(variance) })}
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label={tp('cashCount.witness')}
              placeholder={tp('cashCount.witnessPlaceholder')}
              value={witnessBy}
              onChange={(event) => setWitnessBy(event.currentTarget.value)}
              required
            />
            <TextInput
              label={tp('cashCount.notes')}
              placeholder={tp('cashCount.optional')}
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
            />
          </SimpleGrid>

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              {tp('common.cancel')}
            </Button>
            <Button type="submit" color="primary" leftSection={<IconCheck size={16} />}>
              {tp('cashCount.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default CashCountModal;
