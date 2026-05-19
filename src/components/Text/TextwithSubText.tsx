import React from 'react';
import { Stack, Text } from '@mantine/core';
import { themeColors } from '@/theme';

type CustomTextProps = {
    mainText: React.ReactNode;
    subText?: React.ReactNode;
    subObject?: React.ReactNode;
    required?: boolean;
    mainColor?: string;
    subColor?: string;
    mainfw?: number;
    subfw?: number;
    mainFz?: number;
    subFz?: number;
    ta?: 'left' | 'center' | 'right';

};

export const TextWithSubText: React.FC<CustomTextProps> = ({
    mainText,
    subText,
    mainColor = themeColors.slate[6],
    subColor = themeColors.black[9],
    required = false,
    mainfw = 600,
    subfw = 400,
    mainFz = 14,
    subFz = 14,
}) => (
    <Stack gap={1}>
        <Text fw={mainfw} fz={mainFz} c={mainColor} mb={0}>
            {mainText}
        </Text>
        <Text fw={subfw} fz={subFz} c={subColor} mt={0}>
            {subText}
        </Text>
    </Stack>
);

export const TextWithSubObject: React.FC<CustomTextProps> = ({
    mainText,
    subObject,
    mainColor = themeColors.slate[6],
    required = false,
    mainfw = 600,
    mainFz = 14,

}) => (
    <Stack gap={1}>
        <Text fw={mainfw} fz={mainFz} c={mainColor} mb={0}>
            {mainText}
        </Text>
        {subObject}
    </Stack>
);



