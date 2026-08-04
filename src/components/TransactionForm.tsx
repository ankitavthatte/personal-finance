import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { Transaction, TransactionType } from '@/data/types';
import { useTheme } from '@/theme';
import { friendlyDate, parseISO, startOfDay, toISODate } from '@/utils/format';
import { Button } from './Button';
import { CategoryIcon } from './CategoryIcon';
import { Keypad } from './Keypad';
import { SegmentedControl } from './SegmentedControl';
import { Text } from './Text';

export interface TransactionDraft {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string;
}

interface Props {
  initial?: Partial<TransactionDraft>;
  currencySymbol?: string;
  submitLabel?: string;
  onSubmit: (draft: TransactionDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function groupAmount(raw: string): string {
  if (!raw) return '0';
  const [intPart, decPart] = raw.split('.');
  const grouped = Number(intPart || '0').toLocaleString('en-IN');
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

export function TransactionForm({
  initial,
  currencySymbol = '₹',
  submitLabel = 'Add',
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const theme = useTheme();

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState<string>(
    initial?.amount ? String(initial.amount) : '',
  );
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [categoryId, setCategoryId] = useState<string>(
    initial?.categoryId ?? categories[0].id,
  );
  const [note, setNote] = useState<string>(initial?.note ?? '');
  const [date, setDate] = useState<string>(initial?.date ?? toISODate(new Date()));

  const numericAmount = useMemo(() => Number(amount) || 0, [amount]);
  const canSave = numericAmount > 0;

  const switchType = (next: TransactionType) => {
    setType(next);
    const list = next === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!list.some((c) => c.id === categoryId)) setCategoryId(list[0].id);
  };

  const pressKey = (key: string) => {
    setAmount((prev) => {
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev === '' ? '0.' : prev + '.';
      }
      // Limit to 2 decimal places.
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      // Avoid leading zeros like 00.
      if (prev === '0') return key;
      if (prev.replace('.', '').length >= 10) return prev;
      return prev + key;
    });
  };

  const backspace = () => setAmount((prev) => prev.slice(0, -1));

  const shiftDate = (delta: number) => {
    const d = parseISO(date);
    d.setDate(d.getDate() + delta);
    if (delta > 0 && startOfDay(d) > startOfDay(new Date())) return; // no future
    Haptics.selectionAsync().catch(() => {});
    setDate(toISODate(d));
  };

  const isToday = date === toISODate(new Date());

  const submit = () => {
    if (!canSave) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSubmit({ type, amount: numericAmount, categoryId, note: note.trim(), date });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <Pressable onPress={onCancel} hitSlop={10}>
          <Text variant="body" color="textSecondary">
            Cancel
          </Text>
        </Pressable>
        <Text variant="headline">{submitLabel === 'Add' ? 'New Transaction' : 'Edit'}</Text>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.negative} />
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      {/* Type toggle */}
      <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: theme.spacing.xs }}>
        <SegmentedControl<TransactionType>
          value={type}
          onChange={switchType}
          options={[
            { label: 'Expense', value: 'expense' },
            { label: 'Income', value: 'income' },
          ]}
        />
      </View>

      {/* Amount */}
      <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '700',
              color: amount ? theme.colors.textSecondary : theme.colors.textTertiary,
              marginTop: 8,
              marginRight: 2,
            }}
          >
            {currencySymbol}
          </Text>
          <Text
            style={{
              fontSize: 52,
              fontWeight: '800',
              letterSpacing: -1,
              color: amount ? theme.colors.text : theme.colors.textTertiary,
              fontVariant: ['tabular-nums'],
            }}
          >
            {groupAmount(amount)}
          </Text>
        </View>
      </View>

      {/* Category picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}
      >
        {categories.map((c) => {
          const selected = c.id === categoryId;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCategoryId(c.id);
              }}
              style={{ alignItems: 'center', width: 68 }}
            >
              <View
                style={{
                  borderRadius: 20,
                  padding: 3,
                  borderWidth: 2,
                  borderColor: selected ? theme.colors.primary : 'transparent',
                }}
              >
                <CategoryIcon icon={c.icon} color={c.color} size={48} solid={selected} />
              </View>
              <Text
                variant="caption"
                color={selected ? 'text' : 'textTertiary'}
                center
                numberOfLines={1}
                style={{ marginTop: 4, width: 66 }}
              >
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Note + date */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          marginTop: theme.spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            height: 48,
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.textTertiary} />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor={theme.colors.textTertiary}
            style={{ flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 15, fontWeight: '500' }}
            returnKeyType="done"
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            height: 48,
            paddingHorizontal: 6,
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
          }}
        >
          <Pressable onPress={() => shiftDate(-1)} hitSlop={6} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={18} color={theme.colors.textSecondary} />
          </Pressable>
          <Text variant="footnote" style={{ minWidth: 66, textAlign: 'center' }}>
            {friendlyDate(date)}
          </Text>
          <Pressable
            onPress={() => shiftDate(1)}
            hitSlop={6}
            disabled={isToday}
            style={{ padding: 6 }}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isToday ? theme.colors.textTertiary : theme.colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Keypad + save pinned to bottom */}
      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing['3xl'] }}>
        <Keypad onKey={pressKey} onBackspace={backspace} />
        <Button
          label={submitLabel}
          onPress={submit}
          disabled={!canSave}
          style={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </View>
  );
}
