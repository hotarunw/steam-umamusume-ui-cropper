import type { ThemeDefinition } from 'vuetify';
import colors from 'vuetify/util/colors';

export const myCustomLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: colors.green.base,
    background: colors.grey.lighten3,
  },
};
