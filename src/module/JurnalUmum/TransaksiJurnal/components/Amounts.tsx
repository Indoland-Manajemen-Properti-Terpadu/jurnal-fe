// components/TotalAmount.tsx
import { HeadingText, TextAmount } from '@/components/Text/CustomText';
import { useTransactionStore } from '@/store/JurnalUmum/useTransactionStore';
import { Grid } from '@mantine/core';

const TotalAmount = () => {
    const { totalDebit, totalCredit } = useTransactionStore();

    return (
        <Grid columns={24} grow justify="space-between" align="center">
            <Grid.Col span={12}>
                <HeadingText fz={14}>Total</HeadingText>
            </Grid.Col>
            <Grid.Col span="auto">
                <TextAmount
                    key='totalDebit'
                    amount={`Rp. ${totalDebit.toLocaleString()}`}
                    mainColor="grey"
                    colorTextAmont="black"
                >
                    Total Debit
                </TextAmount>
            </Grid.Col>
            <Grid.Col span="auto">
                <TextAmount
                    key='totalCredit'
                    amount={`Rp. ${totalCredit.toLocaleString()}`}
                    mainColor="grey"
                    colorTextAmont="black"
                >
                    Total Credit
                </TextAmount>
            </Grid.Col>
        </Grid>
    );
};

export default TotalAmount;
