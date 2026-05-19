import {
    Container,
    Group,
    Paper,
    Stack,
    Button,
    Text,
    Anchor,
    Menu,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { TextMediumGR } from '@/components/Text/CustomText';
import { navigate } from '@/router';
import { routes } from '@/router/routes';
import { PageHeader } from '@/components';
import { TextWithSubObject, TextWithSubText } from '@/components/Text/TextwithSubText';
import { gradientColors, themeColors } from '@/theme';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { useDetailTransaction } from '../hooks/useDetailTransaction';
import { dateFormatV1 } from '@/utils/FormatDate';
import TransactionJournalFormLayout from './Layout';
import JournalTransactionDetailTable from '../components/TableTransactionJournal/JournalTransactionDetailTable';
import FileAttachments from '../components/FileAttachment';
import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';


const items = [
    { title: 'General Journal', href: () => navigate(routes.generalJournal.main) },
    { title: 'Detail Account', href: () => navigate(-1) },
    { title: 'Detail Transaction Journal', href: () => { } }
]

const JournalTransactionDetailPage = () => {
    const navigate = useNavigate();
    const { idTransaction } = useParams<{ idTransaction: string }>();
    const { detailTransaction, isError, isLoading } = useDetailTransaction(idTransaction!);

    return (
        <TransactionJournalFormLayout
            footer={
                <Group h="100%" px="xl" >
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Menu position="top-start">
                            <Menu.Target>
                                <Button
                                    variant="light"
                                    color="gray"
                                    leftSection={<IconDots size={14} />}
                                >
                                    Other Action
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item>Export To Pdf</Menu.Item>
                                <Menu.Item>Duplicate Transaction</Menu.Item>
                                <Menu.Item>Repeat Transaction</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                        <Group>
                            <Button
                                variant="light"
                                color={themeColors.red[6]}
                                leftSection={<IconTrash size={14} />}
                                onClick={() => navigate(routes.generalJournal.main)}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="gradient"
                                gradient={gradientColors.gradient}
                                leftSection={<IconPencil size={14} />}
                                onClick={() => navigate(routes.generalJournal.main)}
                            >
                                Edit
                            </Button>
                        </Group>
                    </Group>
                </Group>
            }
        >
            <Container fluid>
                <Stack gap="lg">
                    <Paper p="md" shadow="md" radius="md">
                        <PageHeaderV2
                            type='withBreadcrumbs'
                            title={`Journal Entry #${detailTransaction?.transactionNumber}`}
                            breadcrumbItems={items}
                        />
                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Stack>
                            <TextMediumGR>Transaction Information</TextMediumGR>
                            <TextWithSubText mainText='Transaction Number' subText={detailTransaction?.transactionNumber} />
                            <TextWithSubText
                                mainText="Transaction Date"
                                subText={
                                    detailTransaction?.transactionDate
                                        ? dateFormatV1(detailTransaction.transactionDate.toString())
                                        : '-'
                                }
                            />
                            <TextWithSubText mainText='Tags' subText={detailTransaction?.tags ?? '-'} />
                        </Stack>
                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Stack align="stretch" justify="flex-start" gap="sm">
                            <TextMediumGR>Transaction Account</TextMediumGR>
                            <JournalTransactionDetailTable />
                            <TextWithSubText mainText='Notes' subText={
                                detailTransaction?.notes
                                    ? detailTransaction?.notes
                                    : '-'
                            } />
                            <TextWithSubObject
                                mainText='Attach File'
                            />
                            <FileAttachments attachments={detailTransaction?.attachments} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </TransactionJournalFormLayout>
    );
};

export default JournalTransactionDetailPage;
