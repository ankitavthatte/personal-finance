import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';
import { getCategory } from '@/data/categories';
import { Transaction } from '@/data/types';
import { useTheme } from '@/theme';
import { formatMoney, friendlyDate } from '@/utils/format';
import { CategoryIcon } from './CategoryIcon';
import { Text } from './Text';

interface Props {
  txn: Transaction;
  currencySymbol?: string;
  onPress?: (txn: Transaction) => void;
  showDate?: boolean;
}

export function TransactionRow({ txn, currencySymbol = '₹', onPress, showDate }: Props) {
  const theme = useTheme();
  const cat = getCategory(txn.categoryId);
  const isIncome = txn.type === 'income';

  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        Haptics.selectionAsync().catch(() => {});
        onPress(txn);
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <CategoryIcon icon={cat.icon} color={cat.color} size={46} />
      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
        <Text variant="headline" numberOfLines={1}>
          {txn.note || cat.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {txn.recurringId && (
            <Ionicons
              name="repeat"
              size={12}
              color={theme.colors.textTertiary}
              style={{ marginRight: 4 }}
            />
          )}
          <Text variant="footnote" color="textTertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {cat.name}
            {showDate ? ` · ${friendlyDate(txn.date)}` : ''}
          </Text>
        </View>
      </View>
      <Text
        variant="headline"
        style={{
          color: isIncome ? theme.colors.income : theme.colors.text,
          fontVariant: ['tabular-nums'],
        }}
      >
        {isIncome ? '+' : '−'}
        {formatMoney(txn.amount, currencySymbol, { sign: false }).replace('−', '')}
      </Text>
    </Pressable>
  );
}
