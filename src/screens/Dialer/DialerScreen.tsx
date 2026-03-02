/**
 * DialerScreen - Clavier téléphonique avec header gradient et bouton Appeler
 */

import { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/src/components/layout/AppHeader';
import { Keypad } from '@/src/components/dialer/Keypad';
import { colors } from '@/src/constants/colors';
import { theme } from '@/src/constants/theme';

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

  function onCall() {
    const clean = number.replace(/\D/g, '');
    if (clean.length >= 10) {
      Linking.openURL(`tel:${clean.startsWith('0') ? clean : '0' + clean}`);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Clavier" subtitle="Composez un numéro" />
      <View style={styles.body}>
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
        <View style={styles.keypadWrap}>
          <Keypad onKeyPress={onKeyPress} />
        </View>
        <Pressable
          onPress={onCall}
          disabled={number.replace(/\D/g, '').length < 10}
          style={({ pressed }) => [styles.callBtn, pressed && styles.callBtnPressed]}
        >
          <Text style={styles.callBtnText}>📞 Appeler</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  display: {
    backgroundColor: colors.slate50,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    minHeight: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  displayText: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    color: colors.atysBlue,
    fontWeight: '600',
  },
  keypadWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: colors.atysSuccess,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    minHeight: Platform.OS === 'android' ? 48 : 44,
    justifyContent: 'center',
  },
  callBtnPressed: {
    opacity: 0.9,
  },
  callBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
});
