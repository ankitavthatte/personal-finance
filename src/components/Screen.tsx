import React from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement;
}

/**
 * Standard screen wrapper: applies the themed background and safe-area insets,
 * optionally wrapping content in a scroll view with comfortable padding.
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  contentStyle,
  refreshControl,
}: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          contentContainerStyle={[
            { padding: theme.spacing.xl, paddingBottom: theme.spacing['5xl'] * 2 },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, padding: theme.spacing.xl }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
