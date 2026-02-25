import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { getLeadDisplayName, type Lead as LeadType } from '@/components/lead-card';
import { BACKEND_BASE_URL } from '@/src/config';
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

type Lead = LeadType & { [key: string]: unknown };
const STATUS_BADGE: Record<string, BadgeVariant> = {
  needs_review: 'needs_review',
  incomplete: 'incomplete',
  complete: 'complete',
};

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

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/leads/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setLead(json.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function handleMarkComplete() {
    if (!id) return;
    setUpdating(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'complete' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
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
  const statusVariant: BadgeVariant =
    (lead?.status && STATUS_BADGE[lead.status]) || 'neutral';
  const statusLabel =
    lead?.status === 'needs_review'
      ? 'À vérifier'
      : lead?.status === 'incomplete'
        ? 'Incomplet'
        : lead?.status === 'complete'
          ? 'Traité'
          : lead?.status ?? '—';

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
          style={({ pressed }) => [
            styles.btn,
            styles.btnSecondary,
            pressed && styles.btnPressed,
            updating && styles.btnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={updating ? 'Mise à jour en cours' : 'Marquer comme traité'}
          accessibilityState={{ disabled: updating }}
        >
          <Text style={styles.btnSecondaryText}>
            {updating ? 'Mise à jour…' : 'Marquer traité'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginBottom: 24,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 16,
    color: '#111',
    lineHeight: 22,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    backgroundColor: '#fff5f5',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#c00',
  },
  actions: {
    gap: 12,
  },
  btn: {
    paddingVertical: Math.max(14, (minTouch - 24) / 2),
    minHeight: minTouch,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0a7ea4',
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
