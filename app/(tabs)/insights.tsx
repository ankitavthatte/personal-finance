import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  BarChart,
  Card,
  CategoryIcon,
  DonutChart,
  EmptyState,
  Screen,
  SegmentedControl,
  Text,
} from '@/components';
import { resolveCategoryColor } from '@/components/CategoryIcon';
import { TransactionType } from '@/data/types';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import {
  currentMonthKey,
  isSameMonth,
  shiftMonth,
  spendByCategory,
  summarizeMonth,
  trailingMonths,
} from '@/utils/analytics';
import { formatMoney, monthName } from '@/utils/format';

export default function InsightsScreen() {
  const theme = useTheme();
  const { transactions, settings } = useFinance();
  const sym = settings.currencySymbol;

  const now = useMemo(() => currentMonthKey(), []);
  const [monthKey, setMonthKey] = useState(now);
  const [type, setType] = useState<TransactionType>('expense');

  const breakdown = useMemo(
    () => spendByCategory(transactions, monthKey, type),
    [transactions, monthKey, type],
  );
  const summary = useMemo(() => summarizeMonth(transactions, monthKey), [transactions, monthKey]);
  const total = type === 'expense' ? summary.expense : summary.income;

  const trailing = useMemo(() => trailingMonths(transactions, 6), [transactions]);
  const barData = trailing.map((m) => ({
    label: m.label,
    value: type === 'expense' ? m.expense : m.income,
    highlight: isSameMonth(m.key, monthKey),
  }));

  const isCurrent = isSameMonth(monthKey, now);

  const changeMonth = (delta: number) => {
    if (delta > 0 && isCurrent) return;
    Haptics.selectionAsync().catch(() => {});
    setMonthKey((k) => shiftMonth(k, delta));
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
        Insights
      </Text>

      {/* Month switcher */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.lg,
        }}
      >
        <Pressable onPress={() => changeMonth(-1)} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text variant="headline">
          {monthName(monthKey.month)} {monthKey.year}
        </Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={12} disabled={isCurrent}>
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isCurrent ? theme.colors.textTertiary : theme.colors.text}
          />
        </Pressable>
      </View>

      <View style={{ marginBottom: theme.spacing.lg }}>
        <SegmentedControl<TransactionType>
          value={type}
          onChange={setType}
          options={[
            { label: 'Expenses', value: 'expense' },
            { label: 'Income', value: 'income' },
          ]}
        />
      </View>

      {breakdown.length === 0 ? (
        <Card>
          <EmptyState
            icon="pie-chart-outline"
            title="No data for this month"
            message={`Add some ${type === 'expense' ? 'expenses' : 'income'} to see your breakdown here.`}
          />
        </Card>
      ) : (
        <>
          {/* Donut + total */}
          <Card style={{ marginBottom: theme.spacing.lg, alignItems: 'center' }}>
            <DonutChart
              size={200}
              strokeWidth={26}
              segments={breakdown.map((b) => ({
                value: b.total,
                color: resolveCategoryColor(b.color),
              }))}
            >
              <Text variant="caption" color="textSecondary">
                Total {type === 'expense' ? 'spent' : 'earned'}
              </Text>
              <Text variant="amountLarge">{formatMoney(total, sym, { decimals: false })}</Text>
              <Text variant="caption" color="textTertiary">
                {summary.count} transactions
              </Text>
            </DonutChart>
          </Card>

          {/* Category breakdown list */}
          <Card style={{ marginBottom: theme.spacing.lg }} padded={false}>
            {breakdown.map((c, i) => (
              <View
                key={c.categoryId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: theme.colors.divider,
                }}
              >
                <CategoryIcon icon={c.icon} color={c.color} size={40} />
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <Text variant="callout">{c.name}</Text>
                  <Text variant="footnote" color="textTertiary" style={{ marginTop: 1 }}>
                    {Math.round(c.share * 100)}% · {c.count} {c.count === 1 ? 'txn' : 'txns'}
                  </Text>
                </View>
                <Text variant="callout" style={{ fontVariant: ['tabular-nums'] }}>
                  {formatMoney(c.total, sym, { decimals: false })}
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Trailing months trend */}
      <Card>
        <Text variant="headline">6-month trend</Text>
        <Text
          variant="footnote"
          color="textSecondary"
          style={{ marginTop: 2, marginBottom: theme.spacing.lg }}
        >
          {type === 'expense' ? 'Monthly spending' : 'Monthly income'}
        </Text>
        <BarChart
          data={barData}
          currencySymbol={sym}
          height={170}
          color={type === 'expense' ? theme.colors.primary : theme.colors.income}
        />
      </Card>
    </Screen>
  );
}
