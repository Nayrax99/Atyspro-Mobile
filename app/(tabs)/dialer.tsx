import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

export default function DialerScreen() {
  const [number, setNumber] = useState('');

  function onKeyPress(key: string) {
    setNumber((n) => n + key);
  }

  function onBackspace() {
    setNumber((n) => n.slice(0, -1));
  }

  function onClear() {
    setNumber('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.displayText} numberOfLines={1}>
          {number || ' '}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onBackspace} style={styles.actionBtn} hitSlop={12}>
          <Text style={styles.actionText}>Effacer</Text>
        </Pressable>
        <Pressable onPress={onClear} style={styles.actionBtn} hitSlop={12}>
          <Text style={styles.actionText}>Tout effacer</Text>
        </Pressable>
      </View>

      <View style={styles.keypad}>
        {KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => (
              <Pressable
                key={key}
                onPress={() => onKeyPress(key)}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>{key}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  display: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#111',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  keypad: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: '#e0e0e0',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#111',
  },
});
