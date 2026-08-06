import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CategoryIcon, EmptyState, Text } from '@/components';
import { getCategory } from '@/data/categories';
import { RecurringRule } from '@/data/types';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import { formatMoney, friendlyDate } from '@/utils/format';

export default function RecurringScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { recurring, settings } = useFinance();

  const rules = [...recurring].sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1));

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
        <Text variant="title2">Recurring</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing['4xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {rules.length === 0 ? (
          <EmptyState
            icon="repeat"
            title="No recurring yet"
            message="Add rent, subscriptions or salary once and Pennywise posts them automatically on their due date."
            actionLabel="Add recurring"
            onAction={() => router.push('/recurring-edit')}
          />
        ) : (
          <>
            <Text
              variant="footnote"
              color="textTertiary"
              center
              style={{ marginBottom: theme.spacing.md }}
            >
              These post automatically on their due date.
            </Text>

            <Card padded={false}>
              {rules.map((rule, i) => (
                <RecurringRow
                  key={rule.id}
                  rule={rule}
                  currencySymbol={settings.currencySymbol}
                  divider={i < rules.length - 1}
                  onPress={() => router.push({ pathname: '/recurring-edit', params: { id: rule.id } })}
                />
              ))}
            </Card>

            <Pressable
              onPress={() => router.push('/recurring-edit')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.md,
                paddingVertical: theme.spacing.lg,
                marginTop: theme.spacing.sm,
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
                Add recurring
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecurringRow({
  rule,
  currencySymbol,
  divider,
  onPress,
}: {
  rule: RecurringRule;
  currencySymbol: string;
  divider: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const category = getCategory(rule.categoryId);
  const cadence = rule.frequency === 'weekly' ? 'Weekly' : 'Monthly';
  const signed = formatMoney(rule.type === 'income' ? rule.amount : -rule.amount, currencySymbol, {
    sign: true,
  });

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 62,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: theme.colors.divider,
      }}
    >
      <CategoryIcon icon={category.icon} color={category.color} size={40} />
      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
        <Text variant="body" numberOfLines={1}>
          {rule.note || category.name}
        </Text>
        <Text variant="footnote" color="textTertiary" style={{ marginTop: 2 }}>
          {cadence} · next {friendlyDate(rule.nextDate)}
        </Text>
      </View>
      <Text
        variant="body"
        style={{
          fontWeight: '700',
          color: rule.type === 'income' ? theme.colors.income : theme.colors.text,
        }}
      >
        {signed}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.textTertiary}
        style={{ marginLeft: theme.spacing.xs }}
      />
    </Pressable>
  );
}
