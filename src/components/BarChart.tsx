import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { formatCompact } from '@/utils/format';
import { Text } from './Text';

export interface BarDatum {
  label: string;
  value: number;
  /** Optional secondary value drawn behind (e.g. income behind expense). */
  secondary?: number;
  highlight?: boolean;
}

interface Props {
  data: BarDatum[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  currencySymbol?: string;
  showValues?: boolean;
}

/**
 * A grouped/overlaid bar chart implemented with plain views. Bars animate their
 * height via flex and stay perfectly aligned to a baseline.
 */
export function BarChart({
  data,
  height = 160,
  color,
  secondaryColor,
  currencySymbol = '₹',
  showValues = true,
}: Props) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.secondary ?? 0)));
  const barColor = color ?? theme.colors.primary;
  const secColor = secondaryColor ?? theme.colors.surfaceSunken;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 10 }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 24);
          const secH = d.secondary != null ? (d.secondary / max) * (height - 24) : 0;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              {showValues && d.value > 0 && (
                <Text variant="caption" color="textTertiary" style={{ marginBottom: 4 }}>
                  {formatCompact(d.value, currencySymbol)}
                </Text>
              )}
              <View
                style={{
                  width: '72%',
                  height: Math.max(h, secH, 3),
                  justifyContent: 'flex-end',
                }}
              >
                {d.secondary != null && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: '100%',
                      height: Math.max(secH, 3),
                      borderRadius: 8,
                      backgroundColor: secColor,
                    }}
                  />
                )}
                <View
                  style={{
                    width: '100%',
                    height: Math.max(h, 3),
                    borderRadius: 8,
                    backgroundColor: d.highlight === false ? theme.colors.textTertiary : barColor,
                    opacity: d.highlight === false ? 0.35 : 1,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, gap: 10 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              variant="caption"
              color={d.highlight ? 'text' : 'textTertiary'}
            >
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
