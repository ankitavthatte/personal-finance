import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';

interface Props {
  /** 0..1 (values above 1 are clamped visually). */
  progress: number;
  color?: string;
  track?: string;
  height?: number;
  rounded?: boolean;
}

export function ProgressBar({ progress, color, track, height = 8, rounded = true }: Props) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{
        height,
        borderRadius: rounded ? height / 2 : 0,
        backgroundColor: track ?? theme.colors.surfaceSunken,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: rounded ? height / 2 : 0,
          backgroundColor: color ?? theme.colors.primary,
        }}
      />
    </View>
  );
}
