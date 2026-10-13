import {
    Button,
    Container,
    Group,
    Paper,
    Stack,
    Text,
    Tabs,
    SimpleGrid,
    Grid,
    Divider,
    Table,
    Badge,
    Menu,
    rem,
    Breadcrumbs,
    Flex,
    Title,
    Anchor,
} from "@mantine/core";
import { IconArchive, IconBuildingBank, IconChevronUp, IconFileDollar, IconPencil, IconReportSearch, IconUser } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { gradientColors, themeColors } from "@/theme";
import { navigate } from "@/router";
import { routes } from "@/router/routes";
import ContactPageLayout from "./Layout";

const breadcrumbData = [
    { title: "Contact", href: () => navigate(-1) },
    { title: "Detail Contact", href: undefined },
];

const breadcrumbItems = breadcrumbData.map((item, index) => (
    <Anchor
        key={index}
        underline="never"
        variant={index === breadcrumbData.length - 1 ? "gradient" : "filled"}
        gradient={index === breadcrumbData.length - 1 ? gradientColors.gradient : undefined}
        fz={14}
        fw={400}
        c={index === breadcrumbData.length - 1 ? themeColors.black[9] : "inherit"}
        onClick={(e) => {
            if (index !== breadcrumbData.length - 1 && item.href) {
                e.preventDefault();
                item.href();
            }
        }}
    >
        {item.title}
    </Anchor>
));


const contactDetails = [
    { label: "FullName", value: "Raga Mekanik Las" },
    { label: "Email", value: "ragabaukentut@gmail.com" },
    { label: "Identity", value: "KTP" },
    { label: "Identity Number", value: "1122334455667788" },
    { label: "Mobile Phone Number", value: "1122334455667788" },
    { label: "Telephone Number", value: "1122334455667788" },
    { label: "Fax", value: "1122334455667788" },
    { label: "NPWP", value: "12.345.678.9-012.345" },
];

const addressDetail = [
    { label: "Billing Address", value: "Greenwood Residence, Blok C1 No. 2, RT 001/RW 003, Jl. Karang Sambung - Karang Satria, Tambun Utara." },
    { label: "Shipping Address", value: "Greenwood Residence, Blok C1 No. 2, RT 001/RW 003, Jl. Karang Sambung - Karang Satria, Tambun Utara." },

]

const bankinformation = [
    { bank: "PT Bank CIMB Niaga Tbk", branch: "Jakarta Timur - Cakung", accountHolder: "Raga Mekanik Las", accountNumber: "122-032-233" },
    { bank: "PT. Bank Mandiri (Persero)", branch: "Bekasi - Juanda", accountHolder: "Raga Mekanik Las", accountNumber: "122-032-233" },
];

const accountMappings = [
    { label: "Accounts Receivable", value: "Accounts Receivable (1030)" },
    { label: "Accounts Payable", value: "Accounts Payable (2000)" },
    { label: " Main Payment Terms", value: "Net 30" }
];

const DetailContactPage = () => {
    const { idAccount } = useParams<{ idAccount: string }>();
    const bankInformationData = bankinformation.map((item) => (
        <Table.Tr key={item.bank}>
            <Table.Td>{item.bank}</Table.Td>
            <Table.Td>{item.branch}</Table.Td>
            <Table.Td>{item.accountHolder}</Table.Td>
            <Table.Td>{item.accountNumber}</Table.Td>
        </Table.Tr>
    ));
    return (
        <ContactPageLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper p="md" shadow="md" radius="md">
                        <Grid justify="space-between" align="center">
                            <Grid.Col span={6}>
                                <Stack gap="md">
                                    <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
                                    <Title order={3}>Detail Contact</Title>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Group justify="flex-end">
                                    <Menu position="bottom-end" offset={5} withArrow>
                                        <Menu.Target>
                                            <Button variant="light" size="sm" color={themeColors.gray[7]} rightSection={<IconChevronUp style={{ width: rem(14), height: rem(14) }} />}>
                                                Other Action
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconFileDollar style={{ width: rem(14), height: rem(14) }} />}>Account Statement Report</Menu.Item>
                                            <Menu.Item leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}>Edit Profile</Menu.Item>
                                            <Menu.Item leftSection={<IconArchive style={{ width: rem(14), height: rem(14) }} />}>Archive Contact</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>

                                    <Button
                                        variant="filled"
                                        bg={themeColors.primary[6]}
                                        onClick={() => navigate(routes.Contact.TransactionDetailByContact.replace(':idAccount', idAccount!))}
                                    >
                                        Transaction Contract
                                    </Button>
                                </Group>
                            </Grid.Col>
                        </Grid>


                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Stack>
                            <Group>
                                <Text c={themeColors.primary[6]} fz={18} fw={500}>
                                    Contact Information
                                </Text>
                                <IconUser size={20} color={themeColors.primary[6]} />
                            </Group>
                            <Grid justify="space-between" align="center">
                                <Grid.Col span={6}>
                                    <Stack gap={0}>
                                        <Text c={themeColors.black[9]} fz={18} fw={500}>Raga Mekanik Las</Text>
                                        <Text c={themeColors.gray[6]} fz={14} fw={500}>CV. Raga Bubut Jaya</Text>
                                    </Stack>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Group>
                                        <Badge variant="light" color={themeColors.gray[6]} leftSection={<IconUser size={14} />}>
                                            Customer
                                        </Badge>
                                        <Badge variant="light" color={themeColors.gray[6]} leftSection={<IconUser size={14} />}>
                                            Supplier
                                        </Badge>
                                    </Group>
                                </Grid.Col>
                            </Grid>
                            <Divider my="xs" />

                            {contactDetails.map((detail, index) => (
                                <Grid justify="space-between" align="center" key={index}>
                                    <Grid.Col span={6}>
                                        <Text c={themeColors.gray[6]} fz={14} fw={400}>
                                            {detail.label}
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text c={themeColors.black[9]} fz={14} fw={500}>
                                            {detail.value}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            ))}
                            <Divider my="xs" />

                            {addressDetail.map((detail, index) => (
                                <Grid justify="space-between" align="center" key={index}>
                                    <Grid.Col span={6}>
                                        <Text c={themeColors.gray[6]} fz={14} fw={400}>
                                            {detail.label}
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text c={themeColors.black[9]} fz={14} fw={500}>
                                            {detail.value}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            ))}

                            <Divider my="xs" />
                            <Group>
                                <Text c={themeColors.primary[6]} fz={18} fw={500}>
                                    Bank Information
                                </Text>
                                <IconBuildingBank size={20} color={themeColors.primary[6]} />
                            </Group>

                            <Table highlightOnHover withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Bank</Table.Th>
                                        <Table.Th>Branch</Table.Th>
                                        <Table.Th>Account Holder</Table.Th>
                                        <Table.Th>Account Number</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{bankInformationData}</Table.Tbody>
                            </Table>

                            <Divider my="xs" />
                            <Group>
                                <Text c={themeColors.primary[6]} fz={18} fw={500}>
                                    Account Mapping
                                </Text>
                                <IconFileDollar size={20} color={themeColors.primary[6]} />
                            </Group>
                            {accountMappings.map((mapping, index) => (
                                <Grid justify="space-between" align="center" key={index}>
                                    <Grid.Col span={6}>
                                        <Text c={themeColors.gray[6]} fz={14} fw={400}>
                                            {mapping.label}
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text c={themeColors.black[9]} fz={14} fw={500}>
                                            {mapping.value}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </ContactPageLayout >
    );
};

export default DetailContactPage;
