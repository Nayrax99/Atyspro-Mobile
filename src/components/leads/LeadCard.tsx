/**
 * LeadCard - Carte lead (nom, tél, tag, temps relatif, ScoreBadge)
 */

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScoreBadge } from './ScoreBadge';
import { Tag } from '../common/Tag';
import { colors } from '@/src/constants/colors';
import { theme } from '@/src/constants/theme';
import type { Lead } from '@/src/services/leads.service';
import { formatPhone, formatRelativeTime, formatType } from '@/src/utils/format';

interface LeadCardProps {
  lead: Lead;
}

function getLeadDisplayName(lead: Lead): string {
  return lead.full_name || lead.contact_name || lead.client_phone || lead.phone || 'Client';
}

export function LeadCard({ lead }: LeadCardProps) {
  const router = useRouter();
  const name = getLeadDisplayName(lead);
  const phone = lead.client_phone || lead.phone;
  const score = lead.priority_score ?? lead.score ?? 0;
  const missionType = formatType(lead);
  const relativeTime = formatRelativeTime(lead.created_at);

  return (
    <Pressable
      onPress={() => router.push(`/lead/${lead.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${name}`}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <ScoreBadge score={score} />
      </View>
      <Text style={styles.phone} numberOfLines={1}>
        {formatPhone(phone)}
      </Text>
      <View style={styles.footer}>
        {missionType !== 'Non renseigné' && <Tag label={missionType} variant="primary" />}
        <Text style={styles.time}>{relativeTime}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...theme.shadows.card,
  },
  cardPressed: {
    opacity: 0.95,
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
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  phone: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
