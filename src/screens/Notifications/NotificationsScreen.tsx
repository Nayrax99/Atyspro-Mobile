/**
 * NotificationsScreen - Empty state notifications
 */
import { StyleSheet, View } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { EmptyState } from '@/src/components/common/EmptyState';
import { colors } from '@/src/constants/colors';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        icon={BellOff}
        title="Aucune notification"
        subtitle="Vous serez notifié dès qu'un nouveau lead arrive"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
