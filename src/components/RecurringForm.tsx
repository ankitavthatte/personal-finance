import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { RecurrenceFrequency, TransactionType } from '@/data/types';
import { useTheme } from '@/theme';
import { friendlyDate, parseISO, startOfDay, toISODate } from '@/utils/format';
import { Button } from './Button';
import { CategoryIcon } from './CategoryIcon';
import { Keypad } from './Keypad';
import { SegmentedControl } from './SegmentedControl';
import { Text } from './Text';

export interface RecurringDraft {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  frequency: RecurrenceFrequency;
  nextDate: string;
}

interface Props {
  initial?: Partial<RecurringDraft>;
  currencySymbol?: string;
  submitLabel?: string;
  title?: string;
  onSubmit: (draft: RecurringDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function groupAmount(raw: string): string {
  if (!raw) return '0';
  const [intPart, decPart] = raw.split('.');
  const grouped = Number(intPart || '0').toLocaleString('en-IN');
  return decPart !== undefined ? `${grouped}.${decPart}` : grouped;
}

export function RecurringForm({
  initial,
  currencySymbol = '₹',
  submitLabel = 'Add recurring',
  title = 'New recurring',
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const theme = useTheme();

  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState<string>(initial?.amount ? String(initial.amount) : '');
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? categories[0].id);
  const [note, setNote] = useState<string>(initial?.note ?? '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(initial?.frequency ?? 'monthly');
  const [nextDate, setNextDate] = useState<string>(initial?.nextDate ?? toISODate(new Date()));

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
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      if (prev === '0') return key;
      if (prev.replace('.', '').length >= 10) return prev;
      return prev + key;
    });
  };

  const backspace = () => setAmount((prev) => prev.slice(0, -1));

  // The next date can move freely into the future, but never before today.
  const isToday = nextDate === toISODate(new Date());
  const shiftDate = (delta: number) => {
    const d = parseISO(nextDate);
    d.setDate(d.getDate() + delta);
    if (delta < 0 && startOfDay(d) < startOfDay(new Date())) return;
    Haptics.selectionAsync().catch(() => {});
    setNextDate(toISODate(d));
  };

  const submit = () => {
    if (!canSave) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSubmit({ type, amount: numericAmount, categoryId, note: note.trim(), frequency, nextDate });
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
        <Text variant="headline">{title}</Text>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.negative} />
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
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
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: amount ? theme.colors.textSecondary : theme.colors.textTertiary,
                marginTop: 6,
                marginRight: 2,
              }}
            >
              {currencySymbol}
            </Text>
            <Text
              style={{
                fontSize: 44,
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
        <SectionLabel>Category</SectionLabel>
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

        {/* Note */}
        <SectionLabel>Name</SectionLabel>
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <View
            style={{
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
              placeholder="e.g. Netflix, Rent"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={30}
              style={{
                flex: 1,
                marginLeft: 8,
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: '500',
              }}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Frequency */}
        <SectionLabel>Frequency</SectionLabel>
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <SegmentedControl<RecurrenceFrequency>
            value={frequency}
            onChange={setFrequency}
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Weekly', value: 'weekly' },
            ]}
          />
        </View>

        {/* Next date */}
        <SectionLabel>Next date</SectionLabel>
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              height: 52,
              paddingHorizontal: theme.spacing.md,
              borderWidth: theme.isDark ? 1 : 0,
              borderColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
              <Text variant="body">{friendlyDate(nextDate)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => shiftDate(-1)}
                hitSlop={6}
                disabled={isToday}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={isToday ? theme.colors.textTertiary : theme.colors.textSecondary}
                />
              </Pressable>
              <Pressable onPress={() => shiftDate(1)} hitSlop={6} style={{ padding: 8 }}>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Keypad + save pinned to bottom */}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      variant="footnote"
      color="textSecondary"
      style={{
        marginLeft: theme.spacing.lg + 4,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {children}
    </Text>
  );
}
