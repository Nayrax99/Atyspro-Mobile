/**
 * Button - Bouton réutilisable avec variants
 */
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';
import type { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
}

const minHeight = Platform.OS === 'android' ? 48 : 44;

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.atysBlue, text: colors.white },
  success: { bg: colors.atysSuccess, text: colors.white },
  danger: { bg: colors.atysDanger, text: colors.white },
  secondary: { bg: colors.white, text: colors.slate700, border: colors.borderDefault },
  ghost: { bg: 'transparent', text: colors.atysBlue },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon: Icon,
}: ButtonProps) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : undefined,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {Icon && <Icon size={18} color={v.text} />}
          <Text style={[styles.text, { color: v.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.6 },
});
