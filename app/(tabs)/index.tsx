import { LeadCard, type Lead } from '@/components/lead-card';
import { BACKEND_BASE_URL } from '@/src/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type LeadStatusFilter = 'all' | 'needs_review' | 'incomplete' | 'complete';
export type SortMode = 'priority' | 'recent';

const STATUS_CHIPS: { value: LeadStatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'needs_review', label: 'À vérifier' },
  { value: 'incomplete', label: 'Incomplet' },
  { value: 'complete', label: 'Traité' },
];

function searchMatches(lead: Lead, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const name =
    (lead.full_name || lead.contact_name || lead.client_phone || lead.phone || '').toLowerCase();
  const phone = (lead.client_phone || lead.phone || '').toString().toLowerCase();
  const address = (lead.address || '').toLowerCase();
  return (
    name.includes(q) ||
    phone.includes(q) ||
    address.includes(q)
  );
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

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/leads`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      const data = (json.data ?? []) as Lead[];
      setLeads(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredAndSortedLeads = useMemo(() => {
    let list = leads.filter(
      (l) => searchMatches(l, searchQuery) && filterByStatus(l, statusFilter)
    );
    if (sortMode === 'priority') {
      list = [...list].sort(
        (a, b) => (b.priority_score ?? b.score ?? 0) - (a.priority_score ?? a.score ?? 0)
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return list;
  }, [leads, searchQuery, statusFilter, sortMode]);

  const onRefresh = useCallback(() => {
    Keyboard.dismiss();
    void load(true);
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nom, tél., adresse…"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          accessibilityLabel="Rechercher par nom, téléphone ou adresse"
        />
      </View>

      <View style={styles.chipsRow}>
        {STATUS_CHIPS.map((chip) => (
          <Pressable
            key={chip.value}
            onPress={() => setStatusFilter(chip.value)}
            style={[
              styles.chip,
              statusFilter === chip.value && styles.chipActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: statusFilter === chip.value }}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === chip.value && styles.chipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Tri :</Text>
        <Pressable
          onPress={() => setSortMode('priority')}
          style={[styles.sortBtn, sortMode === 'priority' && styles.sortBtnActive]}
        >
          <Text style={[styles.sortBtnText, sortMode === 'priority' && styles.sortBtnTextActive]}>
            Priorité
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSortMode('recent')}
          style={[styles.sortBtn, sortMode === 'recent' && styles.sortBtnActive]}
        >
          <Text style={[styles.sortBtnText, sortMode === 'recent' && styles.sortBtnTextActive]}>
            Récent
          </Text>
        </Pressable>
      </View>

      {loading && !refreshing && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Vérifiez que le backend tourne et que l&apos;IP est correcte.
          </Text>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filteredAndSortedLeads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <LeadCard lead={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0a7ea4']}
              tintColor="#0a7ea4"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun lead</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    minHeight: minTouch,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    minHeight: minTouch,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#0a7ea4',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chipTextActive: {
    color: '#fff',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
    minHeight: 36,
    justifyContent: 'center',
  },
  sortBtnActive: {
    backgroundColor: '#e3f2fd',
  },
  sortBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  sortBtnTextActive: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcc',
    backgroundColor: '#fff5f5',
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
  errorHint: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.8,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
