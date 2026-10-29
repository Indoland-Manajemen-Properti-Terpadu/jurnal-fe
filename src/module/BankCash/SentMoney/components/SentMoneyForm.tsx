import { Grid, NumberInput, Select, TextInput, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconTrash } from '@tabler/icons-react';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useReceiveMoneyStore } from '../../ReceiveMoney/store/ReceiveMoneyStore';


const ReceiveMoneyForm = () => {
    const { minimumTransaction, transactions, updateTransaction, removeTransaction } =
        useReceiveMoneyStore();
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
                                rightSection={<IconChevronDown size={14} />}
                                onChange={(value) => updateTransaction(index, 'account', value)}
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
                            <Select
                                key="accounts"
                                placeholder="Choose Tax"
                                data={["PPN", "PPH", "PPH21"]}
                                rightSection={<IconChevronDown size={14} />}
                                // value={item.account}
                                // onChange={(value) => updateTransaction(index, 'account', value)}
                                withAsterisk
                                comboboxProps={{ width: 500, position: 'bottom-start' }}
                            />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <NumberInput
                                key="receive"
                                placeholder="Amount sent"
                                prefix="Rp. "
                                min={0}
                                value={item.receive}
                                hideControls
                                onChange={(value) => updateTransaction(index, 'receive', value)}
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

export default ReceiveMoneyForm;
