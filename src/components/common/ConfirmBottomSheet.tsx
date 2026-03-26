/**
 * ConfirmBottomSheet - Bottom sheet de confirmation générique
 * Pattern "rendered" : le Modal reste monté pendant l'animation de fermeture
 * pour que la transition de sortie soit visible.
 */
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

interface ConfirmBottomSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmBottomSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmBottomSheetProps) {
  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // "rendered" reste true pendant l'animation de sortie pour que Modal reste monté
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      ]).start();
    } else if (rendered) {
      // Jouer l'animation de fermeture AVANT de démonter le Modal
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 300, duration: 150, useNativeDriver: true }),
      ]).start(() => setRendered(false));
    }
  }, [visible, rendered, opacity, translateY]);

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttons}>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.btnConfirm,
                loading && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={styles.btnConfirmText}>
                {loading ? 'En cours…' : confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.btnCancel,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.btnCancelText}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: 36,
    gap: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttons: { gap: 10, marginTop: 8 },
  btnConfirm: {
    backgroundColor: colors.atysSuccess,
    borderRadius: 14,
    minHeight: minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnConfirmText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.white,
  },
  btnCancel: {
    backgroundColor: colors.white,
    borderRadius: 14,
    minHeight: minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  btnCancelText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  btnDisabled: { opacity: 0.6 },
  btnPressed: { opacity: 0.85 },
});
