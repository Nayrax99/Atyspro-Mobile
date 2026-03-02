import { BACKEND_BASE_URL } from '@/src/config';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SMS_SIMULATE_BODY = {
  to: '+33612345678',
  from: '+33600000001',
  body: "1 / 1 / 44 rue de la Paix 75012 Paris / Jean Dupont / Plus d'électricité",
};

export default function SettingsScreen() {
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);

  const onSeedDev = useCallback(async () => {
    setSeedStatus(null);
    setSeedLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/dev/seed`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSeedStatus('✓ Seed DEV effectué');
      } else {
        setSeedStatus(`Erreur: ${json.error || res.status}`);
      }
    } catch (e) {
      setSeedStatus(
        `Erreur: ${e instanceof Error ? e.message : 'Erreur réseau'}`
      );
    } finally {
      setSeedLoading(false);
    }
  }, []);

  const onSimulateSms = useCallback(async () => {
    setSmsStatus(null);
    setSmsLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/dev/simulate/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SMS_SIMULATE_BODY),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSmsStatus('✓ SMS simulé, lead créé');
      } else {
        setSmsStatus(`Erreur: ${json.error || res.status}`);
      }
    } catch (e) {
      setSmsStatus(
        `Erreur: ${e instanceof Error ? e.message : 'Erreur réseau'}`
      );
    } finally {
      setSmsLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔥 DEBUG BACKEND URL */}
      <Text style={styles.backendText}>
        Backend: {BACKEND_BASE_URL}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>À propos</Text>
        <Text style={styles.cardText}>AtysPro Mobile Demo</Text>
        <Text style={styles.cardSubtext}>Version 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Paramètres</Text>
        <Text style={styles.cardText}>Fonctionnalités à venir</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mode Démo</Text>

        <View style={styles.demoRow}>
          <Pressable
            onPress={onSeedDev}
            disabled={seedLoading}
            style={({ pressed }) => [
              styles.demoBtn,
              pressed && styles.demoBtnPressed,
              seedLoading && styles.demoBtnDisabled,
            ]}
          >
            {seedLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.demoBtnText}>Seed DEV</Text>
            )}
          </Pressable>

          <Pressable
            onPress={onSimulateSms}
            disabled={smsLoading}
            style={({ pressed }) => [
              styles.demoBtn,
              pressed && styles.demoBtnPressed,
              smsLoading && styles.demoBtnDisabled,
            ]}
          >
            {smsLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.demoBtnText}>Simuler SMS</Text>
            )}
          </Pressable>
        </View>

        {seedStatus !== null && (
          <Text
            style={
              seedStatus.startsWith('✓')
                ? styles.statusSuccess
                : styles.statusError
            }
          >
            {seedStatus}
          </Text>
        )}

        {smsStatus !== null && (
          <Text
            style={
              smsStatus.startsWith('✓')
                ? styles.statusSuccess
                : styles.statusError
            }
          >
            {smsStatus}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    gap: 16,
  },
  backendText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  demoBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBtnPressed: {
    opacity: 0.9,
  },
  demoBtnDisabled: {
    opacity: 0.7,
  },
  demoBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  statusSuccess: {
    fontSize: 14,
    color: '#0a7ea4',
    marginTop: 12,
    fontWeight: '500',
  },
  statusError: {
    fontSize: 14,
    color: '#c00',
    marginTop: 12,
  },
});