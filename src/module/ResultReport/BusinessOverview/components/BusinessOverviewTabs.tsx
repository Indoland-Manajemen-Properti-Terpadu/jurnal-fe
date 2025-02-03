import { SimpleGrid } from "@mantine/core"
import ReportCard from "../../Main/components/ReportCard"
import { routes } from "@/router"



const BusinessOverviewReportTabs = () => {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 'xl', sm: 'sm' }} verticalSpacing={{ base: 'md', sm: 'sm' }} pt='md'
        >
            <ReportCard
                title="Balance Sheet"
                description="It presents what the company owns (assets), what it owes (liabilities), and what has been invested in the company (equity) as of a specific date."
                route={routes.resultReport.balanceSheet}
            />
            <ReportCard
                title="Trial Balance"
                description="It displays the balance of each account, including the beginning balance, movements, and ending balance for a specific period."
                route={routes.resultReport.trialBalance}
            />
            <ReportCard
                title="Income Statement"
                description="It displays all transactions by account for a specific period, including the chronological movement of transactions throughout that period"
                route={routes.resultReport.incomeStatement}
            />
            {/* <ReportCard
                title="Cash Flow"
                description="It shows the movement of money in and out from transactions over a specific period. This report template can be customized to suit your needs."
                route={routes.resultReport.cashFlow}
            /> */}
            <ReportCard
                title="Journal Entry"
                description="It shows all journal entries for each transaction within a specific period, allowing you to track how transactions are posted to individual accounts."
                route={routes.resultReport.journalEntry}
            />
            {/* <ReportCard
                title="Business Sumary"
                description="It provides a summary of key financial statements and insights for a specific period."
                route={routes.resultReport.businessSumary}
            /> */}
            {/* <ReportCard
                title="Income Statement Budget"
                description="It presents a comparison between actual transaction amounts and the budgeted figures for each account."
                route={routes.resultReport.incomeStatementBudget}
            /> */}
            <ReportCard
                title="General Ledger Report"
                description="It presents a comparison between actual transaction amounts and the budgeted figures for each account."
                route={routes.resultReport.generalLedgerReport}
            />
            <ReportCard
                title="Equity Changes"
                description="It presents a comparison between actual transaction amounts and the budgeted figures for each account."
                route={routes.resultReport.equityChanges}
            />
            <ReportCard
                title="Budget Management"
                description="It presents a comparison between actual transaction amounts and the budgeted figures for each account."
                route={routes.SettingBudget.BudgetManagement}
            />
        </SimpleGrid>
    )
}

export default BusinessOverviewReportTabs