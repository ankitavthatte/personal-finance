import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from '@/components';
import { useFinance } from '@/store/FinanceStore';
import { useTheme } from '@/theme';

export default function BackupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { exportData, importData, transactions } = useFinance();
  const [pasted, setPasted] = useState('');

  const handleExport = async () => {
    try {
      await Share.share({
        title: 'Pennywise backup',
        message: exportData(),
      });
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  const handleImport = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(pasted);
    } catch {
      Alert.alert('Invalid backup', "That doesn't look like valid backup text.");
      return;
    }
    Alert.alert('Restore backup', 'This replaces all current data on this device. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        style: 'destructive',
        onPress: () => {
          const ok = importData(parsed);
          if (!ok) {
            Alert.alert('Invalid backup', "That backup didn't contain any recognizable data.");
            return;
          }
          setPasted('');
          router.back();
        },
      },
    ]);
  };

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
        <Text variant="title2">Backup & restore</Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['4xl'] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.lg, lineHeight: 22 }}>
          Your data lives only on this device. Export a backup regularly so you never lose it — you
          can restore it here or on another device.
        </Text>

        <Card style={{ marginBottom: theme.spacing.xl }}>
          <Text variant="headline">Export</Text>
          <Text variant="footnote" color="textSecondary" style={{ marginTop: 4, marginBottom: theme.spacing.lg }}>
            Share a JSON backup of all {transactions.length} transactions, budgets, recurring rules
            and settings.
          </Text>
          <Button label="Export backup" icon="share-outline" onPress={handleExport} />
        </Card>

        <Card>
          <Text variant="headline">Restore</Text>
          <Text variant="footnote" color="textSecondary" style={{ marginTop: 4, marginBottom: theme.spacing.md }}>
            Paste backup text below. This replaces all current data.
          </Text>
          <TextInput
            value={pasted}
            onChangeText={setPasted}
            placeholder="Paste backup JSON here"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            style={{
              minHeight: 120,
              maxHeight: 220,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surfaceSunken,
              color: theme.colors.text,
              padding: theme.spacing.md,
              fontSize: 13,
              textAlignVertical: 'top',
            }}
          />
          <Button
            label="Restore from text"
            variant="secondary"
            onPress={handleImport}
            disabled={!pasted.trim()}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
