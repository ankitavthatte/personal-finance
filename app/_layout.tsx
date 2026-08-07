import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LockGate } from '@/components';
import { FinanceProvider, useFinance } from '@/store/FinanceStore';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Redirects between the onboarding flow and the main tabs based on whether the
 * user has completed setup. This is the canonical expo-router "gate" pattern.
 */
function Gate({ children }: { children: React.ReactNode }) {
  const { hydrated, onboarded } = useFinance();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    SplashScreen.hideAsync().catch(() => {});
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hydrated, onboarded, segments, router]);

  if (!hydrated) return <SplashFill />;
  return <>{children}</>;
}

function SplashFill() {
  return <View style={{ flex: 1, backgroundColor: '#0B7A5B' }} />;
}

function Navigator() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="transaction/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recurring" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recurring-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="backup" options={{ presentation: 'modal' }} />
        <Stack.Screen name="lock" options={{ presentation: 'modal' }} />
        <Stack.Screen name="categories" options={{ presentation: 'modal' }} />
        <Stack.Screen name="category-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="goals" options={{ presentation: 'modal' }} />
        <Stack.Screen name="goal-edit" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FinanceProvider>
          <ThemeProvider>
            <LockGate>
              <Gate>
                <Navigator />
              </Gate>
            </LockGate>
          </ThemeProvider>
        </FinanceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
