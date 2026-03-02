/**
 * LeadDetailScreen - Détail lead via leads.service (fetchLeadById, updateLeadStatus)
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import type { BadgeVariant } from '@/components/ui/badge';
import { fetchLeadById, updateLeadStatus } from '@/src/services/leads.service';
import type { Lead } from '@/src/services/leads.service';
import { colors } from '@/src/constants/colors';
import { theme } from '@/src/constants/theme';

function getLeadDisplayName(lead: Lead): string {
  return lead.full_name || lead.contact_name || lead.client_phone || lead.phone || 'Client';
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  const v = value ?? '—';
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(v)}</Text>
    </View>
  );
}

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchLeadById(id);
      if (err) setError(err);
      else setLead(data);
      setLoading(false);
    })();
  }, [id]);

  async function handleMarkComplete() {
    if (!id) return;
    setUpdating(true);
    setError(null);
    const { error: err } = await updateLeadStatus(id, 'complete');
    if (err) setError(err);
    else router.back();
    setUpdating(false);
  }

  function handleCall() {
    const phone = lead?.client_phone || lead?.phone || lead?.contact_name;
    if (phone && /^[\d\s\-\+\.\(\)]+$/.test(String(phone))) {
      Linking.openURL(`tel:${String(phone).replace(/\s/g, '')}`);
    } else {
      setError('Numéro de téléphone non disponible ou invalide');
    }
  }

  const phone = lead?.client_phone || lead?.phone;
  const statusVariant: BadgeVariant =
    lead?.status === 'needs_review' ? 'needs_review' : lead?.status === 'incomplete' ? 'incomplete' : lead?.status === 'complete' ? 'complete' : 'neutral';
  const statusLabel =
    lead?.status === 'needs_review' ? 'À vérifier' : lead?.status === 'incomplete' ? 'Incomplet' : lead?.status === 'complete' ? 'Traité' : lead?.status ?? '—';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.atysBlue} />
      </View>
    );
  }

  if (error && !lead) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  const name = lead ? getLeadDisplayName(lead) : 'Client';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Badge variant={statusVariant} label={statusLabel} />
        </View>
        <DetailRow label="Adresse" value={lead?.address} />
        <DetailRow label="Score priorité" value={lead?.priority_score ?? lead?.score} />
        <DetailRow label="Téléphone" value={phone} />
        <DetailRow label="Créé le" value={lead?.created_at} />
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {phone && (
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Appeler le client"
          >
            <Text style={styles.btnPrimaryText}>Appeler</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleMarkComplete}
          disabled={updating}
          style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.btnPressed, updating && styles.btnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={updating ? 'Mise à jour en cours' : 'Marquer comme traité'}
          accessibilityState={{ disabled: updating }}
        >
          <Text style={styles.btnSecondaryText}>{updating ? 'Mise à jour…' : 'Marquer traité'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: theme.spacing.lg,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  row: { marginBottom: 14 },
  rowLabel: { fontSize: 12, color: colors.slate600, marginBottom: 4, fontWeight: '500' },
  rowValue: { fontSize: 16, color: colors.textPrimary, lineHeight: 22 },
  errorCard: {
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    backgroundColor: '#fff5f5',
    marginBottom: theme.spacing.lg,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  errorText: { fontSize: 14, color: colors.atysDanger },
  actions: { gap: 12 },
  btn: {
    paddingVertical: Math.max(14, (minTouch - 24) / 2),
    minHeight: minTouch,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: colors.atysBlue },
  btnSecondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderDefault },
  btnPressed: { opacity: 0.9 },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: 16, fontWeight: '600', color: colors.white },
  btnSecondaryText: { fontSize: 16, fontWeight: '600', color: colors.slate700 },
});
