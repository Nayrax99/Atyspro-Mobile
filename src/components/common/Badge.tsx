/**
 * Badge - Pill coloré par statut/variante
 * Gradients pour les statuts sémantiques, flat pour neutral
 */
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

export type BadgeVariant = 'urgent' | 'nouveau' | 'a_traiter' | 'incomplet' | 'traite' | 'neutral';

const gradientMap: Record<Exclude<BadgeVariant, 'neutral'>, readonly [string, string]> = {
  urgent:    ['#ef4444', '#DC2626'],
  nouveau:   ['#3b82f6', '#1A56DB'],
  a_traiter: ['#f59e0b', '#D97706'],
  incomplet: ['#94a3b8', '#64748b'],
  traite:    ['#16A34A', '#059669'],
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  if (variant === 'neutral') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.text, { color: colors.primary }]}>{label}</Text>
      </View>
    );
  }

  const gc = gradientMap[variant];
  return (
    <LinearGradient
      colors={gc}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, { shadowColor: gc[0] }]}
    >
      <Text style={[styles.text, styles.textWhite]}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  text: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textWhite: {
    color: colors.white,
  },
});
