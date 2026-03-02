/**
 * MainTabNavigator - Bottom tabs (Dialer, Leads, Settings)
 * Utilisé par app/(tabs)/_layout.tsx
 */

import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

import { colors } from '@/src/constants/colors';

const TAB_ICON_SIZE = 20;

export default function MainTabNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: 'AtysPro',
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.header,
        tabBarActiveTintColor: colors.atysBlue,
        tabBarInactiveTintColor: colors.slate500,
        tabBarIconStyle: { justifyContent: 'center', alignItems: 'center' },
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="dialer"
        options={{
          title: 'Clavier',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconActive]}>☎️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Leads',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconActive]}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ focused }) => (
            <Text style={[styles.icon, focused && styles.iconActive]}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.textPrimary,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.borderDefault,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  icon: {
    fontSize: TAB_ICON_SIZE,
    opacity: 0.7,
  },
  iconActive: {
    opacity: 1,
  },
});
