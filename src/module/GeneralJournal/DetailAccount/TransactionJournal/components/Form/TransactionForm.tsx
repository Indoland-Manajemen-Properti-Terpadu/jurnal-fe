import { Grid, NumberInput, Select, TextInput, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconTrash } from '@tabler/icons-react';
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';

const TransactionForm = () => {
    const { minimumTransaction, transactions, updateTransaction, removeTransaction } =
        useTransactionStore();
    const { accounts } = useJournalAccounts();
    const JournalAccounts = Array.isArray(accounts) ? accounts : [];

    const listJournalAccount = JournalAccounts.filter(
        (account) => account.name && account.accountNumber
    ).map((account) => ({
        value: account.id,
        label: `${account.name} (${account.accountNumber}${account.category ? ` - ${account.category.name}` : ''})`,
    }));

    return (
        <>
            {transactions.length === 0 ? (
                <div>Please add a transaction</div>
            ) : (
                transactions.map((item, index, arr) => (
                    <Grid key={item.key} columns={24} grow justify="space-between" align="flex-start">
                        <Grid.Col span={7}>
                            <Select
                                key="accounts"
                                placeholder="Choose account"
                                data={listJournalAccount}
                                value={item.account}
                                searchable
                                onChange={(value) => updateTransaction(index, 'account', value)}
                                rightSection={<IconChevronDown size={14} />}
                                withAsterisk
                                comboboxProps={{ width: 500, position: 'bottom-start' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={5}>
                            <TextInput
                                placeholder="Add description"
                                value={item.description}
                                onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                                withAsterisk
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                key="debit"
                                placeholder="Add debit"
                                prefix="Rp "
                                thousandSeparator="."
                                decimalSeparator=","
                                min={0}
                                value={item.debit === 0 ? '' : item.debit}
                                onFocus={(e) => {
                                    if (item.debit === 0) {
                                        updateTransaction(index, 'debit', '');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '') {
                                        updateTransaction(index, 'debit', 0);
                                    }
                                }}
                                onChange={(value) => updateTransaction(index, 'debit', value)}
                                disabled={item.credit > 0}
                                mb="md"
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                key="credit"
                                placeholder="Add credit"
                                prefix="Rp "
                                min={0}
                                value={item.credit === 0 ? '' : item.credit}
                                onFocus={(e) => {
                                    if (item.credit === 0) {
                                        updateTransaction(index, 'credit', '');
                                    }
                                }}
                                onBlur={(e) => {
                                    if (e.target.value === '') {
                                        updateTransaction(index, 'credit', 0);
                                    }
                                }}
                                thousandSeparator="."
                                decimalSeparator=","
                                onChange={(value) => updateTransaction(index, 'credit', value)}
                                disabled={item.debit > 0}
                                mb="md"
                            />
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <ActionIcon
                                disabled={index < minimumTransaction && arr.length < minimumTransaction + 1}
                                variant="light"
                                color="gray"
                                c="red"
                                styles={(theme, { disabled }) => ({
                                    icon: { color: disabled ? theme.colors.gray[5] : theme.colors.red[6] },
                                })}
                                aria-label="Delete"
                                size="lg"
                                onClick={() => removeTransaction(index)}
                            >
                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                            </ActionIcon>
                        </Grid.Col>
                    </Grid>
                ))
            )}
        </>
    );
};

export default TransactionForm;
