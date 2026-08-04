import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SectionList, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState, SegmentedControl, Text, TransactionRow } from '@/components';
import { getCategory } from '@/data/categories';
import { Transaction, TransactionType } from '@/data/types';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import { formatMoney, friendlyDate } from '@/utils/format';

type Filter = 'all' | TransactionType;

interface Section {
  title: string;
  total: number;
  data: Transaction[];
}

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { transactions, settings } = useFinance();
  const sym = settings.currencySymbol;

  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const sections = useMemo<Section[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (!q) return true;
      const cat = getCategory(t.categoryId);
      return (
        t.note.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });

    const byDate = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const arr = byDate.get(t.date) ?? [];
      arr.push(t);
      byDate.set(t.date, arr);
    }
    return Array.from(byDate.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, data]) => ({
        title: friendlyDate(date),
        total: data.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0),
        data,
      }));
  }, [transactions, filter, query]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.sm }}>
        <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
          Activity
        </Text>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.md,
            height: 46,
            marginBottom: theme.spacing.md,
            borderWidth: theme.isDark ? 1 : 0,
            borderColor: theme.colors.border,
          }}
        >
          <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search transactions"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              flex: 1,
              marginLeft: 8,
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: '500',
            }}
          />
          {query.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.textTertiary}
              onPress={() => setQuery('')}
            />
          )}
        </View>

        <SegmentedControl<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Expenses', value: 'expense' },
            { label: 'Income', value: 'income' },
          ]}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={query ? 'No matches' : 'Nothing here yet'}
            message={
              query
                ? 'Try a different search term.'
                : 'Your transactions will appear here once you add them.'
            }
            actionLabel={query ? undefined : 'Add transaction'}
            onAction={query ? undefined : () => router.push('/add')}
          />
        }
        renderSectionHeader={({ section }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.xs,
            }}
          >
            <Text variant="subhead" color="textSecondary">
              {section.title}
            </Text>
            <Text variant="footnote" color="textTertiary" style={{ fontVariant: ['tabular-nums'] }}>
              {formatMoney(section.total, sym, { sign: true, decimals: false })}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TransactionRow
            txn={item}
            currencySymbol={sym}
            onPress={() => router.push(`/transaction/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}
