import { useState } from 'react';
import {
  Alert,
  Badge,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconInfoCircle, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import { useGeneralSettings } from '@/module/settings/presentation/hooks/useSettingQueries';

const previewAmount = 1459200.5678;

export default function GeneralSettingPage() {
  const { t, currentLanguage } = useTranslation('settings');
  const general = useGeneralSettings();
  const [previewPrecision, setPreviewPrecision] = useState('2');
  const [amount, setAmount] = useState<number>(previewAmount);
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';
  const format = (value: number, digits: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  return (
    <SettingsLayout title={t('generalTitle')} description={t('generalDescription')}>
      <Stack gap="lg">
        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }}>
          <Group justify="space-between" align="flex-start" mb="lg">
            <div>
              <Text fw={700} fz="lg">
                {t('currentPrecision')}
              </Text>
              <Text c="dimmed" fz="sm">
                {t('currentPrecisionDescription')}
              </Text>
            </div>
            <Badge color="primary" variant="light">
              {t('readOnly')}
            </Badge>
          </Group>
          {general.isPending ? (
            <Skeleton height={48} width={170} />
          ) : general.isError ? (
            <Alert color="red" icon={<IconInfoCircle size={18} />}>
              {t('loadGeneralError')}
            </Alert>
          ) : (
            <Text fw={750} fz={32} c="primary.8">
              {t('precisionValue', { count: general.data?.decimalPrecision ?? 0 })}
            </Text>
          )}
          <Alert color="blue" variant="light" icon={<IconLock size={18} />} mt="lg">
            {t('precisionLockedReason')}
          </Alert>
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }}>
          <Text fw={700} fz="lg">
            {t('previewTitle')}
          </Text>
          <Text c="dimmed" fz="sm" mb="lg">
            {t('previewDescription')}
          </Text>
          <Stack gap="md">
            <SegmentedControl
              aria-label={t('previewPrecision')}
              data={[0, 2, 3, 4].map((digits) => ({
                value: String(digits),
                label: t('precisionValue', { count: digits }),
              }))}
              value={previewPrecision}
              onChange={setPreviewPrecision}
              fullWidth
            />
            <NumberInput
              label={t('sampleAmount')}
              value={amount}
              onChange={(value) => setAmount(Number(value) || 0)}
              decimalScale={4}
              thousandSeparator={currentLanguage === 'id' ? '.' : ','}
              decimalSeparator={currentLanguage === 'id' ? ',' : '.'}
            />
            <Paper withBorder radius="md" p="lg" bg="primary.0">
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed">
                {t('formattedResult')}
              </Text>
              <Text
                fz={{ base: 25, sm: 32 }}
                fw={750}
                c="primary.8"
                style={{ overflowWrap: 'anywhere' }}
              >
                {format(amount, Number(previewPrecision))}
              </Text>
              <Text fz="xs" c="dimmed" mt="xs">
                {t('previewOnly')}
              </Text>
            </Paper>
          </Stack>
        </Paper>
      </Stack>
    </SettingsLayout>
  );
}
