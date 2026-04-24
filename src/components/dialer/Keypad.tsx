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
  return (
    // flex:1 + space-evenly : les 4 lignes se répartissent verticalement dans l'espace dispo
    // sans gaps hardcodés — s'adapte à toutes les hauteurs d'écran
    <View style={styles.keypad}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <KeyButton key={key} label={key} onPress={() => onKeyPress(key)} size={keySize} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // flex:1 pour remplir le keypadWrap, space-evenly distribue les lignes verticalement
  keypad: { flex: 1, justifyContent: 'space-evenly', width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
});
