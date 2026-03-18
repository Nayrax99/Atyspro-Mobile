/**
 * NotificationBell - Cloche avec badge non-lus, navigue vers /notifications
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { colors } from '@/src/constants/colors';

interface NotificationBellProps {
  hasUnread?: boolean;
}

export function NotificationBell({ hasUnread = false }: NotificationBellProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <Bell size={22} color={colors.slate600} />
      {hasUnread && <View style={styles.badge} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.atysDanger,
  },
});
