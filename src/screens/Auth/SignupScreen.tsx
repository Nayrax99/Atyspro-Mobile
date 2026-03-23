/**
 * SignupScreen - Inscription — bloc dark en haut + carte formulaire claire
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eye, EyeOff } from 'lucide-react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { fontFamily } from '@/src/constants/typography';

const MIN_PASSWORD_LENGTH = 6;

export default function SignupScreen() {
  const router = useRouter();
  const { signup, login } = useAuth();
  const insets = useSafeAreaInsets();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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
    const signupResult = await signup(email.trim(), password, businessName.trim());
    if (!signupResult.success) {
      setError(signupResult.error ?? "Erreur lors de l'inscription");
      setLoading(false);
      return;
    }
    const loginResult = await login(email.trim(), password);
    setLoading(false);
    if (!loginResult.success) {
      setError(loginResult.error ?? 'Compte créé mais connexion échouée');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Bloc dark en haut avec grille */}
        <View style={[styles.darkHeader, { paddingTop: insets.top + 32 }]}>
          {[48, 96, 144].map((top) => (
            <View key={`h${top}`} style={[styles.gridLine, { top }]} />
          ))}
          {[80, 160, 240, 320].map((left) => (
            <View key={`v${left}`} style={[styles.gridLineV, { left }]} />
          ))}
          <Text style={styles.darkLogo}>AtysPro</Text>
          <Text style={styles.darkTagline}>{"Commencez gratuitement — sans carte bancaire."}</Text>
        </View>

        {/* Contenu principal */}
        <View style={[styles.mainContent, { paddingBottom: insets.bottom + 24 }]}>
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>INSCRIPTION GRATUITE</Text>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {'Créer un compte'}
          </Text>
          <Text style={styles.subtitle}>
            {"Rejoignez AtysPro et ne perdez plus un client."}
          </Text>

          {/* Carte formulaire */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{"NOM DE L'ENTREPRISE"}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex : Plomberie Martin"
                placeholderTextColor="#9CA3AF"
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                editable={!loading}
                accessibilityLabel="Nom de l'entreprise"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ADRESSE EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="vous@exemple.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="Adresse email"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MOT DE PASSE</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.input, { paddingRight: 46 }]}
                  placeholder="Minimum 6 caractères"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  accessibilityLabel="Mot de passe"
                  returnKeyType="next"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword
                    ? <EyeOff size={18} color="#94A3B8" />
                    : <Eye size={18} color="#94A3B8" />
                  }
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONFIRMER LE MOT DE PASSE</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.input, { paddingRight: 46 }]}
                  placeholder="Répétez le mot de passe"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPasswordConfirm}
                  editable={!loading}
                  accessibilityLabel="Confirmer le mot de passe"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <Pressable
                  onPress={() => setShowPasswordConfirm((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  accessibilityLabel={showPasswordConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPasswordConfirm
                    ? <EyeOff size={18} color="#94A3B8" />
                    : <Eye size={18} color="#94A3B8" />
                  }
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                loading && styles.btnDisabled,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityLabel="Créer mon compte gratuitement"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{'Créer mon compte gratuitement'}</Text>
              )}
            </Pressable>
          </View>

          {/* Lien connexion */}
          <Pressable
            style={styles.switchLink}
            onPress={() => router.push('/login')}
            disabled={loading}
            accessibilityLabel="Déjà un compte ? Se connecter"
            accessibilityRole="link"
          >
            <Text style={styles.switchText}>
              {'Déjà un compte ? '}
              <Text style={styles.switchTextBold}>Se connecter</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F7',
  },

  // Dark header
  darkHeader: {
    backgroundColor: '#0D1B38',
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  darkLogo: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    color: '#ffffff',
    marginBottom: 8,
  },
  darkTagline: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // Contenu
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#EBF2FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#1A56DB',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Carte
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 6,
  },

  // Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#6B7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: '#0F172A',
  },

  // Erreur
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },

  // Bouton
  submitBtn: {
    backgroundColor: '#1A56DB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    minHeight: Platform.OS === 'android' ? 48 : 52,
  },
  btnPressed: { opacity: 0.88 },
  btnDisabled: { opacity: 0.6 },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },

  // Lien bas
  switchLink: { alignItems: 'center', paddingVertical: 8 },
  switchText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: '#6B7280',
  },
  switchTextBold: {
    fontFamily: fontFamily.bold,
    color: '#1A56DB',
  },
});
