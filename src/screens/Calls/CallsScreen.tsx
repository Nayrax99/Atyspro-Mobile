/**
 * CallsScreen - Clavier téléphonique + Historique des appels avec mini stats
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Keypad } from '@/src/components/dialer/Keypad';
import { EmptyState } from '@/src/components/common/EmptyState';
import { useCardEntrance } from '@/src/hooks/useCardEntrance';
import { fetchCalls } from '@/src/services/calls.service';
import type { Call } from '@/src/services/calls.service';
import { formatPhone, formatRelativeTime } from '@/src/utils/format';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

type Tab = 'dialer' | 'history';

function DialerTab() {
  const [number, setNumber] = useState('');

  function onKeyPress(key: string) {
    setNumber((n) => n + key);
  }

  function onBackspace() {
    setNumber((n) => n.slice(0, -1));
  }

  function onClear() {
    setNumber('');
  }

  function onCall() {
    const clean = number.replace(/\D/g, '');
    if (clean.length >= 10) {
      Linking.openURL(`tel:${clean.startsWith('0') ? clean : '0' + clean}`);
    }
  }

  return (
    <View style={styles.dialerBody}>
      <View style={styles.display}>
        <Text
          style={styles.displayText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {number || ' '}
        </Text>
      </View>
      <View style={styles.dialerActions}>
        <Pressable
          onPress={onBackspace}
          style={styles.actionBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Effacer dernier chiffre"
        >
          <Text style={styles.actionText}>Effacer</Text>
        </Pressable>
        <Pressable
          onPress={onClear}
          style={styles.actionBtn}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Tout effacer"
        >
          <Text style={styles.actionText}>Tout effacer</Text>
        </Pressable>
      </View>
      <View style={styles.keypadWrap}>
        <Keypad onKeyPress={onKeyPress} />
      </View>
      <Pressable
        onPress={onCall}
        disabled={number.replace(/\D/g, '').length < 10}
        style={({ pressed }) => [styles.callBtnWrapper, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel="Appeler ce numéro"
      >
        <LinearGradient
          colors={['#16A34A', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.callBtn}
        >
          <Phone size={20} color={colors.white} />
          <Text style={styles.callBtnText}>Appeler</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function formatCallerNumber(call: Call): string {
  const number = call.direction === 'inbound' ? call.from_number : call.to_number;
  if (!number || number.toLowerCase() === 'anonymous') {
    return 'Numéro masqué';
  }
  return formatPhone(number);
}

function getCallDurationMs(call: Call): number | null {
  if (!call.started_at || !call.ended_at) return null;
  return new Date(call.ended_at).getTime() - new Date(call.started_at).getTime();
}

function CallItem({ call, index }: { call: Call; index: number }) {
  const isInbound = call.direction === 'inbound';
  const animStyle = useCardEntrance(index);

  const durationMs = getCallDurationMs(call);
  let duration: string | null = null;
  if (durationMs !== null) {
    const mins = Math.round(durationMs / 60000);
    duration = mins > 0 ? `${mins} min` : '< 1 min';
  }
  const hasLead = durationMs !== null && durationMs > 30000;
  const borderColor = isInbound ? colors.atysSuccess : colors.atysBlue;

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.callItem, { borderLeftColor: borderColor }]}>
        <View
          style={[
            styles.callIconWrap,
            { backgroundColor: isInbound ? colors.atysSuccess + '18' : colors.atysBlue + '18' },
          ]}
        >
          {isInbound ? (
            <PhoneIncoming size={18} color={colors.atysSuccess} />
          ) : (
            <PhoneOutgoing size={18} color={colors.atysBlue} />
          )}
        </View>
        <View style={styles.callInfo}>
          <View style={styles.callHeader}>
            <Text style={styles.callNumber}>{formatCallerNumber(call)}</Text>
            {hasLead && (
              <View style={styles.leadBadge}>
                <Text style={styles.leadBadgeText}>Lead créé</Text>
              </View>
            )}
          </View>
          <Text style={styles.callMeta}>
            {formatRelativeTime(call.started_at)}
            {duration ? ` · ${duration}` : ''}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

interface StatPillProps {
  label: string;
  value: string | number;
}

function StatPill({ label, value }: StatPillProps) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HistoryTab() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await fetchCalls();
    const sorted = [...data].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
    setCalls(sorted);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // Stats calculées
  const qualified = calls.filter((c) => getCallDurationMs(c) !== null && (getCallDurationMs(c) ?? 0) > 30000).length;
  const durations = calls
    .map((c) => getCallDurationMs(c))
    .filter((d): d is number => d !== null && d > 0);
  const avgDurationMin = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60000)
    : 0;
  const avgLabel = avgDurationMin > 0 ? `${avgDurationMin} min` : '< 1 min';

  return (
    <FlatList
      data={calls}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <CallItem call={item} index={index} />}
      contentContainerStyle={[styles.listContent, calls.length === 0 && styles.listEmpty]}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.atysBlue} />
      }
      ListHeaderComponent={
        calls.length > 0 ? (
          <View style={styles.statsRow}>
            <StatPill label="TOTAL" value={calls.length} />
            <StatPill label="QUALIFIÉS" value={qualified} />
            <StatPill label="DURÉE MOY." value={durations.length > 0 ? avgLabel : '—'} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon={PhoneOff}
          title="Aucun appel enregistré pour le moment"
          subtitle="L'historique de vos appels qualifiés par l'assistant apparaîtra ici"
        />
      }
    />
  );
}

export default function CallsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('dialer');

  return (
    <View style={styles.container}>
      <View style={styles.segmented}>
        <Pressable
          onPress={() => setActiveTab('dialer')}
          style={[styles.segBtn, activeTab === 'dialer' && styles.segBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Afficher le clavier"
          accessibilityState={{ selected: activeTab === 'dialer' }}
        >
          <Text style={[styles.segLabel, activeTab === 'dialer' && styles.segLabelActive]}>
            Clavier
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={[styles.segBtn, activeTab === 'history' && styles.segBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Afficher l'historique"
          accessibilityState={{ selected: activeTab === 'history' }}
        >
          <Text style={[styles.segLabel, activeTab === 'history' && styles.segLabelActive]}>
            Historique
          </Text>
        </Pressable>
      </View>

      {activeTab === 'dialer' ? <DialerTab /> : <HistoryTab />}
    </View>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Segmented control
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.slate100,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: colors.white,
    ...theme.shadows.card,
  },
  segLabel: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.slate500,
  },
  segLabelActive: {
    color: colors.slate900,
    fontFamily: fontFamily.bold,
  },

  // Dialer
  dialerBody: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 80,
  },
  display: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  displayText: {
    fontSize: 26,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  dialerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  actionText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.atysBlue },
  keypadWrap: { flex: 1, justifyContent: 'center' },
  callBtnWrapper: {
    marginTop: 24,
  },
  callBtn: {
    borderRadius: theme.borderRadius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: minTouch,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 4,
  },
  callBtnText: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.white },

  // Stats pills
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: colors.slate900,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.slate500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // History
  listContent: { padding: theme.spacing.lg, gap: 0 },
  listEmpty: { flex: 1 },
  callItem: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderLeftWidth: 3,
  },
  callIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callInfo: { flex: 1 },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  callNumber: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  callMeta: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textSecondary },
  leadBadge: {
    backgroundColor: '#EBF2FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  leadBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: colors.atysBlue,
  },
});
