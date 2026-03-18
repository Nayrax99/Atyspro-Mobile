/**
 * Badge - Pill coloré par statut/variante
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

export type BadgeVariant = 'urgent' | 'needs_review' | 'incomplete' | 'complete' | 'neutral';

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  urgent: { bg: '#fee2e2', text: colors.atysDanger },
  needs_review: { bg: '#fef3c7', text: colors.atysWarning },
  incomplete: { bg: colors.slate100, text: colors.slate600 },
  complete: { bg: '#d1fae5', text: colors.atysSuccess },
  neutral: { bg: '#eef2ff', text: colors.atysBlue },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const style = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
  },
});
