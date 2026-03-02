/**
 * RootNavigator - Stack principal (tabs, lead detail, modal)
 * Utilisé par app/_layout.tsx comme wrapper
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/contexts/AuthContext';
import { BusinessProvider } from '@/src/contexts/BusinessContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <BusinessProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="lead/[id]" options={{ title: 'Détail lead' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </BusinessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
