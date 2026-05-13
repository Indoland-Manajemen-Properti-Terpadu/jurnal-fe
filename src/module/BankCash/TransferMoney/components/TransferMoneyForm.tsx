import { Grid, NumberInput, Select, TextInput, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconTrash } from '@tabler/icons-react';
import { useTransferMoneyStore } from '../store/TransferFormStore';
import { useJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/hooks/useJournalAccounts';

const TransferMoneyForm = () => {
    const { minimumTransaction, transactions, updateTransaction } =
        useTransferMoneyStore();
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
                    <Grid key={item.key} columns={12} grow justify="space-between" align="flex-start">
                        <Grid.Col span={4}>
                            <Select
                                label="Transfer Form"
                                key="accountsForm"
                                placeholder="Choose account"
                                rightSection={<IconChevronDown size={14} />}
                                data={listJournalAccount}
                                value={item.accountFrom}
                                onChange={(value) => updateTransaction(index, 'accountFrom', value)}

                                withAsterisk
                                comboboxProps={{ width: 500, position: 'bottom-start' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Select
                                label="Deposit To"
                                key="accountsTo"
                                placeholder="Choose account"
                                rightSection={<IconChevronDown size={14} />}
                                data={listJournalAccount}
                                value={item.accountTo}
                                onChange={(value) => updateTransaction(index, 'accountTo', value)}
                                withAsterisk
                                comboboxProps={{ width: 500, position: 'bottom-start' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                label="Nominal Ammount"
                                key="debit"
                                placeholder="Add debit"
                                hideControls
                                prefix="Rp. "
                                thousandSeparator=','
                                min={0}
                                value={item.ammount}
                                onChange={(value) => updateTransaction(index, 'debit', value)}
                                withAsterisk
                            />
                        </Grid.Col>
                    </Grid>
                ))
            )}
        </>
    );
};

export default TransferMoneyForm;
