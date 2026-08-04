import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import {
  BarChart,
  Button,
  Card,
  CategoryIcon,
  ProgressBar,
  Screen,
  Text,
  TransactionRow,
} from '@/components';
import { resolveCategoryColor } from '@/components/CategoryIcon';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import {
  currentMonthKey,
  dailyExpenseSeries,
  projectedMonthSpend,
  spendByCategory,
  summarizeMonth,
} from '@/utils/analytics';
import { formatMoney, monthName } from '@/utils/format';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { transactions, settings } = useFinance();
  const sym = settings.currencySymbol;

  const monthKey = useMemo(() => currentMonthKey(), []);
  const summary = useMemo(() => summarizeMonth(transactions, monthKey), [transactions, monthKey]);
  const topCategories = useMemo(
    () => spendByCategory(transactions, monthKey).slice(0, 4),
    [transactions, monthKey],
  );
  const recent = useMemo(() => transactions.slice(0, 4), [transactions]);

  const budget = settings.monthlyBudget;
  const spent = summary.expense;
  const freeToSpend = Math.max(budget - spent, 0);
  const budgetRatio = budget > 0 ? spent / budget : 0;
  const overBudget = spent > budget && budget > 0;
  const projected = useMemo(
    () => projectedMonthSpend(transactions, monthKey),
    [transactions, monthKey],
  );

  // Weekly buckets of the daily series for a clean 4/5-bar mini chart.
  const weeklyBars = useMemo(() => {
    const daily = dailyExpenseSeries(transactions, monthKey);
    const buckets: number[] = [];
    for (let i = 0; i < daily.length; i += 7) {
      buckets.push(daily.slice(i, i + 7).reduce((a, b) => a + b, 0));
    }
    return buckets.map((v, i) => ({ label: `W${i + 1}`, value: v, highlight: true }));
  }, [transactions, monthKey]);

  return (
    <Screen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.xl,
        }}
      >
        <View>
          <Text variant="footnote" color="textSecondary">
            {greeting()}, {settings.name}
          </Text>
          <Text variant="title">{monthName(monthKey.month)}</Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={10}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
            ...(!theme.isDark ? theme.shadow('sm') : {}),
          }}
        >
          <Ionicons name="person-outline" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Free to spend hero */}
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="callout" color="textSecondary">
            {overBudget ? 'Over budget by' : 'Free to spend'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: theme.colors.surfaceSunken,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: theme.radius.full,
            }}
          >
            <Ionicons
              name={projected > budget ? 'trending-up' : 'trending-down'}
              size={14}
              color={projected > budget ? theme.colors.negative : theme.colors.positive}
            />
            <Text variant="caption" color="textSecondary">
              {formatMoney(projected, sym, { decimals: false })} projected
            </Text>
          </View>
        </View>

        <Text
          variant="amountHero"
          style={{ marginTop: 6, color: overBudget ? theme.colors.negative : theme.colors.text }}
        >
          {formatMoney(overBudget ? spent - budget : freeToSpend, sym, { decimals: false })}
        </Text>

        <View style={{ marginTop: theme.spacing.lg }}>
          <ProgressBar
            progress={budgetRatio}
            height={10}
            color={overBudget ? theme.colors.negative : theme.colors.primary}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text variant="footnote" color="textSecondary">
              {formatMoney(spent, sym, { decimals: false })} spent
            </Text>
            <Text variant="footnote" color="textSecondary">
              {formatMoney(budget, sym, { decimals: false })} budget
            </Text>
          </View>
        </View>
      </Card>

      {/* Income / Expense / Net summary */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <StatTile
          label="Income"
          value={formatMoney(summary.income, sym, { decimals: false })}
          icon="arrow-down"
          tint={theme.colors.income}
        />
        <StatTile
          label="Expenses"
          value={formatMoney(summary.expense, sym, { decimals: false })}
          icon="arrow-up"
          tint={theme.colors.negative}
        />
        <StatTile
          label="Net"
          value={formatMoney(summary.net, sym, { decimals: false, sign: true })}
          icon="wallet-outline"
          tint={summary.net >= 0 ? theme.colors.positive : theme.colors.negative}
        />
      </View>

      {/* Spending trend */}
      {weeklyBars.some((b) => b.value > 0) && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="headline">Spending this month</Text>
          <Text variant="footnote" color="textSecondary" style={{ marginTop: 2, marginBottom: theme.spacing.lg }}>
            By week
          </Text>
          <BarChart data={weeklyBars} currencySymbol={sym} height={140} />
        </Card>
      )}

      {/* Top categories */}
      {topCategories.length > 0 && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Text variant="headline">Top spending</Text>
            <Pressable onPress={() => router.push('/insights')} hitSlop={8}>
              <Text variant="footnote" color="primary">
                See all
              </Text>
            </Pressable>
          </View>
          {topCategories.map((c, i) => (
            <View
              key={c.categoryId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
              }}
            >
              <CategoryIcon icon={c.icon} color={c.color} size={40} />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Text variant="callout">{c.name}</Text>
                <View style={{ marginTop: 6 }}>
                  <ProgressBar
                    progress={c.share}
                    height={6}
                    color={resolveCategoryColor(c.color)}
                  />
                </View>
              </View>
              <Text variant="callout" style={{ marginLeft: theme.spacing.md, fontVariant: ['tabular-nums'] }}>
                {formatMoney(c.total, sym, { decimals: false })}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs }}>
          <Text variant="headline">Recent activity</Text>
          <Pressable onPress={() => router.push('/transactions')} hitSlop={8}>
            <Text variant="footnote" color="primary">
              See all
            </Text>
          </Pressable>
        </View>
        {recent.length === 0 ? (
          <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center' }}>
            <Text variant="body" color="textSecondary" center>
              No transactions yet. Tap + to add your first expense.
            </Text>
            <Button
              label="Add expense"
              icon="add"
              fullWidth={false}
              onPress={() => router.push('/add')}
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        ) : (
          recent.map((t, i) => (
            <View
              key={t.id}
              style={{
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
              }}
            >
              <TransactionRow
                txn={t}
                currencySymbol={sym}
                showDate
                onPress={() => router.push(`/transaction/${t.id}`)}
              />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

function StatTile({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: string;
  tint: string;
}) {
  const theme = useTheme();
  return (
    <Card style={{ flex: 1 }} padded={false}>
      <View style={{ padding: theme.spacing.md }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: theme.colors.surfaceSunken,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons name={icon as any} size={16} color={tint} />
        </View>
        <Text variant="caption" color="textSecondary">
          {label}
        </Text>
        <Text variant="callout" style={{ marginTop: 2, fontVariant: ['tabular-nums'] }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Card>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
