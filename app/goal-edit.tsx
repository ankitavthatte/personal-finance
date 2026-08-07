import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, CategoryIcon, Text } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { CategoryColorKey, categoryPalette, useTheme } from '@/theme';

const ICON_CHOICES = [
  'flag', 'star', 'airplane', 'home', 'car-sport', 'phone-portrait', 'laptop', 'gift',
  'heart', 'school', 'medkit', 'umbrella', 'boat', 'bicycle', 'camera', 'diamond',
];
const COLOR_CHOICES = Object.keys(categoryPalette) as CategoryColorKey[];

export default function GoalEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { goals, settings, addGoal, updateGoal, deleteGoal } = useFinance();

  const existing = id ? goals.find((g) => g.id === id) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [target, setTarget] = useState(existing ? String(existing.target) : '');
  const [saved, setSaved] = useState(existing ? String(existing.saved) : '');
  const [icon, setIcon] = useState<string>(existing?.icon ?? 'flag');
  const [color, setColor] = useState<CategoryColorKey>(
    (existing?.color as CategoryColorKey) ?? 'green',
  );

  const targetNum = Math.max(0, Math.round(Number(target) || 0));
  const savedNum = Math.max(0, Math.round(Number(saved) || 0));
  const canSave = name.trim().length > 0 && targetNum > 0;

  const save = () => {
    if (!canSave) return;
    const payload = { name: name.trim(), target: targetNum, saved: savedNum, icon, color };
    if (existing) updateGoal({ ...existing, ...payload });
    else addGoal(payload);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Delete goal', 'Remove this savings goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoal(existing.id);
          router.back();
        },
      },
    ]);
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
        <Text variant="headline">{isEdit ? 'Edit goal' : 'New goal'}</Text>
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

        <Field
          icon="flag-outline"
          value={name}
          onChangeText={setName}
          placeholder="Goal name (e.g. Emergency fund)"
          maxLength={28}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md }}>
          <MoneyField
            label="Target"
            symbol={settings.currencySymbol}
            value={target}
            onChangeText={(t) => setTarget(t.replace(/[^0-9]/g, ''))}
          />
          <MoneyField
            label="Saved so far"
            symbol={settings.currencySymbol}
            value={saved}
            onChangeText={(t) => setSaved(t.replace(/[^0-9]/g, ''))}
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
          label={isEdit ? 'Save changes' : 'Add goal'}
          onPress={save}
          disabled={!canSave}
          style={{ marginTop: theme.spacing['2xl'] }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  icon,
  ...input
}: { icon: string } & React.ComponentProps<typeof TextInput>) {
  const theme = useTheme();
  return (
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
      }}
    >
      <Ionicons name={icon as any} size={18} color={theme.colors.textTertiary} />
      <TextInput
        placeholderTextColor={theme.colors.textTertiary}
        style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 16, fontWeight: '500' }}
        returnKeyType="done"
        {...input}
      />
    </View>
  );
}

function MoneyField({
  label,
  symbol,
  value,
  onChangeText,
}: {
  label: string;
  symbol: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text variant="footnote" color="textSecondary" style={{ marginBottom: 6, marginLeft: 4 }}>
        {label}
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
        }}
      >
        <Text variant="body" color="textSecondary">
          {symbol}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textTertiary}
          style={{ flex: 1, marginLeft: 4, color: theme.colors.text, fontSize: 16, fontWeight: '600' }}
          returnKeyType="done"
        />
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      variant="footnote"
      color="textSecondary"
      style={{
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {children}
    </Text>
  );
}
