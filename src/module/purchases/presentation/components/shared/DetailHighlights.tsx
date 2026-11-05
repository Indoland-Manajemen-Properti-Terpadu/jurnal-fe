import { Text, ThemeIcon } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import classes from '@/module/purchases/presentation/components/shared/DetailHighlights.module.css';

export interface Highlight {
  icon: Icon;
  label: string;
  value: string;
  /** Red only for a real problem, such as a bill past its due date. */
  alert?: boolean;
}

/** The four facts a reader looks for first, above the detail cards. */
export const DetailHighlights = ({ items }: Readonly<{ items: Highlight[] }>) => (
  <div className={classes.strip}>
    {items.map(({ icon: ItemIcon, label, value, alert }) => (
      <div key={label} className={classes.tile}>
        <ThemeIcon variant="light" color={alert ? 'red' : 'primary'} size={38} radius="md">
          <ItemIcon size={20} stroke={1.8} />
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={500}>
            {label}
          </Text>
          <Text className={classes.value} fz="md" fw={700} c={alert ? 'red.8' : 'dark.9'} lh={1.3}>
            {value}
          </Text>
        </div>
      </div>
    ))}
  </div>
);
