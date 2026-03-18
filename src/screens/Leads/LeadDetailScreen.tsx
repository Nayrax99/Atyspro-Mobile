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
import { MapPin, Mic } from 'lucide-react-native';

import { Badge } from '@/src/components/common/Badge';
import type { BadgeVariant } from '@/src/components/common/Badge';
import { fetchLeadById, updateLeadStatus } from '@/src/services/leads.service';
import type { Lead, LeadStatus } from '@/src/services/leads.service';
import { formatRelativeTime } from '@/src/utils/format';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
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

const STATUS_BUTTONS: { status: LeadStatus; label: string; variant: BadgeVariant }[] = [
  { status: 'needs_review', label: 'À vérifier', variant: 'needs_review' },
  { status: 'incomplete', label: 'Incomplet', variant: 'incomplete' },
  { status: 'complete', label: 'Traité ✓', variant: 'complete' },
];

const variantActiveColors: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  needs_review: { bg: '#fef3c7', border: colors.atysWarning, text: colors.atysWarning },
  incomplete: { bg: colors.slate100, border: colors.slate400, text: colors.slate600 },
  complete: { bg: '#d1fae5', border: '#34d399', text: colors.atysSuccess },
  urgent: { bg: '#fee2e2', border: colors.atysDanger, text: colors.atysDanger },
  neutral: { bg: '#eef2ff', border: colors.atysBlue, text: colors.atysBlue },
};

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

  async function handleStatusChange(status: LeadStatus) {
    if (!id || updating) return;
    setUpdating(true);
    setError(null);
    const { data, error: err } = await updateLeadStatus(id, status);
    if (err) setError(err);
    else if (data) setLead(data);
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

  function handleOpenMaps() {
    if (!lead?.address) return;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(String(lead.address))}`);
  }

  const phone = lead?.client_phone || lead?.phone;
  const isComplete = lead?.status === 'complete' || lead?.status === 'processed';
  const statusVariant: BadgeVariant =
    lead?.status === 'needs_review'
      ? 'needs_review'
      : lead?.status === 'incomplete'
      ? 'incomplete'
      : isComplete
      ? 'complete'
      : 'neutral';
  const statusLabel =
    lead?.status === 'needs_review'
      ? 'À vérifier'
      : lead?.status === 'incomplete'
      ? 'Incomplet'
      : isComplete
      ? 'Traité'
      : lead?.status ?? '—';

  const transcription = (lead?.description as string | null) || (lead?.raw_message as string | null);

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
      {/* Carte infos principales */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Badge variant={statusVariant} label={statusLabel} />
        </View>
        <DetailRow label="Adresse" value={lead?.address} />
        <DetailRow label="Score priorité" value={lead?.priority_score ?? lead?.score} />
        <DetailRow label="Téléphone" value={phone} />
        <DetailRow
          label="Créé le"
          value={lead?.created_at ? (() => {
            const date = new Date(lead.created_at);
            const readable = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            return `${readable} (${formatRelativeTime(lead.created_at)})`;
          })() : '—'}
        />
      </View>

      {/* Transcription */}
      {transcription ? (
        <View style={styles.card}>
          <View style={styles.transcriptHeader}>
            <Mic size={16} color={colors.atysViolet} />
            <Text style={styles.transcriptTitle}>Transcription de l'appel</Text>
          </View>
          <Text style={styles.transcriptText}>{transcription}</Text>
        </View>
      ) : null}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {phone && (
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [styles.btn, styles.btnCall, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Appeler le client"
          >
            <Text style={styles.btnCallText}>Appeler</Text>
          </Pressable>
        )}

        {lead?.address ? (
          <Pressable
            onPress={handleOpenMaps}
            style={({ pressed }) => [styles.btn, styles.btnOutline, pressed && styles.btnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir l'adresse dans Maps"
          >
            <MapPin size={16} color={colors.atysBlue} />
            <Text style={styles.btnOutlineText}>Ouvrir dans Maps</Text>
          </Pressable>
        ) : null}

        {/* Boutons de statut */}
        <View style={styles.statusRow}>
          {STATUS_BUTTONS.map(({ status, label, variant }) => {
            const isActive = lead?.status === status;
            const ac = variantActiveColors[variant];
            return (
              <Pressable
                key={status}
                onPress={() => handleStatusChange(status)}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusBtn,
                  isActive
                    ? { backgroundColor: ac.bg, borderColor: ac.border }
                    : styles.statusBtnInactive,
                  pressed && styles.btnPressed,
                  updating && styles.btnDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Marquer comme ${label}`}
                accessibilityState={{ disabled: updating, selected: isActive }}
              >
                <Text style={[styles.statusBtnText, { color: isActive ? ac.text : colors.slate500 }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40, gap: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 20, fontFamily: fontFamily.bold, color: colors.textPrimary, flex: 1 },
  row: { marginBottom: 14 },
  rowLabel: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.slate600, marginBottom: 4 },
  rowValue: { fontSize: 16, fontFamily: fontFamily.regular, color: colors.textPrimary, lineHeight: 22 },

  // Transcription
  transcriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  transcriptTitle: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  transcriptText: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 22 },

  errorCard: {
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    backgroundColor: '#fff5f5',
  },
  errorTitle: { fontSize: 16, fontFamily: fontFamily.bold, marginBottom: 8 },
  errorText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.atysDanger },

  actions: { gap: 12 },
  btn: {
    paddingVertical: Math.max(14, (minTouch - 24) / 2),
    minHeight: minTouch,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnCall: { backgroundColor: colors.atysSuccess },
  btnOutline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.atysBlue,
  },
  btnPressed: { opacity: 0.9 },
  btnDisabled: { opacity: 0.6 },
  btnCallText: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.white },
  btnOutlineText: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.atysBlue },

  // Status buttons
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: minTouch,
    justifyContent: 'center',
  },
  statusBtnInactive: {
    backgroundColor: colors.white,
    borderColor: colors.borderDefault,
  },
  statusBtnText: { fontSize: 13, fontFamily: fontFamily.semiBold },
});
