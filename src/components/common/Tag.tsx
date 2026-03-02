/**
 * Tag - Pill pour mission type, filtres, etc.
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/colors';

interface TagProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles: Record<NonNullable<TagProps['variant']>, { bg: string; text: string }> = {
  default: { bg: colors.slate100, text: colors.slate700 },
  primary: { bg: '#eef2ff', text: colors.atysBlue },
  success: { bg: '#d1fae5', text: colors.atysSuccess },
  warning: { bg: '#fef3c7', text: '#d97706' },
  danger: { bg: '#fee2e2', text: colors.atysDanger },
};

export function Tag({ label, variant = 'default' }: TagProps) {
  const s = variantStyles[variant];
  return (
    <View style={[styles.tag, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
