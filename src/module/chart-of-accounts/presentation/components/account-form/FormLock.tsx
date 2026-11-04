import React from 'react';
import { Box } from '@mantine/core';

interface FormLockProps {
  locked: boolean;
  children: React.ReactNode;
}

/** Makes every control inside read-only: a disabled fieldset, plus no pointer events for the card pickers. */
export const FormLock: React.FC<FormLockProps> = ({ locked, children }) => (
  <Box
    component="fieldset"
    disabled={locked}
    style={{
      border: 0,
      margin: 0,
      padding: 0,
      minWidth: 0,
      ...(locked ? { pointerEvents: 'none', opacity: 0.7 } : {}),
    }}
  >
    {children}
  </Box>
);
