import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from 'expo-router';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

/** Chalkboard palette. Dark mode is the "board", light mode is "paper". */
export const chalk = {
  board: '#16221C',
  boardRaised: '#1E2C25',
  boardHigh: '#27382F',
  boardLine: '#3D5246',
  white: '#F4F1E6',
  dust: '#B9C2BB',
  yellow: '#F2D479',
  pink: '#F2A7B5',
  blue: '#9CC7E8',
  green: '#A8E0B0',
  lavender: '#D9B8F0',
  orange: '#F5C39C',
  mint: '#8FE3D8',
  sand: '#E8D5B5',
  red: '#F28B82',
} as const;

/** Assigned to players in order; cycles past eight. Readable on both themes. */
export const PLAYER_COLORS: string[] = [
  chalk.yellow,
  chalk.pink,
  chalk.blue,
  chalk.green,
  chalk.lavender,
  chalk.orange,
  chalk.mint,
  chalk.sand,
];

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: chalk.yellow,
    onPrimary: '#2A2106',
    primaryContainer: '#4A3D12',
    onPrimaryContainer: '#FBEBB4',
    secondary: chalk.pink,
    onSecondary: '#3A1A22',
    secondaryContainer: '#5A2E38',
    onSecondaryContainer: '#FFD9E0',
    tertiary: chalk.blue,
    onTertiary: '#12293A',
    tertiaryContainer: '#244258',
    onTertiaryContainer: '#D6ECFB',
    error: chalk.red,
    onError: '#3B0907',
    errorContainer: '#6B1D19',
    onErrorContainer: '#FFDAD6',
    background: chalk.board,
    onBackground: chalk.white,
    surface: chalk.board,
    onSurface: chalk.white,
    surfaceVariant: chalk.boardHigh,
    onSurfaceVariant: chalk.dust,
    outline: chalk.boardLine,
    outlineVariant: '#2E4036',
    inverseSurface: chalk.white,
    inverseOnSurface: chalk.board,
    inversePrimary: '#7A6520',
    surfaceDisabled: 'rgba(244,241,230,0.12)',
    onSurfaceDisabled: 'rgba(244,241,230,0.38)',
    backdrop: 'rgba(8,14,11,0.6)',
    elevation: {
      level0: 'transparent',
      level1: '#1C2A23',
      level2: '#1E2C25',
      level3: '#223229',
      level4: '#25352C',
      level5: '#27382F',
    },
  },
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2F5D48',
    onPrimary: '#FFFFFF',
    primaryContainer: '#CDE8DA',
    onPrimaryContainer: '#0B2419',
    secondary: '#A8465A',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFD9E0',
    onSecondaryContainer: '#3F0716',
    tertiary: '#2E5F88',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#D3E6F7',
    onTertiaryContainer: '#0B2338',
    background: '#FAF7EF',
    onBackground: '#1B2320',
    surface: '#FAF7EF',
    onSurface: '#1B2320',
    surfaceVariant: '#E8E4D8',
    onSurfaceVariant: '#525C56',
    outline: '#8B958E',
    outlineVariant: '#CFD6D0',
    inverseSurface: '#2C3530',
    inverseOnSurface: '#F1EEE4',
    inversePrimary: '#A8D8C0',
    surfaceDisabled: 'rgba(27,35,32,0.12)',
    onSurfaceDisabled: 'rgba(27,35,32,0.38)',
    backdrop: 'rgba(44,53,48,0.4)',
    elevation: {
      level0: 'transparent',
      level1: '#F4F0E6',
      level2: '#F0EBDF',
      level3: '#ECE6D8',
      level4: '#EAE3D4',
      level5: '#E6DFCF',
    },
  },
};

/**
 * expo-router (SDK 56+) ships its own navigation theme and no longer accepts react-navigation
 * themes, so Paper's adaptNavigationTheme cannot be used. This mirrors its mapping by hand.
 */
function navThemeFrom(base: typeof NavLightTheme, paper: MD3Theme): typeof NavLightTheme {
  return {
    ...base,
    dark: paper.dark,
    colors: {
      ...base.colors,
      primary: paper.colors.primary,
      background: paper.colors.background,
      card: paper.colors.elevation.level2,
      text: paper.colors.onSurface,
      border: paper.colors.outline,
      notification: paper.colors.error,
    },
  };
}

const navLight = navThemeFrom(NavLightTheme, lightTheme);
const navDark = navThemeFrom(NavDarkTheme, darkTheme);

export function resolveThemes(scheme: string | null | undefined) {
  const isDark = scheme === 'dark';
  return {
    isDark,
    paper: isDark ? darkTheme : lightTheme,
    navigation: isDark ? navDark : navLight,
  };
}
