/**
 * LeadCard - Carte lead (nom, tél, tag, temps relatif, ScoreBadge)
 * Barre gauche gradient bleu→violet + borderRadius 24
 */

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ScoreBadge } from './ScoreBadge';
import { Badge } from '../common/Badge';
import type { BadgeVariant } from '../common/Badge';
import { Tag } from '../common/Tag';
import { useCardEntrance } from '@/src/hooks/useCardEntrance';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';
import type { Lead } from '@/src/services/leads.service';
import { formatPhone, formatRelativeTime, formatType } from '@/src/utils/format';

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

export function LeadCard({ lead, index = 0 }: LeadCardProps) {
  const router = useRouter();
  const name = getLeadDisplayName(lead);
  const phone = lead.client_phone || lead.phone;
  const score = lead.priority_score ?? lead.score ?? 0;
  const missionType = formatType(lead);
  const relativeTime = formatRelativeTime(lead.created_at);
  const animStyle = useCardEntrance(index);
  const showNewBadge = isNew(lead);
  const statusBadge = STATUS_BADGE[lead.status];

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => router.push(`/lead/${lead.id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir le lead ${name}`}
      >
        <LinearGradient
          colors={['#1A56DB', '#7c3aed']}
          style={styles.leftBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.headerRight}>
              <ScoreBadge score={score} />
            </View>
          </View>
          <Text style={styles.phone} numberOfLines={1}>
            {formatPhone(phone)}
          </Text>
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {missionType !== 'Non renseigné' && <Tag label={missionType} variant="primary" />}
              {statusBadge && <Badge label={statusBadge.label} variant={statusBadge.variant} />}
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.time}>{relativeTime}</Text>
              {showNewBadge && (
                <LinearGradient
                  colors={['#1A56DB', '#7c3aed']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.newBadge}
                >
                  <Text style={styles.newBadgeText}>Nouveau</Text>
                </LinearGradient>
              )}
            </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.semiBold,
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  phone: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
});
