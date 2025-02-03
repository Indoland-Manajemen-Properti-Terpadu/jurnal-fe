import { render as testingLibraryRender } from '@testing-library/react';
import { createTheme, MantineProvider } from '@mantine/core';
import { themeColors } from '@/theme';

const theme = createTheme({
  fontFamily: 'Montserrat, sans-serif',
  colors: themeColors,
});

export function render(ui: React.ReactNode) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={theme}>{children}</MantineProvider>
    ),
  });
}
