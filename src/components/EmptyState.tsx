import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';

interface Props {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty state with a clear call to action — a pattern lifted from the
 * best apps, which never leave a screen feeling blank. */
export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: theme.colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl,
        }}
      >
        <Ionicons name={icon as any} size={34} color={theme.colors.primary} />
      </View>
      <Text variant="title2" center>
        {title}
      </Text>
      <Text
        variant="body"
        color="textSecondary"
        center
        style={{ marginTop: theme.spacing.sm, maxWidth: 280 }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          fullWidth={false}
          style={{ marginTop: theme.spacing['2xl'] }}
        />
      )}
    </View>
  );
}
