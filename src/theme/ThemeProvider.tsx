import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useFinance } from '@/store/FinanceStore';
import { darkColors, lightColors, ThemeColors } from './colors';
import { radius, shadow, spacing, typography } from './tokens';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: (level?: 'sm' | 'md' | 'lg') => object;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const { settings } = useFinance();
  const preference = settings.theme ?? 'system';
  const isDark = preference === 'dark' || (preference === 'system' && scheme === 'dark');

  const theme = useMemo<Theme>(() => {
    const colors = isDark ? darkColors : lightColors;
    return {
      colors,
      spacing,
      radius,
      typography,
      isDark,
      shadow: (level: 'sm' | 'md' | 'lg' = 'md') => shadow(colors.shadow, level),
    };
  }, [isDark]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
