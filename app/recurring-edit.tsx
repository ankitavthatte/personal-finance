import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecurringDraft, RecurringForm } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

export default function RecurringEditScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { recurring, settings, addRecurring, updateRecurring, deleteRecurring } = useFinance();

  const existing = id ? recurring.find((r) => r.id === id) : undefined;
  const isEdit = !!existing;

  const handleSubmit = (draft: RecurringDraft) => {
    if (existing) {
      updateRecurring({ ...existing, ...draft });
    } else {
      addRecurring(draft);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Delete recurring', 'Stop this recurring transaction? Past entries are kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRecurring(existing.id);
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
        <RecurringForm
          currencySymbol={settings.currencySymbol}
          title={isEdit ? 'Edit recurring' : 'New recurring'}
          submitLabel={isEdit ? 'Save changes' : 'Add recurring'}
          initial={existing}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          onDelete={existing ? handleDelete : undefined}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
