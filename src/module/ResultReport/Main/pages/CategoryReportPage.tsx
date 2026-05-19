import {
    Container,
    Paper,
    SimpleGrid,
    Stack,
    Tabs,
    rem,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';

import ResultReportLayout from './Layout';
import ReportCard from '../components/ReportCard';
import BusinessOverviewReportTabs from '../../BusinessOverview/components/BusinessOverviewTabs';
import SellingReportTabs from '../components/SellingTabs';
import PurchasingReportTabs from '../components/PurchasingTabs';
import TaxReportTabs from '../components/TaxTabs';
import { themeColors } from '@/theme';
import ProductReportTabs from '../components/ProductTab';
import AssetsReportTabs from '../components/AssetsTab';
import BankReportTabs from '../components/BankTabs';


const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const ResultReportPage: React.FC = () => {
    const navigate = useNavigate();
    const iconStyle = { width: rem(12), height: rem(12) };

    return (
        <ResultReportLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <PageHeader
                            title={`Category Reports`}
                            withinBreadcums
                        />
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Tabs color={themeColors.teal[6]} radius="xs" defaultValue="business-overview">
                            <Tabs.List>
                                <Tabs.Tab value="business-overview" >
                                    Business Overview
                                </Tabs.Tab>
                                <Tabs.Tab value="selling" >
                                    Selling
                                </Tabs.Tab>
                                <Tabs.Tab value="purchasing"  >
                                    Purchasing
                                </Tabs.Tab>
                                <Tabs.Tab value="product"  >
                                    Product
                                </Tabs.Tab>
                                <Tabs.Tab value="assets"  >
                                    Assets
                                </Tabs.Tab>
                                <Tabs.Tab value="bank"  >
                                    Bank
                                </Tabs.Tab>
                                <Tabs.Tab value="tax"  >
                                    Tax
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="business-overview" >
                                <BusinessOverviewReportTabs />
                            </Tabs.Panel>

                            <Tabs.Panel value="selling">
                                <SellingReportTabs />
                            </Tabs.Panel>
                            <Tabs.Panel value="purchasing">
                                <PurchasingReportTabs />
                            </Tabs.Panel>
                            <Tabs.Panel value="product">
                                <ProductReportTabs />
                            </Tabs.Panel>
                            <Tabs.Panel value="assets">
                                <AssetsReportTabs />
                            </Tabs.Panel>
                            <Tabs.Panel value="bank">
                                <BankReportTabs />
                            </Tabs.Panel>
                            <Tabs.Panel value="tax">
                                <TaxReportTabs />
                            </Tabs.Panel>
                        </Tabs>
                    </Paper>
                </Stack>
            </Container>
        </ResultReportLayout >
    );
};

export default ResultReportPage;
