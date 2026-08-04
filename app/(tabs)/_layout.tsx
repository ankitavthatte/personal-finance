import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components';
import { useTheme } from '@/theme';

const TABS: { name: string; label: string; icon: string; activeIcon: string }[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'transactions', label: 'Activity', icon: 'swap-horizontal-outline', activeIcon: 'swap-horizontal' },
  { name: 'budgets', label: 'Budgets', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
  { name: 'insights', label: 'Insights', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  const renderTab = (tab: (typeof TABS)[number]) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
    const focused = state.index === routeIndex;
    return (
      <Pressable
        key={tab.name}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[routeIndex].key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(tab.name);
        }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8 }}
      >
        <Ionicons
          name={(focused ? tab.activeIcon : tab.icon) as any}
          size={24}
          color={focused ? theme.colors.primary : theme.colors.textTertiary}
        />
        <Text variant="caption" color={focused ? 'primary' : 'textTertiary'}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: insets.bottom || 10,
        backgroundColor: theme.colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: theme.colors.tabBarBorder,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 60 }}>
        {left.map(renderTab)}

        {/* Center floating add button */}
        <View style={{ width: 72, alignItems: 'center' }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              router.push('/add');
            }}
            style={({ pressed }) => ({
              position: 'absolute',
              top: -26,
              width: 60,
              height: 60,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
              ...theme.shadow('md'),
            })}
          >
            <Ionicons name="add" size={34} color={theme.colors.onPrimary} />
          </Pressable>
        </View>

        {right.map(renderTab)}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="insights" />
    </Tabs>
  );
}
