/**
 * LeadsScreen - Liste leads avec filtres compacts + pagination 10/page
 */

import { LeadCard } from '@/src/components/leads/LeadCard';
import { EmptyState } from '@/src/components/common/EmptyState';
import { fetchLeads } from '@/src/services/leads.service';
import type { Lead } from '@/src/services/leads.service';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText } from 'lucide-react-native';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

export type LeadStatusFilter = 'all' | 'nouveau' | 'a_traiter' | 'traite' | 'incomplet';
export type SortMode = 'priority' | 'recent';
export type SortDir = 'asc' | 'desc';

const STATUS_CHIPS: { value: LeadStatusFilter; label: string }[] = [
  { value: 'all',       label: 'Tous' },
  { value: 'a_traiter', label: 'À traiter' },
  { value: 'traite',    label: 'Traité' },
  { value: 'incomplet', label: 'Incomplet' },
];

const LEADS_PER_PAGE = 10;

function searchMatches(lead: Lead, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const name = (lead.full_name || lead.contact_name || lead.client_phone || lead.phone || '').toString().toLowerCase();
  const phone = (lead.client_phone || lead.phone || '').toString().toLowerCase();
  const address = (lead.address || '').toLowerCase();
  return name.includes(q) || phone.includes(q) || address.includes(q);
}

function filterByStatus(lead: Lead, status: LeadStatusFilter): boolean {
  if (status === 'all') return true;
  return lead.status === status;
}

export default function LeadsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    const { data, error: err } = await fetchLeads();
    if (err) setError(err);
    else setLeads(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Re-fetch when navigating back to this screen (e.g., after status change in detail)
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sortMode, sortDir]);

  const filteredAndSortedLeads = useMemo(() => {
    let list = leads.filter((l) => searchMatches(l, searchQuery) && filterByStatus(l, statusFilter));
    if (sortMode === 'priority') {
      list = [...list].sort((a, b) => (b.priority_score ?? b.score ?? 0) - (a.priority_score ?? a.score ?? 0));
    } else {
      list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (sortDir === 'asc') list = list.reverse();
    return list;
  }, [leads, searchQuery, statusFilter, sortMode, sortDir]);

  const paginatedLeads = filteredAndSortedLeads.slice(0, page * LEADS_PER_PAGE);
  const hasMore = paginatedLeads.length < filteredAndSortedLeads.length;

  const onRefresh = useCallback(() => {
    Keyboard.dismiss();
    void load(true);
  }, [load]);

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, tél., adresse…"
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          accessibilityLabel="Rechercher par nom, téléphone ou adresse"
        />
      </View>

      {/* Chips statut + tri — 1 ligne scrollable */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_CHIPS.map((chip) => {
            const isActive = statusFilter === chip.value;
            return isActive ? (
              <LinearGradient
                key={chip.value}
                colors={['#1A56DB', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.chip, styles.chipActiveGrad]}
              >
                <Pressable
                  onPress={() => setStatusFilter(chip.value)}
                  style={styles.chipInner}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrer par ${chip.label}`}
                  accessibilityState={{ selected: true }}
                >
                  <Text style={[styles.chipText, styles.chipTextActive]}>{chip.label}</Text>
                </Pressable>
              </LinearGradient>
            ) : (
              <Pressable
                key={chip.value}
                onPress={() => setStatusFilter(chip.value)}
                style={[styles.chip, styles.chipInactive]}
                accessibilityRole="button"
                accessibilityLabel={`Filtrer par ${chip.label}`}
                accessibilityState={{ selected: false }}
              >
                <Text style={styles.chipText}>{chip.label}</Text>
              </Pressable>
            );
          })}
          <View style={styles.sortDivider} />
          <Pressable
            onPress={() => {
              if (sortMode === 'priority') setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
              else { setSortMode('priority'); setSortDir('desc'); }
            }}
            style={[styles.sortBtn, sortMode === 'priority' && styles.sortBtnActive]}
            accessibilityRole="button"
            accessibilityLabel="Trier par score"
            accessibilityState={{ selected: sortMode === 'priority' }}
          >
            <Text style={[styles.sortBtnText, sortMode === 'priority' && styles.sortBtnTextActive]}>
              Score {sortMode === 'priority' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (sortMode === 'recent') setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
              else { setSortMode('recent'); setSortDir('desc'); }
            }}
            style={[styles.sortBtn, sortMode === 'recent' && styles.sortBtnActive]}
            accessibilityRole="button"
            accessibilityLabel="Trier par date"
            accessibilityState={{ selected: sortMode === 'recent' }}
          >
            <Text style={[styles.sortBtnText, sortMode === 'recent' && styles.sortBtnTextActive]}>
              Date {sortMode === 'recent' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {loading && !refreshing && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.atysBlue} />
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Vérifiez que le backend tourne et que l&apos;IP est correcte.</Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={paginatedLeads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, paginatedLeads.length === 0 && styles.listEmpty]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item, index }) => <LeadCard lead={item} index={index} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.atysBlue]}
              tintColor={colors.atysBlue}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={FileText}
              title="Aucune demande pour le moment"
              subtitle="Les appels qualifiés par votre assistant apparaîtront ici"
            />
          }
          ListFooterComponent={
            hasMore ? (
              <Pressable
                onPress={() => setPage((p) => p + 1)}
                style={styles.loadMoreBtn}
                accessibilityRole="button"
                accessibilityLabel="Charger plus de demandes"
              >
                <Text style={styles.loadMoreText}>Charger plus</Text>
              </Pressable>
            ) : paginatedLeads.length > 0 ? (
              <Text style={styles.endText}>
                {filteredAndSortedLeads.length} demande{filteredAndSortedLeads.length > 1 ? 's' : ''} au total
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  searchInput: {
    backgroundColor: colors.slate50,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    minHeight: minTouch,
  },

  // Barre de filtres + tri sur 1 ligne
  filterBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  chipActiveGrad: {
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  chipInactive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  chipInner: {},
  chipText: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  sortDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderDefault,
    marginHorizontal: 4,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  sortBtnActive: {
    backgroundColor: '#EBF2FF',
    borderColor: '#BFDBFE',
  },
  sortBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  sortBtnTextActive: {
    color: colors.atysBlue,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    backgroundColor: '#fff5f5',
  },
  errorTitle: { fontSize: 16, fontFamily: fontFamily.bold, marginBottom: 8 },
  errorText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.atysDanger },
  errorHint: { marginTop: 8, fontSize: 12, fontFamily: fontFamily.regular, opacity: 0.8 },
  list: { padding: theme.spacing.md, paddingBottom: 32 },
  listEmpty: { flex: 1 },
  separator: { height: 12 },
  loadMoreBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.atysBlue,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.atysBlue,
  },
  endText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.slate500,
  },
});
