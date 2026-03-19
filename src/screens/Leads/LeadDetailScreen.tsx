/**
 * LeadDetailScreen - Fiche lead avec score proéminent, champs éditables, actions
 */

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MapPin, Mic, MessageCircle, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from '@/src/components/common/Badge';
import type { BadgeVariant } from '@/src/components/common/Badge';
import { fetchLeadById, updateLeadStatus, updateLead } from '@/src/services/leads.service';
import type { Lead, LeadStatus } from '@/src/services/leads.service';
import { formatRelativeTime, formatPhone, formatType, formatDelay } from '@/src/utils/format';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

function getLeadDisplayName(lead: Lead): string {
  return lead.full_name || lead.contact_name || lead.client_phone || lead.phone || 'Client';
}

function getScoreColor(score: number): string {
  if (score >= 70) return colors.atysDanger;
  if (score >= 40) return colors.atysWarning;
  return colors.atysSuccess;
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Priorité haute';
  if (score >= 40) return 'Priorité moy.';
  return 'Priorité basse';
}

interface DetailRowProps {
  label: string;
  value: string | number | null | undefined;
}

function DetailRow({ label, value }: DetailRowProps) {
  const v = value ?? '—';
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(v)}</Text>
    </View>
  );
}

const STATUS_BUTTONS: { status: LeadStatus; label: string; variant: BadgeVariant }[] = [
  { status: 'needs_review', label: 'À traiter', variant: 'needs_review' },
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  // Édition inline
  const [editingName, setEditingName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [addressValue, setAddressValue] = useState('');

  const isDirty = (editingName || editingAddress) &&
    (nameValue !== (lead?.full_name ?? '') || addressValue !== (lead?.address ?? ''));

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await fetchLeadById(id);
      if (err) setError(err);
      else if (data) {
        setLead(data);
        setNameValue(data.full_name ?? data.contact_name ?? '');
        setAddressValue(data.address ?? '');
      }
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

  async function handleSave() {
    if (!id || saving) return;
    setSaving(true);
    setError(null);
    const { data, error: err } = await updateLead(id, {
      full_name: nameValue || undefined,
      address: addressValue || undefined,
    });
    if (err) setError(err);
    else if (data) {
      setLead(data);
      setEditingName(false);
      setEditingAddress(false);
    }
    setSaving(false);
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
  const score = lead?.priority_score ?? lead?.score ?? 0;
  const scoreColor = getScoreColor(score);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Carte infos principales */}
      <View style={styles.card}>
        {/* Nom (éditable) + badge statut */}
        <View style={styles.cardTitleRow}>
          <View style={styles.nameFlex}>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameValue}
                onChangeText={setNameValue}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => setEditingName(false)}
                accessibilityLabel="Modifier le nom"
              />
            ) : (
              <Pressable
                onPress={() => setEditingName(true)}
                style={styles.nameRow}
                accessibilityRole="button"
                accessibilityLabel="Modifier le nom"
              >
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {nameValue || getLeadDisplayName(lead!)}
                </Text>
                <Pencil size={14} color={colors.slate400} />
              </Pressable>
            )}
          </View>
          <Badge variant={statusVariant} label={statusLabel} />
        </View>

        {/* Score cercle */}
        <LinearGradient
          colors={['#eff6ff', '#f5f3ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreSection}
        >
          <View style={[styles.scoreCircle, { backgroundColor: scoreColor }]}>
            <Text style={styles.scoreNumber}>{score}</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{getScoreLabel(score)}</Text>
        </LinearGradient>

        {/* Infos en grille 2 colonnes */}
        <View style={styles.detailGrid}>
          <View style={styles.detailCol}>
            <DetailRow label="Téléphone" value={formatPhone(phone)} />
            <DetailRow label="Type de mission" value={formatType(lead!)} />
            <DetailRow
              label="Créé le"
              value={lead?.created_at ? (() => {
                const date = new Date(lead.created_at);
                const readable = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                return `${readable} (${formatRelativeTime(lead.created_at)})`;
              })() : '—'}
            />
          </View>
          <View style={styles.detailCol}>
            {/* Adresse éditable */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Adresse</Text>
              {editingAddress ? (
                <TextInput
                  style={[styles.rowValue, styles.inlineInput]}
                  value={addressValue}
                  onChangeText={setAddressValue}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => setEditingAddress(false)}
                  accessibilityLabel="Modifier l'adresse"
                  multiline
                />
              ) : (
                <Pressable
                  onPress={() => setEditingAddress(true)}
                  style={styles.editableRow}
                  accessibilityRole="button"
                  accessibilityLabel="Modifier l'adresse"
                >
                  <Text style={styles.rowValue}>{addressValue || '—'}</Text>
                  <Pencil size={12} color={colors.slate400} />
                </Pressable>
              )}
            </View>
            <DetailRow label="Délai" value={formatDelay(lead!)} />
          </View>
        </View>

        {/* Bouton sauvegarder */}
        {isDirty && (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.btnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Sauvegarder les modifications"
          >
            <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</Text>
          </Pressable>
        )}
      </View>

      {/* Transcription */}
      {transcription ? (
        <View style={styles.card}>
          <View style={styles.transcriptHeader}>
            <Mic size={16} color={colors.atysViolet} />
            <Text style={styles.transcriptTitle}>{"Transcription de l'appel"}</Text>
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
        {/* Appeler — pleine largeur */}
        {phone && (
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [styles.callBtnWrapper, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel="Appeler le client"
          >
            <LinearGradient
              colors={['#16A34A', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnCall}
            >
              <Text style={styles.btnCallText}>Appeler</Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* WhatsApp + Maps côte à côte */}
        <View style={styles.actionsRow}>
          {/* WhatsApp SOON */}
          <Pressable
            disabled
            style={[styles.btnSecondary, styles.actionHalf]}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp (bientôt disponible)"
          >
            <MessageCircle size={16} color="#25D366" />
            <Text style={styles.btnWhatsAppText}>WhatsApp</Text>
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>SOON</Text>
            </View>
          </Pressable>

          {/* Maps */}
          <Pressable
            onPress={lead?.address ? handleOpenMaps : undefined}
            disabled={!lead?.address}
            style={({ pressed }) => [
              styles.btnSecondary,
              styles.actionHalf,
              styles.btnMaps,
              pressed && styles.btnPressed,
              !lead?.address && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir l'adresse dans Maps"
          >
            <MapPin size={16} color={colors.atysBlue} />
            <Text style={styles.btnOutlineText}>Maps</Text>
          </Pressable>
        </View>

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

  // Carte principale
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...theme.shadows.card,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  nameFlex: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  nameInput: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.atysBlue,
    paddingVertical: 2,
  },

  // Score cercle
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  scoreNumber: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
  },

  // Grille de détails
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCol: {
    flex: 1,
  },
  row: { marginBottom: 14 },
  rowLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  inlineInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.atysBlue,
    paddingVertical: 0,
    flexShrink: 1,
  },

  // Save button
  saveBtn: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.atysBlue,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.white,
  },

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
  callBtnWrapper: {},
  btnCall: {
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionHalf: { flex: 1 },
  btnSecondary: {
    minHeight: minTouch,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  btnMaps: {
    borderColor: colors.atysBlue,
  },
  btnPressed: { opacity: 0.9 },
  btnDisabled: { opacity: 0.5 },
  btnCallText: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.white },
  btnOutlineText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.atysBlue },
  btnWhatsAppText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: '#25D366' },

  soonBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  soonText: {
    fontSize: 9,
    fontFamily: fontFamily.bold,
    color: colors.atysViolet,
    letterSpacing: 0.5,
  },

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
