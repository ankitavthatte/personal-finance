import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CategoryIcon, Text } from '@/components';
import { Category } from '@/data/types';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

export default function CategoriesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { categories } = useFinance();

  const expense = categories.filter((c) => c.type === 'expense');
  const income = categories.filter((c) => c.type === 'income');

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
        <Text variant="title2">Categories</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <Group title="Expenses" items={expense} />
        <Group title="Income" items={income} />

        <Pressable
          onPress={() => router.push('/category-edit')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            paddingVertical: theme.spacing.lg,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: theme.colors.primaryMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color={theme.colors.primary} />
          </View>
          <Text variant="body" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            Add category
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({ title, items }: { title: string; items: Category[] }) {
  const theme = useTheme();
  const router = useRouter();
  if (items.length === 0) return null;
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <Text
        variant="footnote"
        color="textSecondary"
        style={{ marginLeft: 4, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {title}
      </Text>
      <Card padded={false}>
        {items.map((cat, i) => (
          <Pressable
            key={cat.id}
            onPress={() => router.push({ pathname: '/category-edit', params: { id: cat.id } })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              minHeight: 56,
              borderBottomWidth: i < items.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.divider,
            }}
          >
            <CategoryIcon icon={cat.icon} color={cat.color} size={38} />
            <Text variant="body" style={{ flex: 1, marginLeft: theme.spacing.md }}>
              {cat.name}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}
