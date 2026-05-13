import {
    Anchor,
    Button,
    Container,
    Group,
    Paper,
    Stack,
    Title,
    Text,
    Select,
    Input,
    NumberInput,
    Divider,
    Textarea
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { gradientColors, themeColors } from '@/theme';
import { TextMediumGR } from '@/components/Text/CustomText';
import { uuID } from '@/utils/uuid';
import { useState } from 'react';
import { routes } from '@/router';
import AddAccountLedgerFormLayout from '../../AkunJurnal/pages/AddAccount/Layout';
import WorkingPaperTable from '../components/WorkingPaperTable';
import { IconChevronDown } from '@tabler/icons-react';
import PeriodLockAndClosingBookLayout from './Layout';

const items = [
    { title: 'Settings', href: '#' },
    { title: 'General Journal', href: '#' },
    { title: 'Add Account', href: '#' },
].map((item) => (
    <Anchor href={item.href} key={uuID}>
        {item.title}
    </Anchor>
));

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const ClosingBooksPage = () => {
    const navigate = useNavigate();

    return (
        <PeriodLockAndClosingBookLayout
            footer={
                <Container fluid px="lg">
                    <Group grow>
                        <Group justify="flex-end" gap="xs" mt='md'>
                            <Button
                                variant="light"
                                color={themeColors.grey[7]}
                                onClick={() => navigate(routes.generalJournal.main)}
                            >
                                Back
                            </Button>
                            <Button
                                variant="gradient"
                                gradient={gradientColors.gradient}
                                onClick={() => navigate(routes.PeriodAndClosingBook.FinancialStatement)}
                            >
                                Continue
                            </Button>
                        </Group>
                    </Group>
                </Container>
            }
        >
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Stack gap={2}>
                            <Title order={3}>Trial Balance Working Paper</Title>
                            <Text c={themeColors.grey[6]} fz={14}>
                                From start to 31/07/2024
                            </Text>
                        </Stack>
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Stack align="stretch" justify="flex-start" gap="sm">
                            <TextMediumGR>Working Paper</TextMediumGR>
                            <WorkingPaperTable />
                            <TextMediumGR > Tax Expense & Payable</TextMediumGR>
                            <Group grow>
                                <Select
                                    withAsterisk
                                    label="Tax Expense Account"
                                    placeholder="Chose account"
                                    data={['React', 'Angular', 'Vue', 'Svelte']}
                                    rightSection={<IconChevronDown size={16} />}
                                />
                                <Select
                                    withAsterisk
                                    label="Tax Expense Payable"
                                    placeholder="Chose account"
                                    data={['React', 'Angular', 'Vue', 'Svelte']}
                                    rightSection={<IconChevronDown size={16} />}
                                />
                            </Group>
                            <TextMediumGR > Net Profit/Loss After Tax</TextMediumGR>
                            <Select
                                withAsterisk
                                label="Retained Earnings Account"
                                placeholder="Chose account"
                                data={['React', 'Angular', 'Vue', 'Svelte']}
                                rightSection={<IconChevronDown size={16} />}
                            />
                            <TextMediumGR > Net Profit/Loss After Tax</TextMediumGR>
                            <Group grow>
                                <NumberInput
                                    label="Total"
                                    withAsterisk
                                    placeholder="0,00"
                                    rightSection={<IconChevronDown size={16} />}
                                />
                            </Group>
                            <Divider />
                            <Textarea
                                label="Notes"
                                placeholder="Add Notes"
                            />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </PeriodLockAndClosingBookLayout>
    );
};

export default ClosingBooksPage;
