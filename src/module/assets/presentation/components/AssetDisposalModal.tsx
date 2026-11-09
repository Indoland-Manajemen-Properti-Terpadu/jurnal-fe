import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertTriangle, IconCalendar, IconScale } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import type { AssetItem, DisposalValues } from '@/module/assets/domain/asset';
import {
  estimateDisposalGainLoss,
  validateDisposal,
  type DisposalKind,
} from '@/module/assets/domain/assetRules';
import { AccountSelect } from '@/module/assets/presentation/components/AccountSelect';
import { AssetModalTitle } from '@/module/assets/presentation/components/AssetModalTitle';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { MoneyInput } from '@/module/assets/presentation/components/MoneyInput';
import {
  useAssetAccounts,
  useDisposeAsset,
} from '@/module/assets/presentation/hooks/useAssetQueries';

export type AssetDisposalModalProps = {
  asset: AssetItem;
  onClose: () => void;
};

const todayIso = () => dayjs().format('YYYY-MM-DD');
const PROCEEDS_TYPES = ['Kas & Bank', 'Akun Piutang'];
const GAIN_LOSS_TYPES = ['Beban Lainnya', 'Pendapatan Lainnya'];

function ResultRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Group>
  );
}

export function AssetDisposalModal({ asset, onClose }: Readonly<AssetDisposalModalProps>) {
  const { t } = useTranslation('assets');
  const accounts = useAssetAccounts(true);
  const dispose = useDisposeAsset(asset.id);
  const [today] = useState(todayIso);
  const [kind, setKind] = useState<DisposalKind>('sold');

  const form = useForm<DisposalValues>({
    initialValues: {
      disposalDate: today,
      disposalPrice: 0,
      proceedsAccount: '',
      gainLossAccount: '',
    },
    validate: (values) =>
      Object.fromEntries(
        Object.entries(validateDisposal(values, today, kind)).map(([field, key]) => [field, t(key)])
      ),
  });

  const changeKind = (next: DisposalKind) => {
    setKind(next);
    if (next === 'scrapped') {
      form.setFieldValue('disposalPrice', 0);
      form.setFieldValue('proceedsAccount', '');
    }
    form.clearErrors();
  };

  const handleSubmit = async (values: DisposalValues) => {
    try {
      await dispose.mutateAsync(values);
      onClose();
    } catch {
      // The mutation already shows the failure; the form stays open with the entered values.
    }
  };

  const sold = kind === 'sold';
  const price = sold ? form.values.disposalPrice : 0;
  const gainLoss = estimateDisposalGainLoss(price, asset.netBookValue);
  const resultLabel =
    gainLoss > 0 ? t('estimatedGain') : gainLoss < 0 ? t('estimatedLoss') : t('estimatedBreakEven');
  const resultColor = gainLoss > 0 ? 'teal.8' : gainLoss < 0 ? 'orange.8' : 'dark.8';

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <AssetModalTitle
          icon={IconScale}
          title={t('disposeTitle')}
          subtitle={`${asset.code} · ${asset.name}`}
        />
      }
      size="xl"
      radius="lg"
      centered
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, sm: 7 }}>
              <Stack gap="md">
                <Box>
                  <Text size="sm" fw={500} mb={6}>
                    {t('disposalKindLabel')}
                  </Text>
                  <SegmentedControl
                    fullWidth
                    value={kind}
                    onChange={(value) => changeKind(value as DisposalKind)}
                    data={[
                      { value: 'sold', label: t('disposalSold') },
                      { value: 'scrapped', label: t('disposalScrapped') },
                    ]}
                  />
                </Box>

                <DateInput
                  label={t('disposalDateLabel')}
                  placeholder={t('datePlaceholder')}
                  valueFormat="DD/MM/YYYY"
                  maxDate={new Date()}
                  withAsterisk
                  size="sm"
                  leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
                  value={form.values.disposalDate ? new Date(form.values.disposalDate) : null}
                  onChange={(date) =>
                    form.setFieldValue('disposalDate', date ? dayjs(date).format('YYYY-MM-DD') : '')
                  }
                  error={form.errors.disposalDate}
                />

                {sold && (
                  <>
                    <MoneyInput
                      label={t('disposalPriceLabel')}
                      withAsterisk
                      value={form.values.disposalPrice}
                      onChange={(value) => form.setFieldValue('disposalPrice', value)}
                      error={form.errors.disposalPrice}
                    />
                    <AccountSelect
                      label={t('proceedsAccountLabel')}
                      description={t('proceedsAccountHint')}
                      placeholder={t('accountPlaceholder')}
                      value={form.values.proceedsAccount}
                      onChange={(id) => form.setFieldValue('proceedsAccount', id)}
                      options={accounts.data ?? []}
                      preferredTypes={PROCEEDS_TYPES}
                      error={form.errors.proceedsAccount as string | undefined}
                      required
                      loading={accounts.isLoading}
                    />
                  </>
                )}

                <AccountSelect
                  label={t('gainLossAccountLabel')}
                  description={t('gainLossAccountHint')}
                  placeholder={t('accountPlaceholder')}
                  value={form.values.gainLossAccount}
                  onChange={(id) => form.setFieldValue('gainLossAccount', id)}
                  options={accounts.data ?? []}
                  preferredTypes={GAIN_LOSS_TYPES}
                  loading={accounts.isLoading}
                />
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 5 }}>
              <Paper withBorder radius="md" p="md" bg="gray.0">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="md">
                  {t('disposalPreviewTitle')}
                </Text>
                <Stack gap="sm">
                  <ResultRow
                    label={t('bookValueNow')}
                    value={formatAssetMoney(asset.netBookValue)}
                  />
                  <ResultRow
                    label={t('disposalPriceLabel')}
                    value={sold ? formatAssetMoney(price) : t('scrappedValue')}
                  />
                  <Divider />
                  <Box>
                    <Text size="sm" fw={600}>
                      {resultLabel}
                    </Text>
                    <Text
                      fz={26}
                      fw={700}
                      c={resultColor}
                      lh={1.2}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatAssetMoney(Math.abs(gainLoss))}
                    </Text>
                  </Box>
                  <Text size="xs" c="dimmed" lh={1.5}>
                    {t('disposalPreviewHint')}
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          <Group justify="space-between" align="center" gap="sm" wrap="wrap">
            <Group gap={6} wrap="nowrap">
              <IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />
              <Text size="xs" c="dimmed">
                {t('disposeIrreversible')}
              </Text>
            </Group>
            <Group gap="sm">
              <Button variant="default" radius="md" onClick={onClose} disabled={dispose.isPending}>
                {t('cancel')}
              </Button>
              <Button type="submit" radius="md" loading={dispose.isPending}>
                {t('disposeAction')}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default AssetDisposalModal;
