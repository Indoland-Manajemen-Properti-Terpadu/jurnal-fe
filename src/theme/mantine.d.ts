import type { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

type ProjectBrandColor = 'primary' | 'secondary';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ProjectBrandColor | DefaultMantineColor, MantineColorsTuple>;
  }
}
