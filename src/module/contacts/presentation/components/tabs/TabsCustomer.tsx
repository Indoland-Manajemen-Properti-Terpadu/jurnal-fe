import { Stack } from "@mantine/core";
import useFetchData from "@/../hooks/useFetchData";
import StatsContactGrid from "@/module/contacts/presentation/components/stats/StatsBankCashGrid/StatsBankCashGrid";


const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

export default function TabsCustomer() {
    const {
        data: statsData,
        error: statsError,
        loading: statsLoading,
    } = useFetchData('/mocks/ContactStats.json');

    const selectedData = statsData?.data?.filter((item: { id: number }) =>
        [4, 1, 6].includes(item.id)
    ) || [];
    return (
        <StatsContactGrid
            data={selectedData}
            loading={statsLoading}
            error={statsError}
            paperProps={PAPER_PROPS}
        />
    )

};