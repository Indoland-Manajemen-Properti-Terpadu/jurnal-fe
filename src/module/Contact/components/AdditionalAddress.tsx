import { themeColors } from "@/theme";
import { Grid, TextInput, Text, Stack } from "@mantine/core";

const AdditionalAddress = () => (
    <Stack gap={10}>
        <Text c={themeColors.defaultBlack[10]} fw={500} fz={14}>Additional Address</Text>
        <Grid align='center'>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="No"
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="Zip Code"
                />
            </Grid.Col>
        </Grid>
        <Grid>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="RT"
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="RW"
                />
            </Grid.Col>
        </Grid>
        <Grid>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="District"
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="Sub District"
                />
            </Grid.Col>
        </Grid>
        <Grid>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="Regency/City"
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput
                    placeholder="Province"
                />
            </Grid.Col>
        </Grid>
    </Stack>
);

export default AdditionalAddress;