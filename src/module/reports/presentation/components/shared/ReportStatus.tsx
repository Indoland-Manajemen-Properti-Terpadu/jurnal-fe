import React from 'react';
import { Group, Text, Tooltip } from '@mantine/core';
import classes from './ReportShared.module.css';

interface ReportStatusProps {
  tone: 'ok' | 'warn' | 'neutral';
  label: React.ReactNode;
  tooltip?: string;
  icon?: React.ReactNode;
}

/** A status as a dot and a line of text, instead of a filled badge. */
export const ReportStatus: React.FC<ReportStatusProps> = ({ tone, label, tooltip, icon }) => {
  const color = tone === 'ok' ? 'teal.8' : tone === 'warn' ? 'red.7' : 'gray.7';
  const content = (
    <Group gap={6} wrap="nowrap">
      {icon ?? <span className={classes.statusDot} data-tone={tone} />}
      <Text fz="xs" fw={600} c={color}>
        {label}
      </Text>
    </Group>
  );
  return tooltip ? <Tooltip label={tooltip}>{content}</Tooltip> : content;
};
