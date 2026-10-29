import { Container, Paper, rem, Stack, Tabs, Text, Title } from '@mantine/core';
import { IconChartBar, IconExchange, IconFileDollar, IconScale } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import { PROTOTYPE_PERIOD_END } from '../../domain/prototypeData';
import BalanceSheetTable from '../components/BalanceSheet/BalanceSheetTable';
import CashFlowTable from '../components/CashFlow/CashFlowTable';
import IncomeStatementTable from '../components/IncomeStatement/IncomeStatementTable';
import PeriodFooter from '../components/PeriodFooter';
import ReportPanelHeader from '../components/ReportPanelHeader';
import TrialBalanceTable from '../components/TrialBalanceTable';
import PeriodClosingLayout from './PeriodClosingLayout';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

const FinancialStatementPage = () => {
  const { t } = useTranslation('periodClosing');
  const navigate = useNavigate();
  const iconStyle = { width: rem(12), height: rem(12) };
  const panels = [
    {
      value: 'trial-balance',
      label: t('financialStatement.trialBalance'),
      icon: IconScale,
      body: <TrialBalanceTable />,
    },
    {
      value: 'income-statement',
      label: t('financialStatement.incomeStatement'),
      icon: IconChartBar,
      body: <IncomeStatementTable />,
    },
    {
      value: 'balance-sheet',
      label: t('financialStatement.balanceSheet'),
      icon: IconFileDollar,
      body: <BalanceSheetTable />,
    },
    {
      value: 'cash-flow',
      label: t('financialStatement.cashFlow'),
      icon: IconExchange,
      body: <CashFlowTable />,
    },
  ];

  return (
    <PeriodClosingLayout
      footer={
        <PeriodFooter
          onBack={() => navigate(-1)}
          onNext={() => navigate(routes.PeriodAndClosingBook.ListPLandCB)}
          nextLabel={t('common.confirm')}
        />
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <Stack gap={2}>
              <Title order={3}>{t('financialStatement.title')}</Title>
              <Text c={themeColors.gray[6]} fz={14}>
                {t('financialStatement.subtitle', { date: PROTOTYPE_PERIOD_END })}
              </Text>
            </Stack>
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack align="stretch" justify="flex-start" gap="sm">
              <Tabs color={themeColors.primary[6]} defaultValue="trial-balance">
                <Tabs.List>
                  {panels.map(({ value, label, icon: Icon }) => (
                    <Tabs.Tab key={value} value={value} leftSection={<Icon style={iconStyle} />}>
                      {label}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
                {panels.map(({ value, label, body }) => (
                  <Tabs.Panel key={value} value={value}>
                    <Stack gap="md" mt="md">
                      <ReportPanelHeader title={label} />
                      {body}
                    </Stack>
                  </Tabs.Panel>
                ))}
              </Tabs>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </PeriodClosingLayout>
  );
};

export default FinancialStatementPage;
