import { Anchor, Group, Text } from '@mantine/core';

export interface LinkedRef {
  label: string;
  /** Hidden while the document has no number to show. */
  number: string | null;
  onOpen: () => void;
}

/** The customer, then the documents this one is tied to, each opening on a click. */
export function DocLinkedRefs({
  customerName,
  refs,
}: Readonly<{ customerName: string; refs: LinkedRef[] }>) {
  return (
    <Group gap="xs" wrap="wrap">
      <Text size="sm" c="dimmed">
        {customerName || '–'}
      </Text>
      {refs
        .filter((ref) => ref.number)
        .map((ref) => (
          <Group key={ref.label} gap={6} wrap="nowrap">
            <Text size="sm" c="dimmed" aria-hidden>
              ·
            </Text>
            <Text size="sm" c="dimmed">
              {ref.label}
            </Text>
            <Anchor component="button" type="button" size="sm" fw={600} onClick={ref.onOpen}>
              {ref.number}
            </Anchor>
          </Group>
        ))}
    </Group>
  );
}
