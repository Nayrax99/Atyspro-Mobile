/**
 * SwipeableLeadCard — wrapper swipe gauche pour déclencher "Marquer traité"
 * Native : Gesture.Pan() + Reanimated. Web PWA : PanResponder + Animated natif RN.
 * Seuil déclenchement : 60% largeur (native) / 50% largeur (web).
 */
import { useCallback, useRef, useState } from 'react';
import { Animated as RNAnimated, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { LeadCard } from './LeadCard';
import { ConfirmBottomSheet } from '../common/ConfirmBottomSheet';
import { updateLeadStatus } from '@/src/services/leads.service';
import type { Lead } from '@/src/services/leads.service';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

const TRIGGER_RATIO = 0.6;     // seuil native : 60%
const WEB_TRIGGER_RATIO = 0.5; // seuil web    : 50%

interface SwipeableLeadCardProps {
  lead: Lead;
  index?: number;
  onStatusChange?: (leadId: string, newStatus: string) => void;
}

// Implémentation web via PanResponder : s'intègre au système de réponse tactile
// RN natif, ce qui évite le conflit scroll/swipe du GestureDetector RNGH.
// onMoveShouldSetPanResponder ne capture le geste qu'après que le mouvement démarre,
// ce qui laisse le ScrollView parent traiter les gestes verticaux en priorité.
function WebSwipeableLeadCard({ lead, index = 0, onStatusChange }: SwipeableLeadCardProps) {
  const cardWidthRef = useRef(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const translateXAnim = useRef(new RNAnimated.Value(0)).current;
  const triggeredRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => {
        // Priorité absolue au scroll vertical
        if (Math.abs(gs.dy) > Math.abs(gs.dx)) return false;
        // Capture les swipes horizontaux gauche uniquement
        return gs.dx < -10;
      },
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          translateXAnim.setValue(gs.dx);
          const threshold = -(cardWidthRef.current * WEB_TRIGGER_RATIO);
          if (gs.dx < threshold && !triggeredRef.current) {
            triggeredRef.current = true;
          } else if (gs.dx >= threshold) {
            triggeredRef.current = false;
          }
        }
      },
      onPanResponderRelease: (_, gs) => {
        const threshold = -(cardWidthRef.current * WEB_TRIGGER_RATIO);
        RNAnimated.timing(translateXAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        if (gs.dx < threshold) {
          setShowConfirm(true);
        }
        triggeredRef.current = false;
      },
      onPanResponderTerminate: () => {
        RNAnimated.timing(translateXAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        triggeredRef.current = false;
      },
    })
  ).current;

  // Opacité du fond vert proportionnelle au swipe (-200px → opacité pleine, 0 → transparente)
  const backdropOpacity = translateXAnim.interpolate({
    inputRange: [-200, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  async function handleConfirm() {
    setLoading(true);
    const { data, error } = await updateLeadStatus(lead.id, 'traite');
    setLoading(false);
    if (!error && data) {
      setShowConfirm(false);
      onStatusChange?.(lead.id, 'traite');
    }
  }

  return (
    <>
      <View
        onLayout={(e) => { cardWidthRef.current = e.nativeEvent.layout.width; }}
        style={styles.container}
      >
        <RNAnimated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkLabel}>Traité</Text>
        </RNAnimated.View>

        <RNAnimated.View
          style={{ transform: [{ translateX: translateXAnim }] }}
          {...panResponder.panHandlers}
        >
          <LeadCard lead={lead} index={index} />
        </RNAnimated.View>
      </View>

      <ConfirmBottomSheet
        visible={showConfirm}
        title="Marquer comme traitée ?"
        message="Cette demande sera archivée dans les demandes traitées."
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!loading) setShowConfirm(false);
        }}
      />
    </>
  );
}

export function SwipeableLeadCard({ lead, index = 0, onStatusChange }: SwipeableLeadCardProps) {
  const translateX = useSharedValue(0);
  const cardWidth = useSharedValue(0); // MUST be useSharedValue — accessed in worklets
  const triggered = useSharedValue(false); // MUST be useSharedValue — accessed in worklets
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const openConfirm = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
        const threshold = -(cardWidth.value * TRIGGER_RATIO);
        if (e.translationX < threshold && !triggered.value) {
          triggered.value = true;
          runOnJS(triggerHaptic)();
        } else if (e.translationX >= threshold) {
          triggered.value = false;
        }
      }
    })
    .onEnd((e) => {
      const threshold = -(cardWidth.value * TRIGGER_RATIO);
      if (e.translationX < threshold) {
        translateX.value = withSpring(0, { damping: 20 });
        runOnJS(openConfirm)();
      } else {
        translateX.value = withSpring(0, { damping: 20 });
      }
      triggered.value = false;
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const progress = Math.min(
      Math.abs(translateX.value) / (cardWidth.value * TRIGGER_RATIO || 1),
      1
    );
    return { opacity: progress };
  });

  async function handleConfirm() {
    setLoading(true);
    const { data, error } = await updateLeadStatus(lead.id, 'traite');
    setLoading(false);
    if (!error && data) {
      setShowConfirm(false);
      onStatusChange?.(lead.id, 'traite');
    }
  }

  // Sur PWA web, GestureDetector RNGH bloque le scroll vertical du ScrollView parent.
  // WebSwipeableLeadCard utilise PanResponder natif qui cède la priorité aux gestes verticaux.
  if (Platform.OS === 'web') {
    return <WebSwipeableLeadCard lead={lead} index={index} onStatusChange={onStatusChange} />;
  }

  return (
    <>
      <View
        onLayout={(e) => { cardWidth.value = e.nativeEvent.layout.width; }}
        style={styles.container}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Text style={styles.checkIcon}>✓</Text>
          <Text style={styles.checkLabel}>Traité</Text>
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View style={cardStyle}>
            <LeadCard lead={lead} index={index} />
          </Animated.View>
        </GestureDetector>
      </View>

      <ConfirmBottomSheet
        visible={showConfirm}
        title="Marquer comme traitée ?"
        message="Cette demande sera archivée dans les demandes traitées."
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!loading) setShowConfirm(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 24,
    flexDirection: 'row',
    gap: 6,
  },
  checkIcon: {
    fontSize: 22,
    color: colors.white,
    fontFamily: fontFamily.bold,
  },
  checkLabel: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    alignSelf: 'center',
  },
});
