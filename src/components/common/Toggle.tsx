/**
 * Toggle - Switch stylé pour Settings
 */

import { Platform, StyleSheet, Switch, View } from 'react-native';

import { colors } from '@/src/constants/colors';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  return (
    <View style={styles.wrap}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.slate200,
          true: colors.atysSuccess,
        }}
        thumbColor={Platform.OS === 'android' ? colors.white : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 4,
  },
});
