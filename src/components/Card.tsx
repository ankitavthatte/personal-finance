import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}

/** The primary surface used across the app — soft, rounded, subtly elevated. */
export function Card({ children, style, padded = true, elevated = true }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius['2xl'],
          padding: padded ? theme.spacing.xl : 0,
          borderWidth: theme.isDark ? 1 : 0,
          borderColor: theme.colors.border,
        },
        elevated && !theme.isDark && theme.shadow('sm'),
        style,
      ]}
    >
      {children}
    </View>
  );
}
