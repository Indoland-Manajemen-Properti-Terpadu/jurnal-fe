import { Group, Text, ThemeIcon } from '@mantine/core';

interface StepHeadingProps {
  title: string;
  description: string;
  step: number;
}

/** The card title every step opens with: a numbered orb, a bold title and a dimmed line. */
export const StepHeading = ({ title, description, step }: Readonly<StepHeadingProps>) => (
  <Group gap="sm" wrap="nowrap">
    <ThemeIcon size={36} radius="xl" variant="light" color="primary">
      <Text fw={700} size="sm">
        {step}
      </Text>
    </ThemeIcon>
    <div>
      <Text fw={700} fz="md">
        {title}
      </Text>
      <Text fz="xs" c="dimmed">
        {description}
      </Text>
    </div>
  </Group>
);
