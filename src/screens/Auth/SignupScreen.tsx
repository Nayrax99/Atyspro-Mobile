/**
 * Écran d'inscription - nom entreprise, email, mot de passe, confirmation
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/constants/colors';
import { theme } from '@/src/constants/theme';

const MIN_PASSWORD_LENGTH = 6;

export default function SignupScreen() {
  const router = useRouter();
  const { signup, login } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!businessName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const signupResult = await signup(
      email.trim(),
      password,
      businessName.trim()
    );
    if (!signupResult.success) {
      setError(signupResult.error ?? 'Erreur lors de l\'inscription');
      setLoading(false);
      return;
    }
    const loginResult = await login(email.trim(), password);
    setLoading(false);
    if (loginResult.success) {
      // RootNavigator redirigera vers les tabs
    } else {
      setError(loginResult.error ?? 'Compte créé mais connexion échouée');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo} accessibilityRole="header">
          ⚡ AtysPro
        </Text>
        <Text style={styles.subtitle}>
          Votre assistant de leads intelligent
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nom de l'entreprise"
          placeholderTextColor={colors.placeholder}
          value={businessName}
          onChangeText={setBusinessName}
          autoCapitalize="words"
          editable={!loading}
          accessibilityLabel="Nom de l'entreprise"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          accessibilityLabel="Champ email"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe (min. 6 caractères)"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          accessibilityLabel="Mot de passe"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor={colors.placeholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
          accessibilityLabel="Confirmer le mot de passe"
        />

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel="Créer mon compte"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Créer mon compte</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.link}
          onPress={() => router.push('/login')}
          disabled={loading}
          accessibilityLabel="Déjà un compte ? Se connecter"
          accessibilityRole="link"
        >
          <Text style={styles.linkText}>
            Déjà un compte ? Se connecter
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.lg,
    alignSelf: 'stretch',
  },
  logo: {
    color: colors.atysBlue,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  error: {
    color: colors.atysDanger,
    fontSize: 14,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.atysBlue,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: colors.atysBlue,
    fontSize: 15,
  },
});
