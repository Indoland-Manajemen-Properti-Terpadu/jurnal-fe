import type { ReactNode } from 'react';
import { Alert } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconXboxX,
  type Icon,
} from '@tabler/icons-react';

export type NoteTone = 'neutral' | 'info' | 'warning' | 'danger';

const TONE: Record<NoteTone, { color: string; icon: Icon }> = {
  neutral: { color: 'gray', icon: IconInfoCircle },
  info: { color: 'primary', icon: IconCircleCheck },
  warning: { color: 'yellow', icon: IconAlertTriangle },
  danger: { color: 'red', icon: IconXboxX },
};

/** The one page-level note. Colour follows the real state: waiting, refused, or just information. */
export const StatusNote = ({
  tone,
  title,
  children,
}: Readonly<{ tone: NoteTone; title?: string; children: ReactNode }>) => {
  const { color, icon: NoteIcon } = TONE[tone];
  return (
    <Alert variant="light" radius="md" color={color} title={title} icon={<NoteIcon size={18} />}>
      {children}
    </Alert>
  );
};
