/**
 * SwipeableLeadCard — wrapper swipe gauche pour déclencher "Marquer traité"
 * Seuil : 60% largeur. Feedback visuel + haptic au déclenchement.
 */
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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

const TRIGGER_RATIO = 0.6; // 60% de la largeur

interface SwipeableLeadCardProps {
  lead: Lead;
  index?: number;
  onStatusChange?: (leadId: string, newStatus: string) => void;
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

  // Sur PWA web, le GestureDetector RNGH capture les events tactiles verticaux
  // et bloque le scroll du parent — on désactive le swipe sur web.
  if (Platform.OS === 'web') {
    return <LeadCard lead={lead} index={index} />;
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
