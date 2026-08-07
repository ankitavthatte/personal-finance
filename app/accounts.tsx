import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CategoryIcon, Text } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';
import { accountBalance, netWorth } from '@/utils/analytics';
import { formatMoney } from '@/utils/format';

export default function AccountsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { accounts, transactions, settings } = useFinance();
  const sym = settings.currencySymbol;
  const defaultId = accounts[0]?.id ?? '';

  const total = useMemo(() => netWorth(accounts, transactions), [accounts, transactions]);

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
        <Text variant="title2">Accounts</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="callout" color="textSecondary">
            Net worth
          </Text>
          <Text
            variant="amountHero"
            style={{ marginTop: 4, color: total >= 0 ? theme.colors.text : theme.colors.negative }}
          >
            {formatMoney(total, sym, { decimals: false })}
          </Text>
        </Card>

        <Card padded={false}>
          {accounts.map((acc, i) => {
            const bal = accountBalance(acc, transactions, defaultId);
            return (
              <Pressable
                key={acc.id}
                onPress={() => router.push({ pathname: '/account-edit', params: { id: acc.id } })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  minHeight: 60,
                  borderBottomWidth: i < accounts.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <CategoryIcon icon={acc.icon} color={acc.color} size={42} />
                <Text variant="body" style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  {acc.name}
                </Text>
                <Text
                  variant="body"
                  style={{
                    fontWeight: '700',
                    fontVariant: ['tabular-nums'],
                    color: bal >= 0 ? theme.colors.text : theme.colors.negative,
                  }}
                >
                  {formatMoney(bal, sym, { decimals: false })}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.textTertiary}
                  style={{ marginLeft: theme.spacing.xs }}
                />
              </Pressable>
            );
          })}
        </Card>

        <Pressable
          onPress={() => router.push('/account-edit')}
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
            Add account
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
