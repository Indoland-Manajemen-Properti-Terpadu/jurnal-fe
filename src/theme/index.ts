import { themeColors } from '@/theme';
import { figmaSpacing, themeText, semanticColors } from './constants';
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
  fontFamily: themeText.fontFamily,

  headings: {
    fontFamily: themeText.fontFamily,
    fontWeight: '600',
    sizes: {
      h1: {
        fontSize: themeText.heading.h1.fontSize,
        lineHeight: themeText.heading.h1.lineHeight,
        fontWeight: '600',
      },
      h2: {
        fontSize: themeText.heading.h2.fontSize,
        lineHeight: themeText.heading.h2.lineHeight,
        fontWeight: '600',
      },
      h3: {
        fontSize: themeText.heading.h3.fontSize,
        lineHeight: themeText.heading.h3.lineHeight,
        fontWeight: '600',
      },
      h4: {
        fontSize: themeText.heading.h4.fontSize,
        lineHeight: themeText.heading.h4.lineHeight,
        fontWeight: '600',
      },
      h5: {
        fontSize: themeText.heading.h5.fontSize,
        lineHeight: themeText.heading.h5.lineHeight,
        fontWeight: '600',
      },
      h6: {
        fontSize: themeText.heading.h6.fontSize,
        lineHeight: themeText.heading.h6.lineHeight,
        fontWeight: '600',
      },
    },
  },

  fontSizes: {
    xs: themeText.body.body4.fontSize,
    sm: themeText.body.body3.fontSize,
    md: themeText.body.body2.fontSize,
    lg: themeText.body.body1.fontSize,
    xl: themeText.heading.h6.fontSize,
  },

  spacing: {
    xs: figmaSpacing.xs,
    sm: figmaSpacing.sm,
    md: figmaSpacing.base,
    lg: figmaSpacing.md,
    xl: figmaSpacing.lg,
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
    figma: {
      spacing: figmaSpacing,

      typography: themeText,
      colors: semanticColors,
    },
  },
});
