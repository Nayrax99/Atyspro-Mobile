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
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  if (!isAuthenticated && !isAuthRoute) {
    return <Redirect href="/login" />;
  }
  if (isAuthenticated && isAuthRoute) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="lead/[id]" options={{ title: 'Détail lead' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
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
