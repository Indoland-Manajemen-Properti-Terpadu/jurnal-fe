import { Anchor, Container, Paper, PaperProps, Stack, Text } from '@mantine/core';
import PageHeader from '@/components/PageHeader/PageHeader';
import MainDashboardLayout from './layout';
import StatsGrid from '@/components/StatsGrid/StatsGrid';
import useFetchData from '../../../../hooks/useFetchData';
import { useAuthStore } from '@/store/useAuthentications';
import { themeColors } from '@/theme';
import StatsBankCashGrid from '@/module/BankCash/Main/components/StatsBankCashGrid/StatsBankCashGrid';

const items = [
  { title: 'Settings', href: '#' },
  { title: 'User Management', href: '#' },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

const PAPER_PROPS: PaperProps = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

function MainDashboard() {
  const { userName } = useAuthStore();
  // const {
  //   data: statsData,
  //   error: statsError,
  //   loading: statsLoading,
  // } = useFetchData('/mocks/StatsGrid.json');
  return (
    <MainDashboardLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeader title="Main Dashboard" withinBreadcums />
          </Paper>
          <Paper {...PAPER_PROPS}>
            {/* <StatsBankCashGrid
              data={statsData.data}
              loading={statsLoading}
              error={statsError}
              paperProps={PAPER_PROPS}
            /> */}
          </Paper>
        </Stack>
      </Container>
    </MainDashboardLayout>
  );
}

export default MainDashboard;
