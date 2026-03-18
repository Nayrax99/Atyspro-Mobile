/**
 * AccountScreen - Profil, numéro AtysPro, assistant IA, infos app, déconnexion
 */
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Lock, Phone } from 'lucide-react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

function SettingRow({
  icon,
  label,
  sub,
  right,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.settingRow, onPress && pressed && styles.rowPressed]}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={label}
    >
      <View style={styles.settingIconWrap}>{icon}</View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sub ? <Text style={styles.settingSub}>{sub}</Text> : null}
      </View>
      {right ? <View style={styles.settingRight}>{right}</View> : null}
    </Pressable>
  );
}

export default function AccountScreen() {
  const { account, user, logout } = useAuth();

  const initials = (account?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Section Profil */}
      <View style={styles.profileSection}>
        <LinearGradient
          colors={['#2563eb', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.profileName}>{account?.name ?? 'Mon compte'}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* Section Numéro AtysPro */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Numéro professionnel</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Phone size={18} color={colors.atysViolet} />}
            label="Numéro professionnel"
            sub="Un numéro dédié sera attribué à votre compte"
            right={
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>SOON</Text>
              </View>
            }
          />
          <Text style={styles.numberPlaceholder}>En cours d'attribution</Text>
        </View>
      </View>

      {/* Section Assistant IA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistant IA</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Lock size={18} color={colors.slate400} />}
            label="Activer / désactiver l'agent"
            sub="Bientôt disponible"
          />
          <View style={styles.separator} />
          <SettingRow
            icon={<Clock size={18} color={colors.slate400} />}
            label="Plages horaires actives"
            sub="Bientôt disponible"
          />
        </View>
      </View>

      {/* Section Application */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<View style={styles.versionDot} />}
            label="Version"
            right={<Text style={styles.versionText}>1.0.0 (Bêta)</Text>}
          />
          <View style={styles.separator} />
          <SettingRow
            icon={<View style={styles.versionDot} />}
            label="Dashboard web"
            onPress={() => Linking.openURL('https://atyspro-backend.vercel.app')}
            right={<Text style={styles.linkText}>Ouvrir →</Text>}
          />
        </View>
      </View>

      {/* Déconnexion */}
      <Pressable
        onPress={logout}
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
        accessibilityRole="button"
        accessibilityLabel="Déconnexion"
      >
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40, gap: 0 },

  // Profil
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fontFamily.bold,
  },
  profileName: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },

  // Sections
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginLeft: 52,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    minHeight: minTouch,
  },
  rowPressed: { backgroundColor: colors.slate50 },
  settingIconWrap: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, fontFamily: fontFamily.medium, color: colors.textPrimary },
  settingSub: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 2 },
  settingRight: { marginLeft: 8 },

  // Badges
  soonBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soonText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.atysViolet,
    letterSpacing: 0.5,
  },
  numberPlaceholder: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 14,
    marginLeft: 44,
  },

  // Version & link
  versionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate400,
  },
  versionText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary },
  linkText: { fontSize: 14, fontFamily: fontFamily.medium, color: colors.atysBlue },

  // Logout
  logoutBtn: {
    marginTop: theme.spacing.md,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    minHeight: minTouch,
    justifyContent: 'center',
  },
  logoutPressed: { opacity: 0.9 },
  logoutText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.atysDanger,
    textAlign: 'center',
  },
});
