import { themeColors } from '@/theme';
import { ActionIcon, createTheme, Loader } from '@mantine/core';

export const myTheme = createTheme({
  primaryColor: 'cyan',
  fontSmoothing: true,
  defaultRadius: 'md',
  fontFamily: 'Montserrat, sans-serif',
  headings: { fontFamily: 'Montserrat, sans-serif' },
  components: {
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: 'subtle',
      },
    }),
    Loader: Loader.extend({
      defaultProps: {
        type: 'bars',
      },
    }),
  },
  colors: themeColors,
});
