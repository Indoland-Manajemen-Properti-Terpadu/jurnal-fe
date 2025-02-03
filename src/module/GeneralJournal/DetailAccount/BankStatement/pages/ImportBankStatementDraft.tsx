import { Container, Grid, Paper, Stack, Title, Text, Group, Button, Flex, Tabs, rem, Badge, Alert, List, ThemeIcon, CloseButton } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import BankStatementLayout from "./Layout";
import ImportBankStatementDraftTable from "../components/ImportBankStatementDraftTable";
import { getBankStatement } from "../service/ListBankStatement.service";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextMediumGR } from "@/components/Text/CustomText";
import { useBankStatementStore } from "../store/useBankStatement.store";
import { Data } from "../types/ImportBankStatement.model";
import { getSubmitImportBankStatement } from "../service/ImportBankStatement.service";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

type BadgeCountProps = {
    status: 'correct' | 'wrong' | 'other';
};

const ImportBankStatementDraft = () => {
    const account = JSON.parse(localStorage.getItem('bankStatementData')!);
    const { idAccount } = useParams<{ idAccount: string }>();
    const { mutate: submitImportBankStatement } = getSubmitImportBankStatement(account.account.id!)

    const {
        showAlert,
        setShowAlert,
        setTotalData,
        totalData,
        wrongData,
        setWrongData,
        totalWrongData,
        totalCorrectData,
        sumTotalData,
        correctData,
        setCorrectData,
        errorMessages,
        setErrorMessages
    } = useBankStatementStore()

    let { data, isLoading, isError } = getBankStatement(idAccount!);
    const isEmpty = data?.results?.length == 0
    const iconStyle = { width: rem(12), height: rem(12) };
    const navigate = useNavigate();
    let count = 0;

    useEffect(() => {
        const storedBankStatementData = localStorage.getItem('bankStatementData');

        if (storedBankStatementData) {
            const parsedDataBankStatement = JSON.parse(storedBankStatementData)
            const dataWithId = parsedDataBankStatement.datas.map((item: Data) => ({
                ...item,
                id: Math.random().toString(36).substr(2, 9)
            }));
            const transactionsWithErrors = dataWithId.filter((transaction: { errors: string | any[]; }) => transaction.errors.length > 0);
            const transactionsWithoutErrors = dataWithId.filter((transaction: { errors: string | any[]; }) => transaction.errors.length === 0);
            transactionsWithErrors.length > 0 ? setShowAlert(true) : false
            const allErrors = transactionsWithErrors.map((data: Data) => `${data.transactionName!} - ${data.errors!}`).flat();

            setTotalData(dataWithId)
            setCorrectData(transactionsWithoutErrors)
            setWrongData(transactionsWithErrors)
            setErrorMessages(allErrors)
        }
    }, []);

    const handleImport = () => {
        const updatedData = correctData.map(({ id, errors, ...rest }) => rest);
        const payload = {
            "datas": updatedData
        }
        submitImportBankStatement(payload)
    }

    const BadgeCount = ({ status }: BadgeCountProps) => {
        let color;
        if (status === 'correct') {
            color = 'green';
            count = totalCorrectData;
        } else if (status === 'wrong') {
            color = 'red';
            count = totalWrongData;
        } else {
            color = 'gray';
            count = sumTotalData;
        }

        return (
            <Badge variant="light" color={color} size="sm">
                {count}
            </Badge>
        );
    };

    return (
        <BankStatementLayout
            footer={
                <Group justify="flex-end" align="center" gap="xs" mt='md'>
                    <Button
                        variant='light'
                        color={themeColors.grey[7]}
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='gradient'
                        gradient={gradientColors.gradient}
                        onClick={() => handleImport()}
                    >
                        Import
                    </Button>

                </Group>
            }
        >
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Stack gap={1}>
                            <Grid columns={0} align='center'>
                                <Grid.Col>
                                    <Title order={3}>Data Import Validation</Title>
                                </Grid.Col>

                            </Grid>
                            <Text c={themeColors.grey[6]} fz={14}>
                                Please double check the data you have imported and adjust accordingly
                            </Text>
                        </Stack>
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Stack>
                            <TextMediumGR>List Data</TextMediumGR>

                            {showAlert && (
                                <Paper p='md' shadow="xs">
                                    <Stack gap='md'>
                                        <Flex align="center" justify="right" w="100%">
                                            <CloseButton size="sm" onClick={() => setShowAlert(false)} />
                                        </Flex>

                                        <Alert variant="light" color="red" title="Error Information" icon={<IconInfoCircle />}>
                                            <List size="xs">
                                                {
                                                    errorMessages.map((error) => (
                                                        <List.Item> {error}</List.Item>
                                                    ))
                                                }
                                            </List>
                                        </Alert>
                                    </Stack>
                                </Paper>
                            )}
                            <Tabs variant="outline" defaultValue="master">
                                <Tabs.List>
                                    <Tabs.Tab value="master" rightSection={<BadgeCount status="other" />}>
                                        Total Data
                                    </Tabs.Tab>
                                    <Tabs.Tab value="correct" rightSection={<BadgeCount status="correct" />}>
                                        Correct
                                    </Tabs.Tab>
                                    <Tabs.Tab value="wrong" rightSection={<BadgeCount status="wrong" />}>
                                        Wrong
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="master">
                                    <ImportBankStatementDraftTable
                                        records={totalData}
                                        typeTable="master"
                                    />
                                </Tabs.Panel>

                                <Tabs.Panel value="correct">
                                    <ImportBankStatementDraftTable
                                        records={correctData}
                                        typeTable="correct"
                                    />
                                </Tabs.Panel>

                                <Tabs.Panel value="wrong">
                                    <ImportBankStatementDraftTable
                                        records={wrongData}
                                        typeTable="wrong"
                                    />
                                </Tabs.Panel>
                            </Tabs>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </BankStatementLayout>
    )
}

export default ImportBankStatementDraft;