import { Badge, Button, Container, Text, Group, Paper, PaperProps, rem, Stack, Tabs } from '@mantine/core';
import { themeColors } from '@/theme';
import ContactPageLayout from './Layout';
import { IconUser } from '@tabler/icons-react';
import { navigate } from '@/router';
import useFetchData from '../../../../hooks/useFetchData';
import StatsContactGrid from '../components/StatsBankCashGrid/StatsBankCashGrid';
import TabsEmploye from '../components/Tabs/TabsEmploye';
import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';
import TableTransactionByContact from '../components/Table/TableTransactionByContact';


const breadcrumbItems = [
    { title: "Contact", href: () => navigate(-1) },
    { title: "Detail Contact", href: undefined },
    { title: "Transaction Contact", href: undefined },
];

const PAPER_PROPS: PaperProps = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const ICON_STYLE = {
    width: rem(14),
    height: rem(14)
}

function TransactionDetailByContact() {
    const status = true;
    const {
        data: statsData,
        error: statsError,
        loading: statsLoading,
    } = useFetchData('/mocks/ContactStats.json');

    const selectedData = statsData?.data?.filter((item: { id: number }) =>
        [1, 2, 3, 4, 5, 6].includes(item.id)
    ) || [];

    return (
        <ContactPageLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <PageHeaderV2
                            type="withBreadcrumbs"
                            title="Transaction Contact"
                            breadcrumbItems={breadcrumbItems}
                        />
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Stack>
                            <Group>
                                <Text c={themeColors.primary[6]} fz={18} fw={500}>
                                    Contact Information
                                </Text>
                                <IconUser size={20} color={themeColors.primary[6]} />
                            </Group>

                            <Group justify="space-between" align="center">
                                <Group>
                                    <Group align="flex-end">
                                        <Stack gap={0}>
                                            <Text c={themeColors.black[9]} fz={18} fw={500}>Raga Mekanik Las</Text>
                                            <Text c={themeColors.gray[6]} fz={14} fw={500}>CV. Raga Bubut Jaya</Text>
                                        </Stack>
                                        <Badge variant="light" color={themeColors.gray[6]} leftSection={<IconUser size={14} />}>
                                            Customer
                                        </Badge>
                                        <Badge variant="light" color={themeColors.gray[6]} leftSection={<IconUser size={14} />}>
                                            Supplier
                                        </Badge>
                                    </Group>
                                </Group>
                                <Group>
                                    <Button variant="filled" bg={themeColors.primary[6]}>Transaction Contact</Button>
                                </Group>
                            </Group>
                            {status ? (
                                <Tabs
                                    color={themeColors.primary[6]}
                                    radius="xs"
                                    defaultValue="payable"
                                    styles={{ panel: { paddingTop: 16 } }}
                                >
                                    <Tabs.List>
                                        <Tabs.Tab value="payable">Payable</Tabs.Tab>
                                        <Tabs.Tab value="receivable">Receivable</Tabs.Tab>
                                    </Tabs.List>
                                    <Tabs.Panel value="payable">
                                        <Stack>
                                            <StatsContactGrid
                                                data={selectedData}
                                                loading={statsLoading}
                                                error={statsError}
                                                paperProps={PAPER_PROPS}
                                            />
                                            <TableTransactionByContact />
                                        </Stack>
                                    </Tabs.Panel>
                                    <Tabs.Panel value="receivable">
                                        <TabsEmploye />
                                    </Tabs.Panel>
                                </Tabs>
                            ) : (
                                <Stack>
                                    <StatsContactGrid
                                        data={selectedData}
                                        loading={statsLoading}
                                        error={statsError}
                                        paperProps={PAPER_PROPS}
                                    />
                                    <TableTransactionByContact />
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </ContactPageLayout >
    );
}

export default TransactionDetailByContact;
