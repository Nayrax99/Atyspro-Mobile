/**
 * MainTabNavigator - 3 onglets (Accueil, Leads, Appels)
 * Header dark custom + BottomNav dark + safe area Android
 */
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Home, FileText, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeaderDark } from '@/src/components/layout/AppHeaderDark';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

const TAB_ICON_SIZE = 22;

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <AppHeaderDark />,
        tabBarActiveTintColor: colors.atysBlue,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.slate900,
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Home size={TAB_ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <FileText size={TAB_ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Appels',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Phone size={TAB_ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
  },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(37,99,235,0.15)',
  },
});
