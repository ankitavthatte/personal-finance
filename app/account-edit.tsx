import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, CategoryIcon, Text } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { CategoryColorKey, categoryPalette, useTheme } from '@/theme';

const ICON_CHOICES = [
  'cash', 'business', 'card', 'wallet', 'phone-portrait', 'briefcase', 'trending-up', 'home',
  'gift', 'pricetag', 'globe', 'diamond',
];
const COLOR_CHOICES = Object.keys(categoryPalette) as CategoryColorKey[];

export default function AccountEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { accounts, settings, addAccount, updateAccount, deleteAccount } = useFinance();

  const existing = id ? accounts.find((a) => a.id === id) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [opening, setOpening] = useState(existing ? String(existing.opening) : '');
  const [icon, setIcon] = useState<string>(existing?.icon ?? 'wallet');
  const [color, setColor] = useState<CategoryColorKey>(
    (existing?.color as CategoryColorKey) ?? 'blue',
  );

  const openingNum = Math.round(Number(opening) || 0);
  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const payload = { name: name.trim(), opening: openingNum, icon, color };
    if (existing) updateAccount({ ...existing, ...payload });
    else addAccount(payload);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    if (accounts.length <= 1) {
      Alert.alert('Keep one account', 'You need at least one account.');
      return;
    }
    const target = accounts.find((a) => a.id !== existing.id)!;
    Alert.alert(
      'Delete account',
      `Transactions in “${existing.name}” move to “${target.name}”. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAccount(existing.id, target.id);
            router.back();
          },
        },
      ],
    );
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
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text variant="body" color="textSecondary">
            Cancel
          </Text>
        </Pressable>
        <Text variant="headline">{isEdit ? 'Edit account' : 'New account'}</Text>
        {isEdit ? (
          <Pressable onPress={remove} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.negative} />
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginVertical: theme.spacing.lg }}>
          <CategoryIcon icon={icon} color={color} size={72} solid />
        </View>

        {/* Name */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            height: 52,
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
            marginBottom: theme.spacing.md,
          }}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.textTertiary} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Account name (e.g. HDFC, Cash)"
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={24}
            style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 16, fontWeight: '500' }}
            returnKeyType="done"
          />
        </View>

        {/* Opening balance */}
        <Text variant="footnote" color="textSecondary" style={{ marginBottom: 6, marginLeft: 4 }}>
          Opening balance
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            height: 52,
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
            marginBottom: theme.spacing.lg,
          }}
        >
          <Text variant="body" color="textSecondary">
            {settings.currencySymbol}
          </Text>
          <TextInput
            value={opening}
            onChangeText={(t) => setOpening(t.replace(/[^0-9-]/g, ''))}
            keyboardType="numbers-and-punctuation"
            placeholder="0"
            placeholderTextColor={theme.colors.textTertiary}
            style={{ flex: 1, marginLeft: 4, color: theme.colors.text, fontSize: 16, fontWeight: '600' }}
            returnKeyType="done"
          />
        </View>

        <SectionLabel>Color</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: theme.spacing.lg }}>
          {COLOR_CHOICES.map((key) => {
            const selected = key === color;
            return (
              <Pressable
                key={key}
                onPress={() => setColor(key)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: categoryPalette[key],
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: selected ? 3 : 0,
                  borderColor: theme.colors.text,
                }}
              >
                {selected && <Ionicons name="checkmark" size={18} color="#fff" />}
              </Pressable>
            );
          })}
        </View>

        <SectionLabel>Icon</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ICON_CHOICES.map((g) => {
            const selected = g === icon;
            return (
              <Pressable
                key={g}
                onPress={() => setIcon(g)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? theme.colors.primaryMuted : theme.colors.surfaceSunken,
                  borderWidth: selected ? 2 : 0,
                  borderColor: theme.colors.primary,
                }}
              >
                <Ionicons
                  name={g as any}
                  size={24}
                  color={selected ? theme.colors.primary : theme.colors.textSecondary}
                />
              </Pressable>
            );
          })}
        </View>

        <Button
          label={isEdit ? 'Save changes' : 'Add account'}
          onPress={save}
          disabled={!canSave}
          style={{ marginTop: theme.spacing['2xl'] }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      variant="footnote"
      color="textSecondary"
      style={{
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {children}
    </Text>
  );
}
