/**
 * AppHeaderDark - Header sombre global pour les onglets tabs
 * Avatar gradient + salutation + statut IA glassmorphism
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const { account } = useAuth();
  const [hasUnread] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const firstName = (account?.name || 'vous').split(' ')[0] || 'vous';
  const initials = (account?.name || 'A')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Row 1 : Profil + Cloche */}
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
            <Text style={styles.subGreeting}>AtysPro · Pro</Text>
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

      {/* Row 2 : Statut IA glassmorphism */}
      <View style={styles.agentCard}>
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <View style={styles.agentInfo}>
          <Text style={styles.agentStatus}>Agent IA actif</Text>
          <Text style={styles.agentSub}>Répond aux appels manqués 24/7</Text>
        </View>
        <View style={styles.onBadge}>
          <Text style={styles.onText}>ON</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.slate900,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Row profil
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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

  // Carte IA
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.atysSuccess,
  },
  agentInfo: { flex: 1 },
  agentStatus: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.atysSuccess,
    marginBottom: 2,
  },
  agentSub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: 'rgba(255,255,255,0.5)',
  },
  onBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  onText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.atysSuccess,
  },
});
