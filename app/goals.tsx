import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CategoryIcon, EmptyState, ProgressBar, Text } from '@/components';
import { resolveCategoryColor } from '@/components/CategoryIcon';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import { formatMoney } from '@/utils/format';

export default function GoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { goals, settings } = useFinance();
  const sym = settings.currencySymbol;

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
        <Text variant="title2">Goals</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <EmptyState
            icon="flag"
            title="No goals yet"
            message="Set a target — an emergency fund, a trip, a new phone — and track how close you are."
            actionLabel="Add goal"
            onAction={() => router.push('/goal-edit')}
          />
        ) : (
          <>
            {goals.map((goal) => {
              const ratio = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
              const done = goal.saved >= goal.target && goal.target > 0;
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => router.push({ pathname: '/goal-edit', params: { id: goal.id } })}
                >
                  <Card style={{ marginBottom: theme.spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                      <CategoryIcon icon={goal.icon} color={goal.color} size={44} solid={done} />
                      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                        <Text variant="headline" numberOfLines={1}>
                          {goal.name}
                        </Text>
                        <Text variant="footnote" color="textTertiary">
                          {done ? 'Reached 🎉' : `${Math.round(ratio * 100)}% saved`}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                    </View>
                    <ProgressBar progress={ratio} height={8} color={resolveCategoryColor(goal.color)} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                      <Text variant="footnote" color="textSecondary">
                        {formatMoney(goal.saved, sym, { decimals: false })}
                      </Text>
                      <Text variant="footnote" color="textTertiary">
                        of {formatMoney(goal.target, sym, { decimals: false })}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
            <Button
              label="Add goal"
              icon="add"
              variant="secondary"
              onPress={() => router.push('/goal-edit')}
              style={{ marginTop: theme.spacing.sm }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
