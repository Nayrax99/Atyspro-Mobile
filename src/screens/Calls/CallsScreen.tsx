/**
 * CallsScreen - Clavier téléphonique + Historique des appels avec mini stats
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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

// Hauteur segmented control + marges (approx)
const SEGMENTED_H = 90;
// Hauteur display + actions + callBtn + paddingBottom
const FIXED_CONTENT_H = 72 + 64 + 48 + 80;

function DialerTab() {
  const { height: windowHeight } = useWindowDimensions();
  const [number, setNumber] = useState('');

  // Taille des touches : remplit la hauteur disponible, entre 52 et 72px
  const keySize = Math.min(72, Math.max(52,
    Math.floor((windowHeight - SEGMENTED_H - FIXED_CONTENT_H - 48) / 4)
  ));

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
    <View style={[styles.dialerBody, { height: windowHeight - SEGMENTED_H }]}>
      <View style={styles.dialerTop}>
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
          <Keypad onKeyPress={onKeyPress} keySize={keySize} />
        </View>
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

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins} min ${secs > 0 ? `${secs}s` : ''}`.trim();
}

function CallDetailSheet({ call, visible, onClose }: { call: Call | null; visible: boolean; onClose: () => void }) {
  if (!call) return null;
  const durationMs = getCallDurationMs(call);
  const callerNumber = formatCallerNumber(call);
  const dateStr = new Date(call.started_at).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sheetStyles.overlay} onPress={onClose}>
        <Pressable style={sheetStyles.sheet} onPress={() => {}}>
          <View style={sheetStyles.handle} />
          <Text style={sheetStyles.title}>Détail de l&apos;appel</Text>

          <View style={sheetStyles.row}>
            <Text style={sheetStyles.rowLabel}>Numéro</Text>
            <Text style={sheetStyles.rowValue}>{callerNumber}</Text>
          </View>
          <View style={sheetStyles.divider} />
          <View style={sheetStyles.row}>
            <Text style={sheetStyles.rowLabel}>Date</Text>
            <Text style={sheetStyles.rowValue}>{dateStr}</Text>
          </View>
          <View style={sheetStyles.divider} />
          <View style={sheetStyles.row}>
            <Text style={sheetStyles.rowLabel}>Durée</Text>
            <Text style={sheetStyles.rowValue}>{durationMs !== null ? formatDuration(durationMs) : '—'}</Text>
          </View>

          {call.lead?.description ? (
            <>
              <View style={sheetStyles.divider} />
              <Text style={sheetStyles.transcriptionLabel}>Transcription SMS</Text>
              <ScrollView style={sheetStyles.transcriptionBox} nestedScrollEnabled>
                <Text style={sheetStyles.transcriptionText}>{call.lead.description}</Text>
              </ScrollView>
            </>
          ) : null}

          <Pressable style={sheetStyles.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer">
            <Text style={sheetStyles.closeBtnText}>Fermer</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CallItem({ call, index, onPress }: { call: Call; index: number; onPress: () => void }) {
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
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.callItem, { borderLeftColor: borderColor }, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={`Appel de ${formatCallerNumber(call)}`}
      >
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
        <Text style={styles.callChevron}>›</Text>
      </Pressable>
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
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

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
    <>
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CallItem call={item} index={index} onPress={() => setSelectedCall(item)} />
        )}
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
      <CallDetailSheet
        call={selectedCall}
        visible={selectedCall !== null}
        onClose={() => setSelectedCall(null)}
      />
    </>
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
    justifyContent: 'space-between',
  },
  dialerTop: {},
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
  keypadWrap: { alignItems: 'center' },
  callBtnWrapper: {},
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
  callChevron: {
    fontSize: 20,
    color: colors.slate300,
    marginLeft: 4,
    fontFamily: fontFamily.regular,
  },
});

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  transcriptionLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  transcriptionBox: {
    backgroundColor: colors.slate50,
    borderRadius: 10,
    padding: 12,
    maxHeight: 160,
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.slate100,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
  },
});
