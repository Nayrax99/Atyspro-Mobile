/**
 * HomeScreen - Hub central artisan : KPIs + derniers leads
 * Le statut IA est géré dans AppHeaderDark
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Phone } from 'lucide-react-native';

import { LeadCard } from '@/src/components/leads/LeadCard';
import { EmptyState } from '@/src/components/common/EmptyState';
import { fetchLeads } from '@/src/services/leads.service';
import type { Lead } from '@/src/services/leads.service';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  value: number;
  label: string;
  sub: string;
  subColor: string;
}

function KpiCard({ icon, iconBg, borderColor, value, label, sub, subColor }: KpiCardProps) {
  return (
    <View style={[styles.kpiCard, { borderTopColor: borderColor }]}>
      <View style={[styles.kpiIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={[styles.kpiSub, { color: subColor }]}>{sub}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await fetchLeads();
    setLeads(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const todayLeads = leads.filter((l) => isToday(l.created_at));
  const pendingLeads = leads.filter((l) => l.status !== 'complete');
  const lastThree = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.atysBlue} />}
    >
      {/* KPIs */}
      <View style={styles.kpisRow}>
        <KpiCard
          icon={<Phone size={18} color={colors.atysBlue} />}
          iconBg={colors.atysBlue + '18'}
          borderColor={colors.atysBlue}
          value={todayLeads.length}
          label="APPELS TRAITÉS"
          sub={`+${todayLeads.length} aujourd'hui`}
          subColor={colors.atysBlue}
        />
        <KpiCard
          icon={<FileText size={18} color={colors.atysViolet} />}
          iconBg={colors.atysViolet + '18'}
          borderColor={colors.atysViolet}
          value={pendingLeads.length}
          label="NOUVEAUX LEADS"
          sub={`${pendingLeads.length} à traiter`}
          subColor={colors.atysViolet}
        />
      </View>

      {/* Derniers leads */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Derniers leads</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/leads')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voir tous les leads"
        >
          <Text style={styles.seeAll}>Voir tout →</Text>
        </Pressable>
      </View>

      {lastThree.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun lead pour le moment"
          subtitle="Les appels qualifiés par votre assistant apparaîtront ici"
          compact
        />
      ) : (
        <View style={styles.leadsList}>
          {lastThree.map((lead, index) => (
            <LeadCard key={lead.id} lead={lead} index={index} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40, gap: 20 },

  // KPI Cards
  kpisRow: { flexDirection: 'row', gap: 12 },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.borderDefault,
    borderTopWidth: 3,
    ...theme.shadows.card,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.slate500,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 32,
    fontFamily: fontFamily.bold,
    color: colors.slate900,
    marginBottom: 4,
  },
  kpiSub: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },

  // Section leads
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.atysBlue,
  },
  leadsList: { gap: 12 },
});
