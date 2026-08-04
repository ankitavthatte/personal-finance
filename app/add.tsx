import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionDraft, TransactionForm } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

export default function AddTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { addTransaction, settings } = useFinance();

  const handleSubmit = (draft: TransactionDraft) => {
    addTransaction(draft);
    router.back();
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TransactionForm
          currencySymbol={settings.currencySymbol}
          submitLabel="Add"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
