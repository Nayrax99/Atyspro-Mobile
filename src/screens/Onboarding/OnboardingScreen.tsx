/**
 * OnboardingScreen - Flow 3 étapes
 * Étape 1 : Vos informations (numéro, ville, spécialité)
 * Étape 2 : Votre numéro professionnel (informatif, badge SOON)
 * Étape 3 : Comment ça marche + bouton de soumission
 * PATCH /api/auth/onboarding appelé uniquement à l'étape 3
 */
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

import { useAuth } from '@/src/contexts/AuthContext';
import { patchOnboarding } from '@/src/services/user.service';
import { colors } from '@/src/constants/colors';
import { theme } from '@/src/constants/theme';

const TOTAL_STEPS = 3;

const SPECIALTIES: { value: string; label: string }[] = [
  { value: 'electricien', label: 'Électricien' },
  { value: 'plombier', label: 'Plombier' },
  { value: 'menuisier', label: 'Menuisier' },
  { value: 'autre', label: 'Autre' },
];

const HOW_IT_WORKS = [
  {
    emoji: '📞',
    title: 'Appel manqué',
    description: 'Un client appelle pendant que vous êtes en intervention. AtysPro répond à votre place.',
  },
  {
    emoji: '💬',
    title: 'SMS de qualification',
    description: 'Un SMS est envoyé automatiquement pour qualifier la demande : type, urgence, adresse.',
  },
  {
    emoji: '⭐',
    title: 'Lead qualifié',
    description: 'La demande apparaît dans votre app, scorée par priorité. Rappelez au bon moment.',
  },
];

// --- Progress bar ---
function ProgressBar({ step }: { step: number }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            i < step && styles.progressSegmentActive,
            i < TOTAL_STEPS - 1 && styles.progressSegmentGap,
          ]}
        />
      ))}
    </View>
  );
}

