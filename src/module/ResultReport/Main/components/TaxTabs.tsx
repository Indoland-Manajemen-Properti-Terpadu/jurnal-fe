import { SimpleGrid } from "@mantine/core"
import ReportCard from "./ReportCard"
import { routes } from "@/router"



const TaxReportTabs = () => {
    return (
        <SimpleGrid cols={3} spacing="sm" verticalSpacing="sm" pt='md'>
            {/* <ReportCard
                title="Balance Sheet"
                description="It presents what the company owns (assets), what it owes (liabilities), and what has been invested in the company (equity) as of a specific date."
                route={routes.resultReport.balanceSheet}
            />
            <ReportCard
                title="Trial Balance"
                description="It displays the balance of each account, including the beginning balance, movements, and ending balance for a specific period."
                route={routes.resultReport.trialBalance}
            /> */}

        </SimpleGrid>
    )
}

export default TaxReportTabs