import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, BadgeVariant } from '@/components/ui/badge';

export type Lead = {
  id: string;
  created_at: string;
  status: 'complete' | 'incomplete' | 'needs_review';
  full_name?: string | null;
  contact_name?: string | null;
  client_phone?: string | null;
  phone?: string | null;
  address?: string | null;
  priority_score?: number | null;
  score?: number | null;
};

function getLeadBadgeVariant(lead: Lead): { variant: BadgeVariant; label: string } | null {
  const score = lead.priority_score ?? lead.score ?? 0;
  if (score >= 70) return { variant: 'urgent', label: 'URGENT' };
  if (lead.status === 'needs_review') return { variant: 'needs_review', label: 'À vérifier' };
  if (lead.status === 'incomplete') return { variant: 'incomplete', label: 'Incomplet' };
  if (lead.status === 'complete') return { variant: 'complete', label: 'Traité' };
  return null;
}

export function getLeadDisplayName(lead: Lead): string {
  return lead.full_name || lead.contact_name || lead.client_phone || lead.phone || 'Client';
}

type LeadCardProps = {
  lead: Lead;
};

export function LeadCard({ lead }: LeadCardProps) {
  const router = useRouter();
  const name = getLeadDisplayName(lead);
  const badge = getLeadBadgeVariant(lead);
  const score = lead.priority_score ?? lead.score ?? 0;

  return (
    <Pressable
      onPress={() => router.push(`/lead/${lead.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${name}`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {name}
        </Text>
        {badge && <Badge variant={badge.variant} label={badge.label} />}
      </View>
      <Text style={styles.cardAddress} numberOfLines={2}>
        {lead.address ?? '—'}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaText}>Score: {score}</Text>
        <Text style={styles.cardMetaText}>{lead.status}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginHorizontal: 4,
  },
  cardPressed: {
    backgroundColor: '#f6f8fa',
    opacity: 0.98,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },
  cardAddress: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cardMetaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
