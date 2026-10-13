// components/TotalAmount.tsx
import { useTransactionStore } from '@/store/GeneralJournal/useTransactionStore';
import { Grid, Text, Box } from '@mantine/core';
import { themeColors } from '@/theme';
import { themeText } from '@/theme/constants';

const TotalAmount = () => {
    const { totalDebit, totalCredit } = useTransactionStore();

    return (
        <Box
            bg={themeColors.primary[0]}
            py={8} px="xs"
            style={{
                borderRadius: 8,
                border: `1px solid ${themeColors.slate[2]}`
            }}>
            <Grid columns={24} gutter="md" align="center">
                <Grid.Col span={1} />
                <Grid.Col span={7}>
                    <Text style={themeText.label.label2} c={themeColors.black[9]}>Total Transaksi</Text>
                </Grid.Col>
                <Grid.Col span={7} />
                <Grid.Col span={4}>
                    <Text style={{ ...themeText.label.label2, textAlign: 'right' }} c={themeColors.black[9]} >
                        Total Debit <Text component="span" c={themeColors.primary[6]} style={themeText.label.label2} ml='md'>Rp {totalDebit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</Text>
                    </Text>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Text style={{ ...themeText.label.label2, textAlign: 'right' }} c={themeColors.black[9]}>
                        Total Kredit <Text component="span" c={themeColors.primary[6]} style={themeText.label.label2} ml='md'>Rp {totalCredit.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</Text>
                    </Text>
                </Grid.Col>
                <Grid.Col span={1} />
            </Grid>
        </Box>
    );
};

export default TotalAmount;
