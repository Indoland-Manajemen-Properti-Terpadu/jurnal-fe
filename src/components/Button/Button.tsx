import { Button, MantineGradient } from '@mantine/core';
import { MouseEventHandler } from 'react';
import { buttonGradient } from '@/theme';

type CustomTextProps = {
  children: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: string;
  c?: string;
  disabled?: boolean;
  gradient?: MantineGradient;
  ff?: string;
  size?: string;
  leftSection?: React.ReactNode;
};

export const DefaultButton: React.FC<CustomTextProps> = ({
  children,
  onClick,
  ff,
  variant = 'light',
  disabled = false,
  c = 'gray',
  leftSection,
  size,
}) => (
  <Button
    variant={variant}
    ff={ff}
    color={c}
    leftSection={leftSection}
    size={size}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </Button>
);

export const GradientButton: React.FC<CustomTextProps> = ({
  children,
  onClick,
  ff,
  variant = 'gradient',
  disabled = false,
  gradient = buttonGradient.gradient,
}) => (
  <Button variant={variant} ff={ff} gradient={gradient} disabled={disabled} onClick={onClick}>
    {children}
  </Button>
);
