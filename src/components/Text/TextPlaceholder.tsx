import React from 'react';
import { Stack, Text } from '@mantine/core';
import { themeColors } from '@/theme';

type CustomTextProps = {
  mainText: React.ReactNode;
  subText: React.ReactNode;
  required?: boolean;
  fw?: number;
  ta?: 'left' | 'center' | 'right';
  c?: string;
  fz?: number;
  fzP?: number;
  fwP?: number;
  ff?: string;
};

export const TextwithAsterisk: React.FC<CustomTextProps> = ({
  mainText,
  subText,
  required = false,
  fw = 600,
  fwP = 400,
  fz = 14,
  fzP = 12,
  ff = 'Figtree',
}) => (
  <Stack gap="xs">
    <Text fw={fw} fz={fz} ff={ff} c={themeColors.slate[6]} mb={1}>
      {mainText}
      {required && <span style={{ color: 'red' }}> *</span>}
    </Text>
    <Text fw={fwP} fz={fzP} ff={ff} c={themeColors.gray[6]} mt={0}>
      {subText}
    </Text>
  </Stack>
);

