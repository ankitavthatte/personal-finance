import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  onKey: (key: string) => void;
  onBackspace: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

/** A tactile numeric keypad for lightning-fast amount entry. */
export function Keypad({ onKey, onBackspace }: Props) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {KEYS.map((k) => {
        const isBack = k === 'back';
        return (
          <Pressable
            key={k}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              if (isBack) onBackspace();
              else onKey(k);
            }}
            onLongPress={() => {
              if (isBack) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                onBackspace();
              }
            }}
            style={({ pressed }) => ({
              width: '33.33%',
              height: 62,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.lg,
              backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent',
            })}
          >
            {isBack ? (
              <Ionicons name="backspace-outline" size={26} color={theme.colors.text} />
            ) : (
              <Text style={{ fontSize: 27, fontWeight: '600', color: theme.colors.text }}>{k}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
