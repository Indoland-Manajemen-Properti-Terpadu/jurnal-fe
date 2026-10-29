// components/TotalAmount.tsx
import { HeadingText, TextAmount } from '@/components/Text/CustomText';
import { useTransactionStore } from '@/module/journal-entries';
import { Flex, Grid, Text, Group, Switch } from '@mantine/core';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { useReceiveMoneyStore } from '../../ReceiveMoney/store/ReceiveMoneyStore';

const TotalSent = () => {
    const { taxEnabled, setTaxEnabled, totalSent } = useReceiveMoneyStore();

    return (
        <Flex
            justify="space-between"
            align="center"
            style={{
                whiteSpace: 'nowrap',
                backgroundColor: 'var(--jurnal-color-surface-muted)',
                borderRadius: 'var(--jurnal-radius-lg)',
            }}
        >
            <HeadingText fz={14} fw={600}>Sent From</HeadingText>
            <Flex gap="sm" align="center">
                <Switch
                    key='WithTax'
                    defaultChecked
                    color={themeColors.primary[6]}
                    labelPosition="left"
                    label="With Tax"
                    size="md"
                    checked={taxEnabled}
                    onChange={(event) => setTaxEnabled(event.currentTarget.checked)}
                    styles={{
                        label: {
                            fontSize: '14px',
                            fontWeight: 400,
                        },
                    }}
                />
                <TextAmount
                    key="totalSent"
                    amount={`Rp ${formatCurrency(totalSent)}`}
                    mainColor="gray"
                    colorTextAmont={themeColors.black[9]}
                >
                    <Text fz={14} fw={400} c={themeColors.gray[7]}>Total Amount</Text>
                </TextAmount>
            </Flex>
        </Flex>
    );
};

export default TotalSent;
