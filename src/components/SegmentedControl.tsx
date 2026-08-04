import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

/** iOS-style segmented control used for expense/income and range toggles. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceSunken,
        borderRadius: theme.radius.lg,
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(opt.value);
            }}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: theme.radius.md,
              alignItems: 'center',
              backgroundColor: active ? theme.colors.surface : 'transparent',
              ...(active && !theme.isDark ? theme.shadow('sm') : {}),
            }}
          >
            <Text
              variant="callout"
              color={active ? 'text' : 'textSecondary'}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
