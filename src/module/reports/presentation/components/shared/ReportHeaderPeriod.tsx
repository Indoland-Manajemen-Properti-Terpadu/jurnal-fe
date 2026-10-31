import { themeColors } from '@/theme';
import { dateFormatV2 } from '@/utils/formatDate';
import { Box, Group, Stack, Text } from '@mantine/core';

import { useTranslation } from '@/i18n';

interface ReportHeaderPeriodProps {
  fromDate: string;
  toDate: string;
}

const ReportHeaderPeriod: React.FC<ReportHeaderPeriodProps> = ({ fromDate, toDate }) => {
  const { t } = useTranslation('reports');
  return (
    <Box
      bg={themeColors.primary[0]}
      bd="sm"
      p={10}
      style={{
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderColor: themeColors.gray[1],
        borderStyle: 'solid',
        borderWidth: '1px',
        borderBottomWidth: '0px',
      }}
    >
      <Group justify="space-between">
        <Stack gap={1}>
          <Text c={themeColors.black[9]} fz={14} fw={500}>
            {t('common.report')}
          </Text>
          <Text c={themeColors.gray[6]} fz={14} fw={500}>
            {t('common.period')} {dateFormatV2(fromDate)} - {dateFormatV2(toDate)}
          </Text>
        </Stack>
        <Text c={themeColors.black[9]} fz={14} fw={500}>
          {t('common.total')}{' '}
        </Text>
      </Group>
    </Box>
  );
};

export default ReportHeaderPeriod;
