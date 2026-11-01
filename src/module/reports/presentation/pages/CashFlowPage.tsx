import {
  Container,
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Select,
  Button,
  Flex,
  Box,
} from '@mantine/core';
import { themeColors } from '@/theme';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconChevronDown, IconFileExport } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { AppShellLayout } from '@/components/AppShellLayout';
import CashFlowTable from '@/module/reports/presentation/components/cash-flow/CashFlowTable';

import { useTranslation } from '@/i18n';
import { usePeriodOptions } from '@/module/reports/presentation/hooks/usePeriodOptions';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};
const CashFlowPage = () => {
  const { t } = useTranslation('reports');
  const periodOptions = usePeriodOptions();
  const lastDate = 'Sept 19, 2024 at 12:22:12 (GMT+7)';
  const totalBalanceSheet = 200000;
  return (
    <AppShellLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <Stack gap={1}>
              <Grid columns={0} align="center">
                <Grid.Col>
                  <Title order={3}>{t('cashFlow.title')}</Title>
                </Grid.Col>
              </Grid>
              <Text c={themeColors.gray[6]} fz="var(--jurnal-text-sm)">
                {t('common.latestData')} {lastDate}
              </Text>
            </Stack>
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack>
              <Flex gap="xs" justify="space-between" align="center" direction="row">
                <Grid columns={24} gutter="sm" style={{ flexGrow: 1 }}>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      placeholder={t('common.startDatePeriod')}
                      valueFormat="DD/MM/YYYY"
                      highlightToday
                      size="xs"
                      clearable
                      rightSection={<IconCalendar size={16} />}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      placeholder={t('common.endDatePeriod')}
                      valueFormat="DD/MM/YYYY"
                      highlightToday
                      size="xs"
                      rightSection={<IconCalendar size={16} />}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      checkIconPosition="right"
                      rightSection={<IconChevronDown size={16} />}
                      data={periodOptions}
                      placeholder={t('common.selectPeriod')}
                      defaultValue="All Period"
                      size="xs"
                    />
                  </Grid.Col>
                </Grid>

                <Button
                  leftSection={<IconFileExport size={14} />}
                  variant="default"
                  size="xs"
                  style={{ marginLeft: 'auto' }}
                >
                  {t('common.exportEn')}
                </Button>
              </Flex>
              <Stack gap={0}>
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
                      <Text c={themeColors.black[9]} fz="var(--jurnal-text-sm)" fw={500}>
                        {t('common.report')}
                      </Text>
                      <Text c={themeColors.gray[6]} fz="var(--jurnal-text-sm)" fw={500}>
                        {t('common.period')} {lastDate}
                      </Text>
                    </Stack>
                    <Text c={themeColors.black[9]} fz="var(--jurnal-text-sm)" fw={500}>
                      {t('common.totalColon')} {formatCurrency(totalBalanceSheet)}
                    </Text>
                  </Group>
                </Box>
                <CashFlowTable />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default CashFlowPage;
