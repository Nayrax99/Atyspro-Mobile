/**
 * SettingsScreen - Compte, Notifications, Application, Mode Démo, Logout
 * API via user.service (seed, simulateSms)
 */

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Toggle } from '@/src/components/common/Toggle';
import { useAuth } from '@/src/contexts/AuthContext';
import { API_BASE_URL } from '@/src/services/api';
import { seedDev, simulateSms } from '@/src/services/user.service';
import { colors } from '@/src/constants/colors';
import { theme } from '@/src/constants/theme';

const SMS_SIMULATE_BODY = {
  to: '+33612345678',
  from: '+33600000001',
  body: "1 / 1 / 44 rue de la Paix 75012 Paris / Jean Dupont / Plus d'électricité",
};

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [appUpdates, setAppUpdates] = useState(false);

  const onSeedDev = useCallback(async () => {
    setSeedStatus(null);
    setSeedLoading(true);
    const { success, error } = await seedDev();
    setSeedStatus(success ? '✓ Seed DEV effectué' : `Erreur: ${error || 'Inconnue'}`);
    setSeedLoading(false);
  }, []);

  const onSimulateSms = useCallback(async () => {
    setSmsStatus(null);
    setSmsLoading(true);
    const { success, error } = await simulateSms(SMS_SIMULATE_BODY);
    setSmsStatus(success ? '✓ SMS simulé, lead créé' : `Erreur: ${error || 'Inconnue'}`);
    setSmsLoading(false);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.backendText}>Backend: {API_BASE_URL}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>AtysPro Mobile Demo</Text>
          <Text style={styles.cardSubtext}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Activer les notifications</Text>
            <Toggle value={notifEnabled} onValueChange={setNotifEnabled} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Mises à jour auto</Text>
            <Toggle value={appUpdates} onValueChange={setAppUpdates} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode Démo</Text>
        <View style={styles.card}>
          <View style={styles.demoRow}>
            <Pressable
              onPress={onSeedDev}
              disabled={seedLoading}
              style={({ pressed }) => [styles.demoBtn, pressed && styles.demoBtnPressed, seedLoading && styles.demoBtnDisabled]}
            >
              {seedLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.demoBtnText}>Seed DEV</Text>}
            </Pressable>
            <Pressable
              onPress={onSimulateSms}
              disabled={smsLoading}
              style={({ pressed }) => [styles.demoBtn, pressed && styles.demoBtnPressed, smsLoading && styles.demoBtnDisabled]}
            >
              {smsLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.demoBtnText}>Simuler SMS</Text>}
            </Pressable>
          </View>
          {seedStatus !== null && (
            <Text style={seedStatus.startsWith('✓') ? styles.statusSuccess : styles.statusError}>{seedStatus}</Text>
          )}
          {smsStatus !== null && (
            <Text style={smsStatus.startsWith('✓') ? styles.statusSuccess : styles.statusError}>{smsStatus}</Text>
          )}
        </View>
      </View>

      <Pressable onPress={logout} style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.md, paddingBottom: 40 },
  backendText: { fontSize: 12, color: colors.slate600, marginBottom: 8 },
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...theme.shadows.card,
  },
  cardText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  cardSubtext: { fontSize: 12, color: colors.slate600, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  demoRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  demoBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.atysBlue,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBtnPressed: { opacity: 0.9 },
  demoBtnDisabled: { opacity: 0.7 },
  demoBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },
  statusSuccess: { fontSize: 14, color: colors.atysBlue, marginTop: 12, fontWeight: '500' },
  statusError: { fontSize: 14, color: colors.atysDanger, marginTop: 12 },
  logoutBtn: {
    marginTop: theme.spacing.lg,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutBtnPressed: { opacity: 0.9 },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.atysDanger, textAlign: 'center' },
});
