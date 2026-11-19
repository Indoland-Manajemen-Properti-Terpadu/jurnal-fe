import type { ReactNode } from 'react';
import { Box, Group, Paper, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

export interface WizardStep {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
}

interface WizardStepperProps {
  steps: WizardStep[];
  /** Index of the step on screen. */
  active: number;
  /** Earlier steps can be revisited; later ones only through "Lanjut" so each is validated. */
  onStepClick: (index: number) => void;
}

/**
 * The shared stepper of every sales form: an icon orb per step with "LANGKAH n", the title and a
 * dimmed line. Done steps are filled, the current one is outlined, later ones are grey.
 */
export function WizardStepper({ steps, active, onStepClick }: Readonly<WizardStepperProps>) {
  const { t } = useTranslation('sales');

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group
        component="ol"
        gap="md"
        wrap="nowrap"
        align="center"
        m={0}
        p={0}
        style={{ listStyle: 'none' }}
        aria-label={t('form.stepperAria')}
      >
        {steps.map((step, index) => {
          const state = index < active ? 'done' : index === active ? 'current' : 'todo';
          const reachable = index <= active;
          return (
            <Group
              key={step.id}
              component="li"
              gap="md"
              wrap="nowrap"
              align="center"
              flex={index < steps.length - 1 ? 1 : '0 0 auto'}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <UnstyledButton
                onClick={() => reachable && onStepClick(index)}
                disabled={!reachable}
                style={{ cursor: reachable ? 'pointer' : 'default' }}
              >
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    size={44}
                    radius="xl"
                    variant={state === 'done' ? 'filled' : state === 'current' ? 'white' : 'light'}
                    color={state === 'todo' ? 'gray' : 'primary'}
                    bd={
                      state === 'current' ? '2px solid var(--mantine-color-primary-6)' : undefined
                    }
                  >
                    {state === 'done' ? <IconCheck size={20} /> : step.icon}
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text
                      size="xs"
                      fw={600}
                      tt="uppercase"
                      c={state === 'todo' ? 'dimmed' : 'primary.6'}
                    >
                      {t('form.stepLabel', { count: String(index + 1) })}
                    </Text>
                    <Text size="sm" fw={700} lh={1.3}>
                      {step.label}
                    </Text>
                    <Text size="xs" c="dimmed" visibleFrom="md">
                      {step.description}
                    </Text>
                  </Stack>
                </Group>
              </UnstyledButton>
              {index < steps.length - 1 && (
                <Box
                  flex={1}
                  h={2}
                  miw={24}
                  bg={index < active ? 'primary.6' : 'gray.3'}
                  style={{ borderRadius: 2 }}
                />
              )}
            </Group>
          );
        })}
      </Group>
    </Paper>
  );
}
