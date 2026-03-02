/**
 * ScoreBadge - Badge coloré selon score (0-39 rouge, 40-69 ambre, 70+ vert)
 */

import { StyleSheet, Text, View } from 'react-native';

interface ScoreBadgeProps {
  score: number | null | undefined;
}

function getScoreStyle(score: number | null | undefined): { bg: string; text: string } {
  const s = score ?? 0;
  if (s <= 39) return { bg: '#fee2e2', text: '#dc2626' };
  if (s <= 69) return { bg: '#fef3c7', text: '#d97706' };
  return { bg: '#d1fae5', text: '#059669' };
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const style = getScoreStyle(score);
  const value = score != null ? score : '—';
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
});
