import { Container, Grid, Paper, Stack, Title, Group, Select, Button, Flex } from '@mantine/core';
import { gradientColors } from '@/theme';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconChevronDown, IconFileExport } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useState } from 'react';

import { useTranslation } from '@/i18n';
import { usePeriodOptions } from '@/module/reports/presentation/hooks/usePeriodOptions';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};
const BudgetManagementPage = () => {
  const { t } = useTranslation('reports');
  const periodOptions = usePeriodOptions();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>('All Period');

  return (
    <AppShellLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <Group justify="space-between">
              <Stack gap={1}>
                <Grid columns={0} align="center">
                  <Grid.Col>
                    <Title order={3}>{t('budget.title')}</Title>
                  </Grid.Col>
                </Grid>
              </Stack>
              <Group>
                <Select
                  checkIconPosition="right"
                  clearable={!!selectedPeriod}
                  rightSection={!selectedPeriod ? <IconChevronDown size={16} /> : null}
                  data={['Budget Testing 1', 'Budget Testing 2']}
                  placeholder={t('common.selectPeriod')}
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                />
                <Button
                  variant="gradient"
                  gradient={gradientColors.gradient}
                  // onClick={() => navigate(routes.chartOfAccounts.add)}
                >
                  {t('budget.add')}
                </Button>
              </Group>
            </Group>
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
                      value={startDate}
                      onChange={setStartDate}
                      clearable={!!startDate}
                      rightSection={!startDate ? <IconCalendar size={16} /> : null}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DatePickerInput
                      placeholder={t('common.endDatePeriod')}
                      valueFormat="DD/MM/YYYY"
                      highlightToday
                      size="xs"
                      value={endDate}
                      onChange={setEndDate}
                      clearable={!!endDate}
                      rightSection={!endDate ? <IconCalendar size={16} /> : null}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      checkIconPosition="right"
                      clearable={!!selectedPeriod}
                      rightSection={!selectedPeriod ? <IconChevronDown size={16} /> : null}
                      data={periodOptions}
                      placeholder={t('common.selectPeriod')}
                      value={selectedPeriod}
                      onChange={setSelectedPeriod}
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
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
};

export default BudgetManagementPage;
