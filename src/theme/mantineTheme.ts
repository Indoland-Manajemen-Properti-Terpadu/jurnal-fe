import {
  ActionIcon,
  Button,
  createTheme,
  Input,
  Loader,
  Modal,
  NumberInput,
  Paper,
  PasswordInput,
  Select,
  Table,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import classes from './components.module.css';
import {
  breakpoints,
  defaultRadius,
  fontFamily,
  fontSizes,
  fontWeights,
  headingStyles,
  mantineLineHeights,
  palette,
  radius,
  shadows,
  spacing,
  themeColors,
} from './tokens';

const headingSize = (level: keyof typeof headingStyles) => ({
  fontSize: headingStyles[level].fontSize,
  lineHeight: headingStyles[level].lineHeight,
  fontWeight: String(headingStyles[level].fontWeight),
});

const smallInputDefaults = {
  defaultProps: { size: 'sm' },
  classNames: { label: classes.inputLabel },
} as const;

export const myTheme = createTheme({
  colors: themeColors,
  primaryColor: 'primary',
  primaryShade: 6,
  white: palette.white[500],
  black: palette.black[500],

  fontFamily,
  fontSmoothing: true,
  fontSizes: {
    xs: fontSizes.xs,
    sm: fontSizes.sm,
    md: fontSizes.md,
    lg: fontSizes.lg,
    xl: fontSizes.xl,
  },
  lineHeights: mantineLineHeights,
  headings: {
    fontFamily,
    fontWeight: String(fontWeights.semibold),
    sizes: {
      h1: headingSize('h1'),
      h2: headingSize('h2'),
      h3: headingSize('h3'),
      h4: headingSize('h4'),
      h5: headingSize('h5'),
      h6: headingSize('h6'),
    },
  },

  spacing,
  radius,
  defaultRadius,
  shadows,
  breakpoints,

  components: {
    ActionIcon: ActionIcon.extend({ defaultProps: { variant: 'subtle' } }),
    Loader: Loader.extend({ defaultProps: { type: 'bars' } }),
    Button: Button.extend({
      defaultProps: { size: 'md', radius: 'md' },
      classNames: { root: classes.buttonRoot },
    }),
    Input: Input.extend({ classNames: { input: classes.input } }),
    TextInput: TextInput.extend(smallInputDefaults),
    Select: Select.extend(smallInputDefaults),
    NumberInput: NumberInput.extend(smallInputDefaults),
    Textarea: Textarea.extend(smallInputDefaults),
    PasswordInput: PasswordInput.extend(smallInputDefaults),
    DateInput: DateInput.extend(smallInputDefaults),
    DatePickerInput: DatePickerInput.extend(smallInputDefaults),
    Paper: Paper.extend({
      defaultProps: { p: 'md', radius: 'md', shadow: 'sm' },
      classNames: { root: classes.paperRoot },
    }),
    Table: Table.extend({
      classNames: {
        table: classes.table,
        thead: classes.tableHead,
        th: classes.tableTh,
        td: classes.tableTd,
        tr: classes.tableTr,
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'md',
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      },
      classNames: { title: classes.modalTitle },
    }),
  },
});
