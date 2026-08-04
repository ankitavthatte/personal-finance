import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface DonutSegment {
  value: number;
  color: string;
}

interface Props {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

/**
 * A ring chart built directly on react-native-svg — no chart library needed.
 * Segments are drawn as stroked arcs using dash offsets, which keeps it crisp
 * at any size and lets us match the exact look of premium finance apps.
 */
export function DonutChart({ segments, size = 180, strokeWidth = 22, children }: Props) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const gap = total > 0 && segments.length > 1 ? 0.012 * circumference : 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.surfaceSunken}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {total > 0 &&
            segments.map((seg, i) => {
              const fraction = seg.value / total;
              const dash = Math.max(fraction * circumference - gap, 0.0001);
              const circle = (
                <Circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += fraction * circumference;
              return circle;
            })}
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
