import { Button, Container, Group, Menu, Paper, PaperProps, rem, Stack, Tabs, Title } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import ContactPageLayout from './Layout';
import { IconExchange, IconPlus, IconTransferIn, IconTransferOut } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { navigate, routes } from '@/router';
import useFetchData from '../../../../hooks/useFetchData';
import StatsContactGrid from '../components/StatsBankCashGrid/StatsBankCashGrid';
import TableContact from '../components/Table/TableContact';
import TabsAllContact from '../components/Tabs/TabsAllContact';
import TabsEmploye from '../components/Tabs/TabsEmploye';
import TabsCustomer from '../components/Tabs/TabsCustomer';
import TabsSupplier from '../components/Tabs/TabsSupplier';
import TabsOther from '../components/Tabs/TabsOther';

const items = [
    { title: 'Settings', href: '#' },
    { title: 'User Management', href: '#' },
]

const PAPER_PROPS: PaperProps = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const ICON_STYLE = {
    width: rem(14),
    height: rem(14)
}

function ContactMainPage() {
    return (
        <ContactPageLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Group justify='space-between'>
                            <Title order={3}>
                                Contact
                            </Title>
                            <Group>
                                <Button
                                    variant="filled"
                                    size="sm"
                                    bg={themeColors.primary[6]}
                                    onClick={() => navigate(routes.Contact.AddContact)}
                                >
                                    Add Contact
                                </Button>
                            </Group>
                        </Group>
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Tabs color={themeColors.primary[6]} radius="xs" defaultValue="all-contact" styles={{ panel: { paddingTop: 16 } }}>
                            <Tabs.List>
                                <Tabs.Tab value="all-contact" >
                                    All Contact
                                </Tabs.Tab>
                                <Tabs.Tab value="employe" >
                                    Employe
                                </Tabs.Tab>
                                <Tabs.Tab value="customer"  >
                                    Customer
                                </Tabs.Tab>
                                <Tabs.Tab value="supplier"  >
                                    Supplier
                                </Tabs.Tab>
                                <Tabs.Tab value="other"  >
                                    Other
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="all-contact" >
                                <TabsAllContact />
                            </Tabs.Panel>
                            <Tabs.Panel value="employe">
                                <TabsEmploye />
                            </Tabs.Panel>
                            <Tabs.Panel value="customer">
                                <TabsCustomer />
                            </Tabs.Panel>
                            <Tabs.Panel value="supplier">
                                <TabsSupplier />
                            </Tabs.Panel>
                            <Tabs.Panel value="other">
                                <TabsOther />
                            </Tabs.Panel>
                        </Tabs>
                    </Paper>
                    <TableContact />
                </Stack>
            </Container>
        </ContactPageLayout>
    );
}

export default ContactMainPage;
