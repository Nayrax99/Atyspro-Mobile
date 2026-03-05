/**
 * RootNavigator - Stack principal avec auth : loader, login/signup ou tabs + lead + modal
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { BusinessProvider } from '@/src/contexts/BusinessContext';
import { colors } from '@/src/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Écran de chargement au démarrage (vérification du token)
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.atysBlue} />
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );
}

function RootNavigatorContent() {
  const { isAuthenticated, isLoading, account } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isOnboardingRoute = pathname === '/onboarding';

  // Non authentifié → login (sauf si déjà sur une route auth)
  if (!isAuthenticated && !isAuthRoute) {
    return <Redirect href="/login" />;
  }

  // Authentifié sur route auth → onboarding si pas encore fait, sinon tabs
  if (isAuthenticated && isAuthRoute) {
    return <Redirect href={account?.onboarding_completed ? '/(tabs)' : '/onboarding'} />;
  }

  // Authentifié sur onboarding mais déjà complété → tabs
  if (isAuthenticated && isOnboardingRoute && account?.onboarding_completed) {
    return <Redirect href="/(tabs)" />;
  }

  // Authentifié, accès aux tabs sans avoir complété l'onboarding → onboarding
  if (isAuthenticated && !isAuthRoute && !isOnboardingRoute && !account?.onboarding_completed) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="lead/[id]" options={{ title: 'Détail lead' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <BusinessProvider>
          <RootNavigatorContent />
          <StatusBar style="auto" />
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.atysBlue,
  },
});
