/**
 * MainTabNavigator - 3 onglets (Accueil, Leads, Appels)
 * Header dark custom + BottomNav dark + badge leads en attente
 */
import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Home, FileText, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeaderDark } from '@/src/components/layout/AppHeaderDark';
import { fetchLeads } from '@/src/services/leads.service';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

const TAB_ICON_SIZE = 22;

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const [pendingCount, setPendingCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchLeads().then(({ data }) => {
      const count = data.filter(
        (l) => l.status === 'a_traiter' || l.status === 'incomplet' || l.status === 'nouveau'
      ).length;
      setPendingCount(count > 0 ? count : undefined);
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <AppHeaderDark />,
        tabBarActiveTintColor: colors.atysBlue,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopWidth: 0,
          height: 72 + (Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 12)),
          paddingBottom: Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 12),
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
          tabBarBadge: pendingCount,
          tabBarBadgeStyle: { backgroundColor: colors.atysDanger, fontSize: 10 },
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
    backgroundColor: 'rgba(26,86,219,0.15)',
  },
});
