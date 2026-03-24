/**
 * LoginScreen - Connexion — bloc dark en haut + carte formulaire claire
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
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

function FeatureDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureDot, { backgroundColor: color }]} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Identifiants incorrects');
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
          <Text style={styles.darkTagline}>{"Ne manquez plus aucun client."}</Text>
        </View>

        {/* Contenu principal */}
        <View style={[styles.mainContent, { paddingBottom: insets.bottom + 24 }]}>
          {/* Bannière session expirée */}
          {reason === 'session_expired' && (
            <View style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: '#92400E', fontSize: 13, fontFamily: fontFamily.medium, textAlign: 'center' }}>
                Votre session a expiré. Veuillez vous reconnecter.
              </Text>
            </View>
          )}

          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CONNEXION SÉCURISÉE</Text>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            Connexion à AtysPro
          </Text>
          <Text style={styles.subtitle}>
            Connectez-vous à votre espace AtysPro.
          </Text>

          {/* Carte formulaire */}
          <View style={styles.card}>
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
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  accessibilityLabel="Mot de passe"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
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
              accessibilityLabel="Se connecter"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Se connecter</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.forgotLink}
              accessibilityRole="button"
              accessibilityLabel="Mot de passe oublié"
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </Pressable>
          </View>

          {/* Lien inscription */}
          <Pressable
            style={styles.switchLink}
            onPress={() => router.push('/signup')}
            disabled={loading}
            accessibilityLabel="Pas encore de compte ? Créer un compte"
            accessibilityRole="link"
          >
            <Text style={styles.switchText}>
              {'Pas encore de compte ? '}
              <Text style={styles.switchTextBold}>Créer un compte</Text>
            </Text>
          </Pressable>

          {/* 3 features */}
          <View style={styles.featuresRow}>
            <FeatureDot color="#16A34A" label="Appels qualifiés" />
            <FeatureDot color="#1A56DB" label="Leads scorés" />
            <FeatureDot color="#7c3aed" label="Temps réel" />
          </View>
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

  // Mot de passe oublié
  forgotLink: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: '#6B7280',
    textDecorationLine: 'underline',
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

  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureLabel: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: '#9CA3AF',
  },
});
