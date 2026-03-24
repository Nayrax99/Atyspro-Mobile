/**
 * AppHeaderDark - Header sombre global pour les onglets tabs
 * Avatar gradient + salutation + sous-texte profil
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

export function AppHeaderDark() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { account, user } = useAuth();
  const [hasUnread] = useState(false);

  const acc = account as Record<string, unknown> | null;
  const firstName =
    (acc?.first_name as string | null) ||
    (account?.name || '').split(' ')[0] ||
    'vous';
  const initials =
    (acc?.first_name as string | null) && (acc?.last_name as string | null)
      ? `${(acc.first_name as string)[0]}${(acc.last_name as string)[0]}`.toUpperCase()
      : (account?.name || 'A')
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

  const subtitle =
    (acc?.company_name as string | null) ||
    user?.email ||
    'AtysPro';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.profileRow}>
        <Pressable
          onPress={() => router.push('/account')}
          style={styles.profileLeft}
          accessibilityRole="button"
          accessibilityLabel="Mon compte"
        >
          <LinearGradient
            colors={['#2563eb', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.greeting}>Bonjour, {firstName}</Text>
            <Text style={styles.subGreeting}>{subtitle}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/notifications')}
          style={styles.bellWrap}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Bell size={20} color={colors.white} />
          {hasUnread && <View style={styles.bellBadge} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  greeting: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    marginBottom: 2,
  },
  subGreeting: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.atysDanger,
  },
});
