import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import { PinPad } from './PinPad';

/**
 * Blocks the app behind a PIN when app lock is enabled. Unlock state is kept in
 * memory only, so the lock re-arms every cold launch.
 */
export function LockGate({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { settings, hydrated } = useFinance();
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const hasPin = !!settings.pin;
  if (!hydrated || !hasPin || unlocked) return <>{children}</>;

  const onComplete = (pin: string) => {
    if (pin === settings.pin) {
      setError(undefined);
      setUnlocked(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError('Wrong PIN. Try again.');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing['2xl'],
      }}
    >
      <PinPad title="Enter PIN" subtitle="Unlock Pennywise" error={error} onComplete={onComplete} />
    </View>
  );
}
