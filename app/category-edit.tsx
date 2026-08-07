import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, CategoryIcon, SegmentedControl, Text } from '@/components';
import { TransactionType } from '@/data/types';
import { useFinance } from '@/store/FinanceStore';
import { CategoryColorKey, categoryPalette, useTheme } from '@/theme';

const ICON_CHOICES = [
  'cart', 'restaurant', 'cafe', 'fast-food', 'car-sport', 'bus', 'bicycle', 'airplane',
  'bag-handle', 'shirt', 'gift', 'receipt', 'home', 'flash', 'wifi', 'phone-portrait',
  'game-controller', 'musical-notes', 'film', 'fitness', 'medkit', 'heart', 'school', 'book',
  'briefcase', 'laptop', 'trending-up', 'cash', 'card', 'wallet', 'paw', 'sparkles',
  'people', 'construct', 'paw', 'ellipsis-horizontal',
];

const COLOR_CHOICES = Object.keys(categoryPalette) as CategoryColorKey[];

export default function CategoryEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();

  const existing = id ? categories.find((c) => c.id === id) : undefined;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [icon, setIcon] = useState<string>(existing?.icon ?? 'pricetag');
  const [color, setColor] = useState<CategoryColorKey>(
    (existing?.color as CategoryColorKey) ?? 'green',
  );

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const payload = { name: name.trim(), icon, color, type };
    if (existing) updateCategory({ ...existing, ...payload });
    else addCategory(payload);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert(
      'Delete category',
      'Transactions in this category become “Uncategorized”. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCategory(existing.id);
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
        <Text variant="headline">{isEdit ? 'Edit category' : 'New category'}</Text>
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
        {/* Preview + name */}
        <View style={{ alignItems: 'center', marginVertical: theme.spacing.lg }}>
          <CategoryIcon icon={icon} color={color} size={72} solid />
        </View>

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
          <Ionicons name="create-outline" size={18} color={theme.colors.textTertiary} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={24}
            style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 16, fontWeight: '500' }}
            returnKeyType="done"
          />
        </View>

        {/* Type — locked when editing so existing transactions keep their kind */}
        {!isEdit && (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <SegmentedControl<TransactionType>
              value={type}
              onChange={setType}
              options={[
                { label: 'Expense', value: 'expense' },
                { label: 'Income', value: 'income' },
              ]}
            />
          </View>
        )}

        {/* Color */}
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

        {/* Icon */}
        <SectionLabel>Icon</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {Array.from(new Set(ICON_CHOICES)).map((g) => {
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
          label={isEdit ? 'Save changes' : 'Add category'}
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
