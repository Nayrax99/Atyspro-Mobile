/**
 * KeyButton - Bouton du keypad
 */

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/constants/colors';

interface KeyButtonProps {
  label: string;
  onPress: () => void;
}

export function KeyButton({ label, onPress }: KeyButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  keyPressed: {
    backgroundColor: colors.slate200,
  },
  text: {
    fontSize: 28,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
