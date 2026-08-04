import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { TypographyVariant, useTheme } from '@/theme';

type ColorToken =
  | 'text'
  | 'textSecondary'
  | 'textTertiary'
  | 'textInverse'
  | 'primary'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'onPrimary';

interface Props extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  center?: boolean;
}

/** Typed, theme-aware Text. Every string in the app flows through this. */
export function Text({
  variant = 'body',
  color = 'text',
  center,
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();
  const variantStyle = theme.typography[variant] as TextStyle;
  return (
    <RNText
      {...rest}
      style={[
        variantStyle,
        { color: theme.colors[color] },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
