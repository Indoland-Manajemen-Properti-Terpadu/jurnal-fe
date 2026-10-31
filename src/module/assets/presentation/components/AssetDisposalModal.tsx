import React, { useState, useEffect } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { IconAlertTriangle, IconCalendar, IconScale } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { AssetItem } from '@/module/assets/domain/asset';
import { calculateDisposalGainLoss } from '@/module/assets/domain/depreciation';
import { useTranslation } from '@/i18n';

export type AssetDisposalModalProps = {
  opened: boolean;
  onClose: () => void;
  asset: AssetItem | null;
  onConfirmDisposal: (id: string, disposalDate: string, disposalPrice: number) => void;
};

export const AssetDisposalModal: React.FC<AssetDisposalModalProps> = ({
  opened,
  onClose,
  asset,
  onConfirmDisposal,
}) => {
  const { t } = useTranslation('assets');

  const [disposalDate, setDisposalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [disposalPrice, setDisposalPrice] = useState<number>(0);

  useEffect(() => {
    if (asset) {
      setDisposalPrice(asset.netBookValue);
      setDisposalDate(new Date().toISOString().split('T')[0]);
    }
  }, [asset, opened]);

  if (!asset) return null;

  const nbv = asset.netBookValue;
  const gainLoss = calculateDisposalGainLoss(disposalPrice, nbv);
  const isGain = gainLoss > 0;
  const isLoss = gainLoss < 0;

  const handleConfirm = () => {
    onConfirmDisposal(asset.id, disposalDate, disposalPrice);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="md">
          {t('disposalModalTitle')}
        </Text>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('disposalModalSubtitle')}
        </Text>

        {/* Asset summary */}
        <Paper withBorder radius="md" p="sm" bg="gray.0">
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xs" c="dimmed">
                {t('disposalAssetLabel')}
              </Text>
              <Text size="sm" fw={700} c="dark.8">
                {asset.name}
              </Text>
              <Badge size="xs" variant="outline" color="gray" mt={2}>
                {asset.code}
              </Badge>
            </Box>
            <Box style={{ textAlign: 'right' }}>
              <Text size="xs" c="dimmed">
                {t('currentBookValueInfo')}:
              </Text>
              <Text size="sm" fw={800} c="primary.8">
                {formatCurrency(nbv)}
              </Text>
            </Box>
          </Group>
        </Paper>

        <DateInput
          label={t('disposalDate')}
          placeholder={t('disposalDatePlaceholder')}
          valueFormat="DD/MM/YYYY"
          required
          size="sm"
          value={disposalDate ? new Date(disposalDate) : null}
          onChange={(val) => setDisposalDate(val ? dayjs(val).format('YYYY-MM-DD') : '')}
          rightSection={<IconCalendar size={16} color="var(--mantine-color-dimmed)" />}
        />

        <NumberInput
          label={t('disposalPrice')}
          description={t('disposalPriceDesc')}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          min={0}
          size="sm"
          value={disposalPrice}
          onChange={(val) => setDisposalPrice(Number(val) || 0)}
        />

        {/* Live Gain / Loss Indicator */}
        <Paper
          withBorder
          radius="md"
          p="sm"
          bg={isGain ? 'teal.0' : isLoss ? 'red.0' : 'gray.0'}
          style={{
            borderColor: isGain
              ? 'var(--mantine-color-teal-3)'
              : isLoss
                ? 'var(--mantine-color-red-3)'
                : 'var(--mantine-color-gray-3)',
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon
                size={28}
                radius="sm"
                variant="light"
                color={isGain ? 'teal' : isLoss ? 'red' : 'gray'}
              >
                <IconScale size={16} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed">
                  {t('disposalResultLabel')}
                </Text>
                <Text size="sm" fw={700} c={isGain ? 'teal.8' : isLoss ? 'red.8' : 'dark.7'}>
                  {isGain ? t('gain') : isLoss ? t('loss') : t('breakEven')}
                </Text>
              </Box>
            </Group>

            <Text
              size="md"
              fw={800}
              c={isGain ? 'teal.8' : isLoss ? 'red.8' : 'dark.8'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {gainLoss > 0 ? `+${formatCurrency(gainLoss)}` : formatCurrency(gainLoss)}
            </Text>
          </Group>
        </Paper>

        <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light" radius="md">
          {t('disposalWarning')}
        </Alert>

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button color="red" variant="filled" onClick={handleConfirm}>
            {t('processDisposal')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AssetDisposalModal;
