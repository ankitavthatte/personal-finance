/**
 * Spacing, radius, typography and shadow tokens.
 * A single source of truth keeps every screen visually consistent.
 */
import { Platform, TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 999,
} as const;

/**
 * Type scale. We lean on system fonts (SF Pro on iOS, Roboto on Android) which
 * is exactly what native-feeling apps like Copilot do — clean and familiar.
 */
export const typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  callout: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  subhead: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Big numeric display used for balances — tabular figures keep digits aligned.
  amountHero: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  amountLarge: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Elevation presets. iOS gets soft shadows, Android gets matching elevation. */
export const shadow = (color: string, level: 'sm' | 'md' | 'lg' = 'md') => {
  const presets = {
    sm: { radius: 6, offset: 2, opacity: 0.08, elevation: 2 },
    md: { radius: 16, offset: 6, opacity: 0.1, elevation: 6 },
    lg: { radius: 28, offset: 12, opacity: 0.16, elevation: 12 },
  } as const;
  const p = presets[level];
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: p.offset },
      shadowOpacity: p.opacity,
      shadowRadius: p.radius,
    },
    android: { elevation: p.elevation, shadowColor: color },
    default: {},
  });
};
