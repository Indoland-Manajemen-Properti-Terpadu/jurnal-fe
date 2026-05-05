import { themeColors } from '@/theme';
import {
  ActionIcon,
  Button,
  createTheme,
  Input,
  Loader,
  Modal,
  Paper,
  Table,
  TextInput,
  rem,
} from '@mantine/core';

/**
 * Mantine v8 Theme Configuration
 * Using CSS variables system for styling
 * No more sx prop or styles API
 */
export const myTheme = createTheme({
  primaryColor: 'cyan',
  fontSmoothing: true,
  defaultRadius: 'md',
  fontFamily: 'Montserrat, sans-serif',

  headings: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(32), lineHeight: '1.3' },
      h2: { fontSize: rem(24), lineHeight: '1.35' },
      h3: { fontSize: rem(20), lineHeight: '1.4' },
      h4: { fontSize: rem(18), lineHeight: '1.45' },
      h5: { fontSize: rem(16), lineHeight: '1.5' },
      h6: { fontSize: rem(14), lineHeight: '1.5' },
    },
  },

  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },

  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(20),
    xl: rem(24),
  },

  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  colors: themeColors,

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

    Button: Button.extend({
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      classNames: {
        root: 'button-root',
      },
    }),

    Input: Input.extend({
      classNames: {
        input: 'input-base',
      },
    }),

    TextInput: TextInput.extend({
      defaultProps: {
        size: 'md',
      },
      classNames: {
        label: 'input-label',
      },
    }),

    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        radius: 'md',
        shadow: 'sm',
      },
      classNames: {
        root: 'paper-root',
      },
    }),

    Table: Table.extend({
      classNames: {
        table: 'table-base',
        thead: 'table-thead',
        th: 'table-th',
        td: 'table-td',
        tr: 'table-tr',
      },
    }),

    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'md',
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 3,
        },
      },
      classNames: {
        title: 'modal-title',
      },
    }),
  },

  // Custom properties for reusable values
  other: {
    tableStyles: {
      head: {
        borderColor: themeColors.grey[1],
        borderWidth: '1px',
        borderStyle: 'solid',
        fontWeight: 500,
        fontSize: 14,
      },
      row: {
        borderColor: themeColors.grey[1],
        borderWidth: '1px',
        borderStyle: 'solid',
      },
    },
  },
});
