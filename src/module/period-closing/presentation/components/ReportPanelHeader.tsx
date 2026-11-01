import { Group, Stack, Text } from '@mantine/core';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { PROTOTYPE_COMPANY_NAME, PROTOTYPE_PERIOD_END } from '../../domain/prototypeData';

const ReportPanelHeader = ({ title }: { title: string }) => {
  const { t } = useTranslation('periodClosing');

  return (
    <Group justify="space-between">
      <Stack gap={1}>
        <Text fw={500} fz="var(--jurnal-text-lg)" c={themeColors.slate[8]}>
          {` ${title}`}
        </Text>
        <Text fw={400} fz="var(--jurnal-text-sm)" c={themeColors.gray[6]}>
          {` ${t('common.periodShort', { date: PROTOTYPE_PERIOD_END })}`}
        </Text>
      </Stack>
      <Text fw={500} fz="var(--jurnal-text-lg)" c={themeColors.slate[8]}>
        {` ${PROTOTYPE_COMPANY_NAME}`}
      </Text>
    </Group>
  );
};

export default ReportPanelHeader;
