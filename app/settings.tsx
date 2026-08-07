import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, SegmentedControl, Text } from '@/components';
import { ThemePreference } from '@/data/types';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, updateSettings, loadSampleData, resetAll, transactions, recurring } =
    useFinance();

  const [name, setName] = useState(settings.name === 'there' ? '' : settings.name);
  const [budget, setBudget] = useState(String(settings.monthlyBudget));
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const commitName = () => updateSettings({ name: name.trim() || 'there' });
  const commitBudget = () =>
    updateSettings({ monthlyBudget: Math.max(0, Math.round(Number(budget) || 0)) });

  const pickCurrency = (c: (typeof CURRENCIES)[number]) => {
    updateSettings({ currency: c.code, currencySymbol: c.symbol });
    setCurrencyOpen(false);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset all data',
      'This permanently deletes every transaction and budget and returns the app to a clean state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAll();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  const confirmSample = () => {
    Alert.alert('Load sample data', 'Add a few months of example transactions to explore the app?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Load', onPress: () => loadSampleData() },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
        }}
      >
        <Text variant="title2">Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        {/* Profile */}
        <SectionLabel>Profile</SectionLabel>
        <Card padded={false} style={{ marginBottom: theme.spacing.xl }}>
          <Row icon="person-outline" label="Your name">
            <TextInput
              value={name}
              onChangeText={setName}
              onBlur={commitName}
              placeholder="Add name"
              placeholderTextColor={theme.colors.textTertiary}
              style={inputStyle(theme)}
              returnKeyType="done"
            />
          </Row>
        </Card>

        {/* Appearance */}
        <SectionLabel>Appearance</SectionLabel>
        <View style={{ marginBottom: theme.spacing.xl }}>
          <SegmentedControl<ThemePreference>
            value={settings.theme ?? 'system'}
            onChange={(value) => updateSettings({ theme: value })}
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
          />
        </View>

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <Card padded={false} style={{ marginBottom: theme.spacing.xl }}>
          <Pressable onPress={() => setCurrencyOpen(true)}>
            <Row icon="cash-outline" label="Currency" divider>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="body" color="textSecondary">
                  {settings.currency} ({settings.currencySymbol.trim()})
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </View>
            </Row>
          </Pressable>
          <Row icon="flag-outline" label="Monthly budget" divider>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text variant="body" color="textSecondary">
                {settings.currencySymbol}
              </Text>
              <TextInput
                value={budget}
                onChangeText={(t) => setBudget(t.replace(/[^0-9]/g, ''))}
                onBlur={commitBudget}
                keyboardType="number-pad"
                style={[inputStyle(theme), { minWidth: 90 }]}
                returnKeyType="done"
              />
            </View>
          </Row>
          <Pressable onPress={() => router.push('/recurring')}>
            <Row icon="repeat" label="Recurring" divider>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {recurring.length > 0 && (
                  <Text variant="body" color="textSecondary">
                    {recurring.length}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </View>
            </Row>
          </Pressable>
          <Pressable onPress={() => router.push('/categories')}>
            <Row icon="pricetags-outline" label="Categories">
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Row>
          </Pressable>
        </Card>

        {/* Security */}
        <SectionLabel>Security</SectionLabel>
        <Card padded={false} style={{ marginBottom: theme.spacing.xl }}>
          <Pressable onPress={() => router.push('/lock')}>
            <Row icon="lock-closed-outline" label="App lock">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="body" color={settings.pin ? 'primary' : 'textSecondary'}>
                  {settings.pin ? 'On' : 'Off'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </View>
            </Row>
          </Pressable>
        </Card>

        {/* Data */}
        <SectionLabel>Data</SectionLabel>
        <Card padded={false} style={{ marginBottom: theme.spacing.xl }}>
          <Pressable onPress={() => router.push('/backup')}>
            <Row icon="cloud-upload-outline" label="Backup & restore" divider>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Row>
          </Pressable>
          <Pressable onPress={confirmSample}>
            <Row icon="sparkles-outline" label="Load sample data" divider>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Row>
          </Pressable>
          <Pressable onPress={confirmReset}>
            <Row icon="trash-outline" label="Reset all data" danger>
              <Text variant="footnote" color="textTertiary">
                {transactions.length} txns
              </Text>
            </Row>
          </Pressable>
        </Card>

        <Text variant="caption" color="textTertiary" center style={{ marginTop: theme.spacing.md }}>
          Pennywise v{Constants.expoConfig?.version ?? '1.0.0'} · Your data stays on this device
        </Text>
      </View>

      {/* Currency picker */}
      <Modal visible={currencyOpen} transparent animationType="slide" onRequestClose={() => setCurrencyOpen(false)}>
        <Pressable
          onPress={() => setCurrencyOpen(false)}
          style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius['3xl'],
              borderTopRightRadius: theme.radius['3xl'],
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing['4xl'],
            }}
          >
            <Text variant="headline" center style={{ marginBottom: theme.spacing.md }}>
              Choose currency
            </Text>
            {CURRENCIES.map((c, i) => {
              const active = c.code === settings.currency;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => pickCurrency(c)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: theme.spacing.xl,
                    paddingVertical: theme.spacing.md,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: theme.colors.divider,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.colors.surfaceSunken,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text variant="headline">{c.symbol.trim()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                    <Text variant="callout">{c.name}</Text>
                    <Text variant="footnote" color="textTertiary">
                      {c.code}
                    </Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      variant="footnote"
      color="textSecondary"
      style={{ marginLeft: 4, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }}
    >
      {children}
    </Text>
  );
}

function Row({
  icon,
  label,
  children,
  divider,
  danger,
}: {
  icon: string;
  label: string;
  children?: React.ReactNode;
  divider?: boolean;
  danger?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 56,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: theme.colors.divider,
      }}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={danger ? theme.colors.negative : theme.colors.textSecondary}
      />
      <Text
        variant="body"
        style={{ flex: 1, marginLeft: theme.spacing.md, color: danger ? theme.colors.negative : theme.colors.text }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'right' as const,
    minWidth: 120,
    paddingVertical: 0,
  };
}
