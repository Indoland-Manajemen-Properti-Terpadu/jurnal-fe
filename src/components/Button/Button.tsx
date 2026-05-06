import { Button, MantineGradient } from '@mantine/core';
import { MouseEventHandler } from 'react';


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
  ff = 'Figtree',
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
    onClick={onClick}
  >
    {children}
  </Button>
);

export const GradientButton: React.FC<CustomTextProps> = ({
  children,
  onClick,
  ff = 'Figtree',
  variant = 'gradient',
  disabled = false,
  gradient = { from: 'blue', to: 'cyan', deg: 90 },
}) => (
  <Button variant={variant} ff={ff} gradient={gradient} onClick={onClick}>
    {children}
  </Button>
);
