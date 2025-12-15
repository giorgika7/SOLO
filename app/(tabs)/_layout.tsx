import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { Home, ShoppingBag, Smartphone, HelpCircle, MoreHorizontal } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingBottom: spacing[1],
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default function TabLayout() {
  const { user, loading } = useAuth();
  const tabIconSize = 24;
  const activeColor = colors.black;
  const inactiveColor = colors.gray[500];

  if (loading) {
    console.log('⏳ Tab Layout: Checking authentication...');
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (user) {
    console.log('✅ Tab Layout: User authenticated, showing tabs');
  } else {
    console.log('👤 Tab Layout: Guest mode, showing tabs');
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={tabIconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="buy"
        options={{
          title: 'Buy eSIM',
          tabBarIcon: ({ color }) => <ShoppingBag size={tabIconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="esims"
        options={{
          title: 'My eSIMs',
          tabBarIcon: ({ color }) => <Smartphone size={tabIconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color }) => <HelpCircle size={tabIconSize} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <MoreHorizontal size={tabIconSize} color={color} />,
        }}
      />
    </Tabs>
  );
}
