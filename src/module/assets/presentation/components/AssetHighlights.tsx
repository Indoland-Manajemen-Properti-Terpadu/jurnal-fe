import { Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import classes from '@/module/assets/presentation/components/AssetHighlights.module.css';

export interface AssetHighlight {
  icon: Icon;
  label: string;
  value: string;
  /** Small line under the value. */
  hint?: string;
  /** Makes the tile a button, for jumping to the part of the page it sums up. */
  onClick?: () => void;
}

/** The three or four facts a reader looks for first, in one strip, as on the purchasing pages. */
export function AssetHighlights({ items }: Readonly<{ items: AssetHighlight[] }>) {
  return (
    <div className={classes.strip} data-cols={items.length === 3 ? '3' : undefined}>
      {items.map(({ icon: ItemIcon, label, value, hint, onClick }) => {
        const body = (
          <>
            <ThemeIcon
              variant="light"
              color="primary"
              size={38}
              radius="md"
              className={classes.tileIcon}
            >
              <ItemIcon size={20} stroke={1.8} />
            </ThemeIcon>
            <div style={{ minWidth: 0 }}>
              <Text fz="xs" c="dimmed" fw={500}>
                {label}
              </Text>
              <Text className={classes.value} fz="md" fw={700} c="dark.9" lh={1.3}>
                {value}
              </Text>
              {hint && (
                <Text fz="xs" c="dimmed">
                  {hint}
                </Text>
              )}
            </div>
          </>
        );
        return onClick ? (
          <UnstyledButton key={label} className={classes.tile} onClick={onClick}>
            {body}
          </UnstyledButton>
        ) : (
          <div key={label} className={classes.tile}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

export default AssetHighlights;
