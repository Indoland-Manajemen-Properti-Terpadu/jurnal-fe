import React from 'react';
import { Group, MantineGradient, Text } from '@mantine/core';
import classes from './CustomText.module.css';
import { gradientColors, themeColors } from '@/theme';

type CustomTextProps = {
  children: React.ReactNode;
  amount?: React.ReactNode;
  gradient?: MantineGradient;
  variant?: string;
  mainColor?: string;
  colorTextAmont?: string;
  fw?: number;
  ta?: 'left' | 'center' | 'right';
  fz?: number;
  ff?: string;
  lh?: number;
};

export const HeadingText: React.FC<CustomTextProps> = ({
  children,
  fw = 700,
  ff = 'Montserrat',
  ta,
  mainColor = 'black',
  fz,
}) => (
  <Text fw={fw} ta={ta} c={mainColor} fz={fz}>
    {children}
  </Text>
);

export const TextMediumGR: React.FC<CustomTextProps> = ({
  children,
  variant = 'gradient',
  gradient = gradientColors.gradient,
  fw = 500,
  fz = 18,
}) => (
  <Text variant={variant} fw={fw} fz={fz} gradient={gradient} >
    {children}
  </Text>
);


export const TextAmount: React.FC<CustomTextProps> = ({
  children,
  amount,
  colorTextAmont,
  mainColor,
  ta,
  fz = 14,
  ff = 'Montserrat',
}) => (
  <Group
    align='center'
    style={{
      whiteSpace: 'nowrap',
      flexWrap: 'nowrap',
    }}
  >
    <Text fz={fz} ff={ff} c={mainColor} ta={ta} style={{ marginRight: 5 }}>
      {children}
    </Text>
    <Text fz={fz} c={colorTextAmont}>
      {amount}
    </Text>
  </Group>
);

