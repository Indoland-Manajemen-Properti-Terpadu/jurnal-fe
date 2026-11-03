import { ThemeIcon, Tooltip } from '@mantine/core';
import { IconArchive } from '@tabler/icons-react';

type ArchivedContactIndicatorProps = {
  label: string;
};

export function ArchivedContactIndicator({ label }: ArchivedContactIndicatorProps) {
  return (
    <Tooltip label={label} withArrow>
      <ThemeIcon
        size={28}
        radius="xl"
        variant="light"
        color="gray"
        aria-label={label}
        style={{ flex: '0 0 28px' }}
      >
        <IconArchive size={15} stroke={1.8} />
      </ThemeIcon>
    </Tooltip>
  );
}
