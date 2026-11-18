import { Button, Paper, Stack, Text } from '@mantine/core';
import {
  AssetIllustration,
  type AssetIllustrationName,
} from '@/module/assets/presentation/components/AssetIllustration';

export type AssetFeatureCardProps = {
  illustration: AssetIllustrationName;
  /** The count or figure, large. */
  value: string;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  /** Nothing to act on: the button stays visible but disabled. */
  disabled?: boolean;
};

/** A drawing over a figure, what it is, a line of context and one button, as the bank cards. */
export function AssetFeatureCard({
  illustration,
  value,
  title,
  body,
  actionLabel,
  onAction,
  disabled,
}: Readonly<AssetFeatureCardProps>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white" h="100%">
      <Stack gap="xs" align="center" ta="center" h="100%" justify="space-between">
        <Stack gap="xs" align="center">
          <AssetIllustration name={illustration} maxWidth={120} />
          <Text fz={28} fw={800} lh={1.1} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Text>
          <Text fw={600}>{title}</Text>
          <Text fz="sm" c="dimmed">
            {body}
          </Text>
        </Stack>
        <Button
          variant="default"
          radius="md"
          fullWidth
          mt="sm"
          disabled={disabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </Stack>
    </Paper>
  );
}

export default AssetFeatureCard;
