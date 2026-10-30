import useFetchData from '@/../hooks/useFetchData';
import StatsContactGrid from '@/module/contacts/presentation/components/stats/StatsBankCashGrid/StatsBankCashGrid';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

export default function TabsOther() {
  const {
    data: statsData,
    error: statsError,
    loading: statsLoading,
  } = useFetchData('/mocks/ContactStats.json');

  const selectedData =
    statsData?.data?.filter((item: { id: number }) => [1, 2, 3, 4, 5, 6].includes(item.id)) || [];
  return (
    <StatsContactGrid
      data={selectedData}
      loading={statsLoading}
      error={statsError}
      paperProps={PAPER_PROPS}
    />
  );
}
