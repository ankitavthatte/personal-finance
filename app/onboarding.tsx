import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

const FEATURES = [
  { icon: 'flash', title: 'Log in seconds', text: 'A fast keypad and smart categories make entry effortless.' },
  { icon: 'pie-chart', title: 'See where it goes', text: 'Beautiful breakdowns of your spending by category.' },
  { icon: 'shield-checkmark', title: 'Private by design', text: 'Everything stays on your device. No accounts, no tracking.' },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { completeOnboarding, loadSampleData } = useFinance();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  const finish = (withSample: boolean) => {
    completeOnboarding({
      name: name.trim() || 'there',
      currency: currency.code,
      currencySymbol: currency.symbol,
    });
    if (withSample) loadSampleData();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: theme.spacing.xl, paddingBottom: theme.spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={{ alignItems: 'center', marginTop: theme.spacing.xl, marginBottom: theme.spacing['2xl'] }}>
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                ...theme.shadow('md'),
              }}
            >
              <Ionicons name="wallet" size={40} color={theme.colors.onPrimary} />
            </View>
            <Text variant="largeTitle" style={{ marginTop: theme.spacing.lg }}>
              Pennywise
            </Text>
            <Text variant="body" color="textSecondary" center style={{ marginTop: 6 }}>
              Track every expense, effortlessly.
            </Text>
          </View>

          {/* Features */}
          <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing['2xl'] }}>
            {FEATURES.map((f) => (
              <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 15,
                    backgroundColor: theme.colors.primaryMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={f.icon as any} size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <Text variant="headline">{f.title}</Text>
                  <Text variant="footnote" color="textSecondary" style={{ marginTop: 1 }}>
                    {f.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Quick setup */}
          <Text variant="footnote" color="textSecondary" style={{ marginLeft: 4, marginBottom: 8 }}>
            WHAT SHOULD WE CALL YOU?
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              paddingHorizontal: theme.spacing.lg,
              height: 52,
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.text,
              borderWidth: theme.isDark ? 1 : 0,
              borderColor: theme.colors.border,
              marginBottom: theme.spacing.lg,
            }}
            returnKeyType="done"
          />

          <Text variant="footnote" color="textSecondary" style={{ marginLeft: 4, marginBottom: 8 }}>
            CURRENCY
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            {CURRENCIES.map((c) => {
              const active = c.code === currency.code;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => setCurrency(c)}
                  style={{
                    flex: 1,
                    height: 56,
                    borderRadius: theme.radius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderWidth: theme.isDark && !active ? 1 : 0,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text
                    variant="headline"
                    style={{ color: active ? theme.colors.onPrimary : theme.colors.text }}
                  >
                    {c.symbol}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: active ? theme.colors.onPrimary : theme.colors.textTertiary }}
                  >
                    {c.code}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* CTAs */}
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <Button label="Get started" onPress={() => finish(false)} />
          <Pressable onPress={() => finish(true)} style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text variant="callout" color="primary">
              Explore with sample data
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