// --- Étape 1 : Vos informations ---
function StepInfos({
  ownerPhone, setOwnerPhone,
  city, setCity,
  specialty, setSpecialty,
  loading,
}: {
  ownerPhone: string; setOwnerPhone: (v: string) => void;
  city: string; setCity: (v: string) => void;
  specialty: string; setSpecialty: (v: string) => void;
  loading: boolean;
}) {
  return (
    <>
      <Text style={styles.stepTitle} accessibilityRole="header">
        Vos informations
      </Text>
      <Text style={styles.stepSubtitle}>
        Personnalisez AtysPro pour votre activité.
      </Text>

      <Text style={styles.label}>Votre numéro de téléphone</Text>
      <TextInput
        style={styles.input}
        placeholder="06 XX XX XX XX"
        placeholderTextColor={colors.placeholder}
        value={ownerPhone}
        onChangeText={setOwnerPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        editable={!loading}
        accessibilityLabel="Votre numéro de téléphone"
      />
      <Text style={styles.hint}>
        Ce numéro vous permettra d'être contacté par notre équipe
      </Text>

      <Text style={styles.label}>Ville d'exercice</Text>
      <TextInput
        style={styles.input}
        placeholder="Paris"
        placeholderTextColor={colors.placeholder}
        value={city}
        onChangeText={setCity}
        autoCapitalize="words"
        editable={!loading}
        accessibilityLabel="Ville d'exercice"
      />

      <Text style={styles.label}>Spécialité</Text>
      <View style={styles.specialtyRow}>
        {SPECIALTIES.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => !loading && setSpecialty(s.value)}
            style={[styles.chip, specialty === s.value && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: specialty === s.value }}
            accessibilityLabel={s.label}
          >
            <Text style={[styles.chipText, specialty === s.value && styles.chipTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

// --- Étape 2 : Votre numéro professionnel ---
function StepPhoneNumber() {
  return (
    <>
      <Text style={styles.stepTitle} accessibilityRole="header">
        Votre numéro professionnel
      </Text>
      <Text style={styles.stepSubtitle}>
        Un numéro dédié sera attribué à votre compte pour séparer vos appels pro de votre ligne personnelle.
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardEmoji}>📱</Text>
        <Text style={styles.infoCardTitle}>Un numéro rien qu'à vous</Text>
        <Text style={styles.infoCardText}>
          Vos clients appelleront ce numéro. AtysPro intercepte les appels manqués, joue un message vocal et envoie automatiquement le SMS de qualification.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardTitleRow}>
          <Text style={styles.infoCardEmoji}>⚡</Text>
          <Text style={styles.infoCardTitle}>Attribution automatique</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SOON</Text>
          </View>
        </View>
        <Text style={styles.infoCardText}>
          Votre numéro professionnel sera attribué automatiquement à l'activation de votre compte. Vous en serez notifié par e-mail.
        </Text>
      </View>
    </>
  );
}

// --- Étape 3 : Comment ça marche ---
function StepHowItWorks() {
  return (
    <>
      <Text style={styles.stepTitle} accessibilityRole="header">
        Comment ça marche ?
      </Text>
      <Text style={styles.stepSubtitle}>
        Chaque appel manqué devient une opportunité qualifiée.
      </Text>

      {HOW_IT_WORKS.map((item, i) => (
        <View key={i} style={styles.howRow}>
          <View style={styles.howIconWrap}>
            <Text style={styles.howEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.howTextWrap}>
            <Text style={styles.howTitle}>{item.title}</Text>
            <Text style={styles.howDescription}>{item.description}</Text>
          </View>
          {i < HOW_IT_WORKS.length - 1 && <View style={styles.howConnector} />}
        </View>
      ))}
    </>
  );
}

// --- Écran principal ---
export default function OnboardingScreen() {
  const { refreshAuth } = useAuth();

  const [step, setStep] = useState(1);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [city, setCity] = useState('');
  const [specialty, setSpecialty] = useState('electricien');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!ownerPhone.trim()) { setError('Le numéro de mobile est requis.'); return; }
      if (!city.trim()) { setError('La ville est requise.'); return; }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await patchOnboarding({
      owner_phone: ownerPhone.trim(),
      city: city.trim(),
      specialty,
    });
    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue.');
      setLoading(false);
      return;
    }
    // refreshAuth → account.onboarding_completed = true → RootNavigator redirige
    await refreshAuth();
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ProgressBar step={step} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <StepInfos
            ownerPhone={ownerPhone} setOwnerPhone={setOwnerPhone}
            city={city} setCity={setCity}
            specialty={specialty} setSpecialty={setSpecialty}
            loading={loading}
          />
        )}
        {step === 2 && <StepPhoneNumber />}
        {step === 3 && <StepHowItWorks />}

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        {step < TOTAL_STEPS ? (
          <Pressable
            style={styles.button}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Continuer"
          >
            <Text style={styles.buttonText}>Continuer</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Commencer à utiliser AtysPro"
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Commencer à utiliser AtysPro</Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Progress bar
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate200,
  },
  progressSegmentActive: {
    backgroundColor: colors.atysBlue,
  },
  progressSegmentGap: {
    // gap géré par le View parent
  },

  // Content
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 48,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.atysBlue,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  stepSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },

  // Étape 1 — formulaire
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate700,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: colors.slate100,
    minHeight: minTouch,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.atysBlue,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate700,
  },
  chipTextActive: {
    color: colors.white,
  },

  // Étape 2 — cartes info
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    marginBottom: theme.spacing.md,
  },
  infoCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoCardEmoji: {
    fontSize: 28,
    marginBottom: theme.spacing.sm,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: theme.spacing.sm,
    flex: 1,
  },
  infoCardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  badge: {
    backgroundColor: colors.atysViolet,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Étape 3 — comment ça marche
  howRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  howIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howEmoji: {
    fontSize: 22,
  },
  howTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  howTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  howDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  howConnector: {
    // pas utilisé — spacing géré par marginBottom de howRow
  },

  // Commun
  error: {
    color: colors.atysDanger,
    fontSize: 14,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.atysBlue,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    minHeight: minTouch,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
