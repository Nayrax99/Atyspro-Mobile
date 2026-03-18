/**
 * ProfileButton - Initiales user dans un cercle, navigue vers /account
 */
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

export function ProfileButton() {
  const router = useRouter();
  const { account } = useAuth();

  const initials = (account?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable
      onPress={() => router.push('/account')}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Mon compte"
    >
      <Text style={styles.initials}>{initials}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.atysBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  initials: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
});
