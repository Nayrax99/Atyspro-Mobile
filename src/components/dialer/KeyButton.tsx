/**
 * KeyButton - Bouton du keypad
 */

import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

interface KeyButtonProps {
  label: string;
  onPress: () => void;
}

export function KeyButton({ label, onPress }: KeyButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Touche ${label}`}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      } as object,
    }),
  },
  keyPressed: {
    backgroundColor: colors.gray200,
  },
  text: {
    fontSize: 30,
    fontFamily: fontFamily.medium,
    color: colors.slate900,
  },
});
