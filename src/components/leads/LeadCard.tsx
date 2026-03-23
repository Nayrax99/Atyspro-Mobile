/**
 * LeadCard - Carte lead redesignée
 * Ligne 1 : Nom + Score (coloré urgence)
 * Ligne 2 : Extrait description + date relative
 * Ligne 3 : Badge statut + badge Nouveau
 * Barre gauche colorée selon urgence du score
 */

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge } from '../common/Badge';
import type { BadgeVariant } from '../common/Badge';
import { useCardEntrance } from '@/src/hooks/useCardEntrance';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';
import type { Lead } from '@/src/services/leads.service';
import { formatRelativeTime, formatType } from '@/src/utils/format';

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  nouveau:   { variant: 'nouveau',   label: 'Nouveau' },
  a_traiter: { variant: 'a_traiter', label: 'À traiter' },
  incomplet: { variant: 'incomplet', label: 'Incomplet' },
  traite:    { variant: 'traite',    label: 'Traité' },
};

interface LeadCardProps {
  lead: Lead;
  index?: number;
}

function getLeadDisplayName(lead: Lead): string {
  return lead.full_name || lead.contact_name || lead.client_phone || lead.phone || 'Client';
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isNew(lead: Lead): boolean {
  const created = new Date(lead.created_at).getTime();
  return Date.now() - created < ONE_DAY_MS;
}

function getScoreColor(score: number): { bar: string; text: string; bg: string } {
  if (score >= 70) return { bar: '#ef4444', text: '#dc2626', bg: '#fee2e2' };
  if (score >= 40) return { bar: '#f97316', text: '#ea580c', bg: '#ffedd5' };
  return { bar: '#94a3b8', text: '#64748b', bg: '#f1f5f9' };
}

function getExcerpt(lead: Lead): string {
  const desc = lead.description;
  if (desc && desc.trim()) {
    const trimmed = desc.trim();
    return trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed;
  }
  const type = formatType(lead);
  return type !== 'Non renseigné' ? type : '—';
}

export function LeadCard({ lead, index = 0 }: LeadCardProps) {
  const router = useRouter();
  const name = getLeadDisplayName(lead);
  const score = lead.priority_score ?? lead.score ?? 0;
  const relativeTime = formatRelativeTime(lead.created_at);
  const animStyle = useCardEntrance(index);
  const showNewBadge = isNew(lead);
  const statusBadge = STATUS_BADGE[lead.status];
  const scoreColor = getScoreColor(score);
  const excerpt = getExcerpt(lead);

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => router.push(`/lead/${lead.id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir le lead ${name}`}
      >
        <View style={[styles.leftBar, { backgroundColor: scoreColor.bar }]} />
        <View style={styles.content}>
          {/* Ligne 1 : Nom + Score */}
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor.bg }]}>
              <Text style={[styles.scoreText, { color: scoreColor.text }]}>{score}</Text>
            </View>
          </View>

          {/* Ligne 2 : Extrait + date */}
          <View style={styles.middleRow}>
            <Text style={styles.excerpt} numberOfLines={1}>
              {excerpt}
            </Text>
            <Text style={styles.time}>{relativeTime}</Text>
          </View>

          {/* Ligne 3 : Badges */}
          <View style={styles.footer}>
            {statusBadge && <Badge label={statusBadge.label} variant={statusBadge.variant} />}
            {showNewBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nouveau</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  cardPressed: {
    opacity: 0.95,
  },
  leftBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 34,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  excerpt: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  time: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    flexShrink: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  newBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: '#DBEAFE',
  },
  newBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.semiBold,
    color: '#1D4ED8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
