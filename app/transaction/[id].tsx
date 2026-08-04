import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TransactionDraft, TransactionForm } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

export default function EditTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction, settings } = useFinance();

  const txn = transactions.find((t) => t.id === id);

  if (!txn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" color="textSecondary">
            This transaction no longer exists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = (draft: TransactionDraft) => {
    updateTransaction({ ...txn, ...draft });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete transaction', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(txn.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TransactionForm
          currencySymbol={settings.currencySymbol}
          submitLabel="Save changes"
          initial={{
            type: txn.type,
            amount: txn.amount,
            categoryId: txn.categoryId,
            note: txn.note,
            date: txn.date,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          onDelete={handleDelete}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
