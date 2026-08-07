import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, PinPad, Text } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

type Stage = 'menu' | 'verify' | 'new' | 'confirm';
type Intent = 'change' | 'off';

export default function LockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, updateSettings } = useFinance();
  const hasPin = !!settings.pin;

  const [stage, setStage] = useState<Stage>(hasPin ? 'menu' : 'new');
  const [intent, setIntent] = useState<Intent>('change');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);

  const bump = () => setAttempt((a) => a + 1);

  const onVerify = (pin: string) => {
    bump();
    if (pin !== settings.pin) {
      setError('Wrong PIN. Try again.');
      return;
    }
    setError(undefined);
    if (intent === 'off') {
      updateSettings({ pin: '' });
      router.back();
    } else {
      setStage('new');
    }
  };

  const onNew = (pin: string) => {
    bump();
    setFirstPin(pin);
    setError(undefined);
    setStage('confirm');
  };

  const onConfirm = (pin: string) => {
    bump();
    if (pin !== firstPin) {
      setError('PINs did not match. Try again.');
      setStage('new');
      return;
    }
    updateSettings({ pin });
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
        }}
      >
        <Text variant="title2">App lock</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', paddingBottom: theme.spacing['4xl'] }}>
        {stage === 'menu' ? (
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <View style={{ alignItems: 'center', marginBottom: theme.spacing['3xl'] }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: theme.colors.primaryMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons name="lock-closed" size={32} color={theme.colors.primary} />
              </View>
              <Text variant="title2" center>
                App lock is on
              </Text>
              <Text variant="body" color="textSecondary" center style={{ marginTop: theme.spacing.sm }}>
                Pennywise asks for your PIN each time it opens.
              </Text>
            </View>
            <Button
              label="Change PIN"
              onPress={() => {
                setIntent('change');
                setError(undefined);
                setStage('verify');
              }}
            />
            <Button
              label="Turn off app lock"
              variant="secondary"
              onPress={() => {
                setIntent('off');
                setError(undefined);
                setStage('verify');
              }}
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        ) : (
          <PinPad
            key={`${stage}-${attempt}`}
            title={
              stage === 'verify'
                ? 'Enter current PIN'
                : stage === 'new'
                  ? 'Choose a PIN'
                  : 'Confirm your PIN'
            }
            subtitle={stage === 'new' ? 'Pick a 4-digit PIN' : undefined}
            error={error}
            onComplete={stage === 'verify' ? onVerify : stage === 'new' ? onNew : onConfirm}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
