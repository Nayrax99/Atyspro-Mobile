/**
 * RootNavigator - Stack principal avec auth : loader, login/signup ou tabs + lead
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { BusinessProvider } from '@/src/contexts/BusinessContext';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { setUnauthorizedCallback } from '@/src/services/api';

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
  const { isAuthenticated, isLoading, account, logout } = useAuth();
  const pathname = usePathname();

  // Enregistrer le callback de déconnexion automatique en cas de token expiré (401)
  useEffect(() => {
    setUnauthorizedCallback(() => logout());
  }, [logout]);

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
      <Stack.Screen
        name="lead/[id]"
        options={{
          title: 'Détail lead',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', color: '#fff' },
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Mon compte',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', color: '#fff' },
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', color: '#fff' },
        }}
      />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootNavigator() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

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
    fontFamily: fontFamily.medium,
    color: colors.atysBlue,
  },
});
