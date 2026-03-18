/**
 * EmptyState - État vide réutilisable
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction, compact }: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Icon size={64} color={colors.slate400} strokeWidth={1.5} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  compact: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  action: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.atysBlue,
  },
});
