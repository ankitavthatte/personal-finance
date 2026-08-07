import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface Props {
  title: string;
  subtitle?: string;
  /** Shown in red under the dots; also shakes/clears the entry. */
  error?: string;
  /** Called with the full 4-digit code once entered. */
  onComplete: (pin: string) => void;
}

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

/** A 4-digit PIN entry pad with dot indicators. Reused for lock and setup. */
export function PinPad({ title, subtitle, error, onComplete }: Props) {
  const theme = useTheme();
  const [entry, setEntry] = useState('');

  // Clear the entry whenever the parent reports an error (e.g. wrong PIN).
  useEffect(() => {
    if (error) setEntry('');
  }, [error]);

  const press = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (key === 'back') {
      setEntry((p) => p.slice(0, -1));
      return;
    }
    setEntry((p) => {
      if (p.length >= PIN_LENGTH) return p;
      const next = p + key;
      if (next.length === PIN_LENGTH) {
        // Defer so the last dot renders before the parent reacts.
        setTimeout(() => onComplete(next), 60);
      }
      return next;
    });
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="title2" center>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" color="textSecondary" center style={{ marginTop: theme.spacing.sm }}>
          {subtitle}
        </Text>
      ) : null}

      {/* Dots */}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: theme.spacing['2xl'], height: 18 }}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: i < entry.length ? theme.colors.primary : theme.colors.surfaceSunken,
              borderWidth: 1,
              borderColor: i < entry.length ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ height: 20, marginTop: theme.spacing.md }}>
        {error ? (
          <Text variant="footnote" center style={{ color: theme.colors.negative }}>
            {error}
          </Text>
        ) : null}
      </View>

      {/* Keypad */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 280, marginTop: theme.spacing.lg }}>
        {KEYS.map((k, i) => {
          if (k === '') return <View key={i} style={{ width: '33.33%', height: 72 }} />;
          const isBack = k === 'back';
          return (
            <Pressable
              key={i}
              onPress={() => press(k)}
              style={({ pressed }) => ({
                width: '33.33%',
                height: 72,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              {({ pressed }) => (
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? theme.colors.surfaceSunken : 'transparent',
                  }}
                >
                  {isBack ? (
                    <Ionicons name="backspace-outline" size={26} color={theme.colors.text} />
                  ) : (
                    <Text style={{ fontSize: 28, fontWeight: '600', color: theme.colors.text }}>
                      {k}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
