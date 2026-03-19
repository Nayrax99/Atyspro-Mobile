/**
 * HomeScreen - Résumé du jour, KPIs, mini graphique 7 jours
 */
import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Phone, FileText, TrendingUp } from 'lucide-react-native';

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
  value: string | number;
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

function BarChart({ leads }: { leads: Lead[] }) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const label = date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
    const count = leads.filter(
      (l) => new Date(l.created_at).toDateString() === date.toDateString()
    ).length;
    return { label, count };
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Activité 7 jours</Text>
      <View style={styles.barsRow}>
        {last7Days.map((day, i) => (
          <View key={i} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.count / maxCount) * 80, day.count > 0 ? 6 : 2),
                    backgroundColor: day.count > 0 ? colors.atysBlue : colors.slate200,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{day.label}</Text>
            {day.count > 0 && <Text style={styles.barValue}>{day.count}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
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
  const pendingLeads = leads.filter((l) => l.status === 'needs_review' || l.status === 'incomplete');
  const completeLeads = leads.filter((l) => l.status === 'complete');
  const treatmentRate = leads.length > 0 ? Math.round((completeLeads.length / leads.length) * 100) : 0;

  const hasPending = pendingLeads.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.atysBlue} />
      }
    >
      {/* Résumé du jour */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Résumé du jour</Text>
        <Text style={styles.summaryText}>
          {hasPending ? (
            <>
              Vous avez{' '}
              <Text style={[styles.summaryHighlight, { color: colors.atysBlue }]}>
                {pendingLeads.length} lead{pendingLeads.length > 1 ? 's' : ''} à traiter
              </Text>{' '}
              {"aujourd'hui"}
            </>
          ) : (
            <>
              <Text style={[styles.summaryHighlight, { color: colors.atysSuccess }]}>
                Tout est à jour
              </Text>
              , aucun lead en attente
            </>
          )}
        </Text>
      </View>

      {/* KPIs */}
      <View style={styles.kpisRow}>
        <KpiCard
          icon={<Phone size={18} color={colors.atysBlue} />}
          iconBg={colors.atysBlue + '18'}
          borderColor={colors.atysBlue}
          value={leads.length}
          label="APPELS TRAITÉS"
          sub={`+${todayLeads.length} aujourd'hui`}
          subColor={colors.atysBlue}
        />
        <KpiCard
          icon={<FileText size={18} color={colors.atysViolet} />}
          iconBg={colors.atysViolet + '18'}
          borderColor={colors.atysViolet}
          value={leads.length}
          label="NOUVEAUX LEADS"
          sub={`${pendingLeads.length} à traiter`}
          subColor={colors.atysViolet}
        />
      </View>

      <View style={styles.kpiSingleRow}>
        <KpiCard
          icon={<TrendingUp size={18} color={colors.atysSuccess} />}
          iconBg={colors.atysSuccess + '18'}
          borderColor={colors.atysSuccess}
          value={`${treatmentRate}%`}
          label="TAUX DE TRAITEMENT"
          sub="leads traités"
          subColor={colors.atysSuccess}
        />
      </View>

      {/* Mini graphique */}
      <BarChart leads={leads} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40, gap: 16 },

  // Résumé
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...theme.shadows.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  summaryHighlight: {
    fontFamily: fontFamily.bold,
  },

  // KPI Cards
  kpisRow: { flexDirection: 'row', gap: 12 },
  kpiSingleRow: { flexDirection: 'row' },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
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

  // Bar chart
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...theme.shadows.card,
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    height: 80,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
    color: colors.slate500,
    textTransform: 'capitalize',
  },
  barValue: {
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: colors.atysBlue,
  },
});
