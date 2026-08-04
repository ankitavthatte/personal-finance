import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { categoryPalette, CategoryColorKey, useTheme } from '@/theme';

interface Props {
  icon: string;
  color: CategoryColorKey | string;
  size?: number;
  /** Fill the circle with the solid color instead of a soft tint. */
  solid?: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveCategoryColor(color: string): string {
  return (categoryPalette as Record<string, string>)[color] ?? color;
}

/** A colored circular chip holding a category glyph. */
export function CategoryIcon({ icon, color, size = 44, solid = false }: Props) {
  const theme = useTheme();
  const hex = resolveCategoryColor(color);
  const bg = solid ? hex : hexToRgba(hex, theme.isDark ? 0.22 : 0.14);
  const fg = solid ? '#FFFFFF' : hex;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.6,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon as any} size={size * 0.5} color={fg} />
    </View>
  );
}
