/**
 * Color system for Pennywise.
 *
 * The palette takes cues from the best-in-class finance apps (Copilot Money,
 * Monarch) — a calm, money-green brand color, soft off-white surfaces in light
 * mode, deep near-black surfaces in dark mode, and a curated set of accent hues
 * used for category coding.
 */

export const brand = {
  green: '#0B7A5B',
  greenLight: '#12A277',
  greenSoft: '#E4F5EE',
};

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSunken: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Brand / accents
  primary: string;
  primaryMuted: string;
  onPrimary: string;

  // Semantic
  income: string;
  expense: string;
  positive: string;
  negative: string;
  warning: string;

  // Lines / misc
  border: string;
  divider: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#EEF0F3',

  text: '#0F1417',
  textSecondary: '#5B6570',
  textTertiary: '#98A1AC',
  textInverse: '#FFFFFF',

  primary: brand.green,
  primaryMuted: brand.greenSoft,
  onPrimary: '#FFFFFF',

  income: '#12A277',
  expense: '#111417',
  positive: '#12A277',
  negative: '#E5484D',
  warning: '#F5A623',

  border: '#E6E8EC',
  divider: '#EDEFF2',
  overlay: 'rgba(15, 20, 23, 0.45)',
  tabBar: 'rgba(255,255,255,0.94)',
  tabBarBorder: '#E6E8EC',
  shadow: '#0F1417',
};

export const darkColors: ThemeColors = {
  background: '#0A0C0E',
  surface: '#14181B',
  surfaceElevated: '#1B2024',
  surfaceSunken: '#0F1315',

  text: '#F4F6F7',
  textSecondary: '#9AA4AD',
  textTertiary: '#5F6A72',
  textInverse: '#0A0C0E',

  primary: '#16B487',
  primaryMuted: '#12332A',
  onPrimary: '#04140F',

  income: '#2ED3A3',
  expense: '#F4F6F7',
  positive: '#2ED3A3',
  negative: '#FF6369',
  warning: '#FFB224',

  border: '#242A2F',
  divider: '#1E2429',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBar: 'rgba(20,24,27,0.94)',
  tabBarBorder: '#242A2F',
  shadow: '#000000',
};

/**
 * A curated categorical palette. Each hue is picked to stay legible on both
 * light and dark surfaces and to feel harmonious when several appear together
 * in a chart or list.
 */
export const categoryPalette = {
  green: '#12A277',
  teal: '#0EA5A5',
  blue: '#3B82F6',
  indigo: '#6366F1',
  violet: '#8B5CF6',
  purple: '#A855F7',
  pink: '#EC4899',
  red: '#EF4444',
  orange: '#F97316',
  amber: '#F59E0B',
  lime: '#84CC16',
  brown: '#A16207',
  slate: '#64748B',
  cyan: '#06B6D4',
  rose: '#F43F5E',
};

export type CategoryColorKey = keyof typeof categoryPalette;
