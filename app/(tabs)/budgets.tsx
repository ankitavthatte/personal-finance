import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import {
  Button,
  Card,
  CategoryIcon,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import { resolveCategoryColor } from '@/components/CategoryIcon';
import { getCategory } from '@/data/categories';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import { budgetProgress, currentMonthKey } from '@/utils/analytics';
import { formatMoney } from '@/utils/format';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { transactions, budgets, settings, setBudget, categories } = useFinance();
  const sym = settings.currencySymbol;
  const monthKey = useMemo(() => currentMonthKey(), []);

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const budgetMap = useMemo(() => {
    const m = new Map<string, number>();
    budgets.forEach((b) => m.set(b.categoryId, b.amount));
    return m;
  }, [budgets]);

  const progress = useMemo(
    () => budgetProgress(transactions, budgets, monthKey),
    [transactions, budgets, monthKey],
  );

  const totals = useMemo(() => {
    const budgeted = budgets.reduce((s, b) => s + b.amount, 0);
    const spent = progress.reduce((s, p) => s + p.spent, 0);
    return { budgeted, spent, remaining: budgeted - spent };
  }, [budgets, progress]);

  const overallRatio = totals.budgeted > 0 ? totals.spent / totals.budgeted : 0;

  const openEditor = (categoryId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setEditing(categoryId);
    setDraft(budgetMap.get(categoryId) ? String(budgetMap.get(categoryId)) : '');
  };

  const saveEditor = () => {
    if (editing) {
      const amount = Math.max(0, Math.round(Number(draft) || 0));
      setBudget(editing, amount);
    }
    setEditing(null);
    setDraft('');
  };

  const rows = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const p = progress.find((x) => x.categoryId === cat.id);
      return { cat, budget: budgetMap.get(cat.id) ?? 0, prog: p };
    })
    .sort((a, b) => (b.budget > 0 ? 1 : 0) - (a.budget > 0 ? 1 : 0));

  const editingCat = editing ? getCategory(editing) : null;

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
        Budgets
      </Text>

      {/* Overall budget card */}
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="callout" color="textSecondary">
          Total spent this month
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 }}>
          <Text variant="amountLarge">{formatMoney(totals.spent, sym, { decimals: false })}</Text>
          <Text variant="body" color="textTertiary" style={{ marginBottom: 4 }}>
            of {formatMoney(totals.budgeted, sym, { decimals: false })}
          </Text>
        </View>
        <View style={{ marginTop: theme.spacing.lg }}>
          <ProgressBar
            progress={overallRatio}
            height={12}
            color={totals.spent > totals.budgeted ? theme.colors.negative : theme.colors.primary}
          />
        </View>
        <Text
          variant="footnote"
          color={totals.remaining >= 0 ? 'textSecondary' : 'negative'}
          style={{ marginTop: theme.spacing.md }}
        >
          {totals.remaining >= 0
            ? `${formatMoney(totals.remaining, sym, { decimals: false })} left to spend`
            : `${formatMoney(-totals.remaining, sym, { decimals: false })} over budget`}
        </Text>
      </Card>

      <Text variant="headline" style={{ marginBottom: theme.spacing.md, marginLeft: 4 }}>
        Categories
      </Text>

      <Card padded={false}>
        {rows.map(({ cat, budget, prog }, i) => {
          const spent = prog?.spent ?? 0;
          const ratio = budget > 0 ? spent / budget : 0;
          const over = budget > 0 && spent > budget;
          const color = resolveCategoryColor(cat.color);
          return (
            <Pressable
              key={cat.id}
              onPress={() => openEditor(cat.id)}
              style={({ pressed }) => ({
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.colors.divider,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CategoryIcon icon={cat.icon} color={cat.color} size={42} />
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <Text variant="callout">{cat.name}</Text>
                  {budget > 0 ? (
                    <Text
                      variant="footnote"
                      color={over ? 'negative' : 'textTertiary'}
                      style={{ marginTop: 1 }}
                    >
                      {formatMoney(spent, sym, { decimals: false })} of{' '}
                      {formatMoney(budget, sym, { decimals: false })}
                    </Text>
                  ) : (
                    <Text variant="footnote" color="primary" style={{ marginTop: 1 }}>
                      Set a budget
                    </Text>
                  )}
                </View>
                {budget > 0 && (
                  <Text
                    variant="footnote"
                    color={over ? 'negative' : 'textSecondary'}
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {over
                      ? `−${formatMoney(spent - budget, sym, { decimals: false }).replace('−', '')}`
                      : formatMoney(budget - spent, sym, { decimals: false })}
                  </Text>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textTertiary}
                  style={{ marginLeft: 6 }}
                />
              </View>
              {budget > 0 && (
                <View style={{ marginTop: 10, marginLeft: 54 }}>
                  <ProgressBar
                    progress={ratio}
                    height={6}
                    color={over ? theme.colors.negative : color}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </Card>

      {/* Budget editor modal */}
      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <Pressable
          onPress={() => setEditing(null)}
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius['3xl'],
              borderTopRightRadius: theme.radius['3xl'],
              padding: theme.spacing.xl,
              paddingBottom: theme.spacing['4xl'],
            }}
          >
            {editingCat && (
              <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
                <CategoryIcon icon={editingCat.icon} color={editingCat.color} size={56} />
                <Text variant="title2" style={{ marginTop: theme.spacing.md }}>
                  {editingCat.name}
                </Text>
                <Text variant="footnote" color="textSecondary">
                  Monthly budget
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surfaceSunken,
                borderRadius: theme.radius.lg,
                paddingHorizontal: theme.spacing.lg,
                height: 64,
              }}
            >
              <Text variant="title2" color="textSecondary">
                {sym}
              </Text>
              <TextInput
                value={draft}
                onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                autoFocus
                placeholderTextColor={theme.colors.textTertiary}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 30,
                  fontWeight: '800',
                  color: theme.colors.text,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
              {editingCat && budgetMap.get(editingCat.id) ? (
                <Button
                  label="Remove"
                  variant="secondary"
                  onPress={() => {
                    setDraft('0');
                    setTimeout(saveEditor, 0);
                  }}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Button label="Save budget" onPress={saveEditor} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
