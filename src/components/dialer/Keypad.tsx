/**
 * Keypad - Clavier numérique (1-9, *, 0, #)
 */

import { StyleSheet, View } from 'react-native';

import { KeyButton } from './KeyButton';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

interface KeypadProps {
  onKeyPress: (key: string) => void;
  keySize?: number;
}

export function Keypad({ onKeyPress, keySize = 72 }: KeypadProps) {
  const gap = keySize < 64 ? 8 : 16;
  return (
    <View style={[styles.keypad, { gap }]}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: gap + 8 }]}>
          {row.map((key) => (
            <KeyButton key={key} label={key} onPress={() => onKeyPress(key)} size={keySize} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keypad: { gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
});
