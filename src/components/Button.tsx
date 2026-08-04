import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  fullWidth = true,
  style,
}: Props) {
  const theme = useTheme();

  const bg =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.surfaceSunken
        : 'transparent';
  const fg =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.text;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        {
          height: 54,
          borderRadius: theme.radius.lg,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: theme.spacing.xl,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' && !theme.isDark && theme.shadow('sm'),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={20} color={fg} />}
          <Text variant="headline" style={{ color: fg }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
