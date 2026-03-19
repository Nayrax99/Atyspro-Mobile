/**
 * OnboardingScreen - Flow 3 étapes — DA dark
 * Étape 1 : Vos informations (numéro, ville, spécialité)
 * Étape 2 : Votre numéro professionnel (informatif, badge SOON)
 * Étape 3 : Comment ça marche + bouton de soumission
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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/contexts/AuthContext';
import { patchOnboarding } from '@/src/services/user.service';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';

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

function ProgressBar({ step }: { step: number }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            i < step && styles.progressSegmentActive,
          ]}
        />
      ))}
    </View>
  );
}

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
      <Text style={styles.stepTitle} accessibilityRole="header">Vos informations</Text>
      <Text style={styles.stepSubtitle}>Personnalisez AtysPro pour votre activité.</Text>

      <Text style={styles.label}>Votre numéro de téléphone</Text>
      <TextInput
        style={styles.input}
        placeholder="06 XX XX XX XX"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={ownerPhone}
        onChangeText={setOwnerPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
        editable={!loading}
        accessibilityLabel="Votre numéro de téléphone"
      />
      <Text style={styles.hint}>{"Ce numéro vous permettra d'être contacté par notre équipe"}</Text>

      <Text style={styles.label}>{"Ville d'exercice"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Paris"
        placeholderTextColor="rgba(255,255,255,0.3)"
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

function StepPhoneNumber() {
  return (
    <>
      <Text style={styles.stepTitle} accessibilityRole="header">Votre numéro professionnel</Text>
      <Text style={styles.stepSubtitle}>
        Un numéro dédié sera attribué à votre compte pour séparer vos appels pro de votre ligne personnelle.
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardEmoji}>📱</Text>
        <Text style={styles.infoCardTitle}>Un numéro rien que pour vous</Text>
        <Text style={styles.infoCardText}>
          Vos clients appelleront ce numéro. AtysPro intercepte les appels manqués, joue un message vocal et envoie automatiquement le SMS de qualification.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoCardTitleRow}>
          <Text style={styles.infoCardEmoji}>⚡</Text>
          <Text style={styles.infoCardTitle}>Attribution automatique</Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>SOON</Text>
          </View>
        </View>
        <Text style={styles.infoCardText}>
          {"Votre numéro professionnel sera attribué automatiquement à l'activation de votre compte. Vous en serez notifié par e-mail."}
        </Text>
      </View>
    </>
  );
}

function StepHowItWorks() {
  return (
    <>
      <Text style={styles.stepTitle} accessibilityRole="header">{'Comment ça marche ?'}</Text>
      <Text style={styles.stepSubtitle}>Chaque appel manqué devient une opportunité qualifiée.</Text>

      {HOW_IT_WORKS.map((item, i) => (
        <View key={i} style={styles.howRow}>
          <View style={styles.howIconWrap}>
            <Text style={styles.howEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.howTextWrap}>
            <Text style={styles.howTitle}>{item.title}</Text>
            <Text style={styles.howDescription}>{item.description}</Text>
          </View>
        </View>
      ))}
    </>
  );
}

export default function OnboardingScreen() {
  const { refreshAuth } = useAuth();
  const insets = useSafeAreaInsets();

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
    await refreshAuth();
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.progressWrapper, { paddingTop: insets.top + 16 }]}>
        {/* Header compact */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#2563eb', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoIcon}
          >
            <Text style={styles.logoEmoji}>⚡</Text>
          </LinearGradient>
          <Text style={styles.logoText}>AtysPro</Text>
          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>{step}/{TOTAL_STEPS}</Text>
          </View>
        </View>
        <ProgressBar step={step} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          <View style={styles.errorBox}>
            <Text style={styles.errorText} accessibilityLiveRegion="polite">{error}</Text>
          </View>
        ) : null}

        {step < TOTAL_STEPS ? (
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }]}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel="Continuer"
          >
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>Continuer</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.submitBtn, loading && styles.btnDisabled, pressed && { opacity: 0.9 }]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Commencer à utiliser AtysPro"
          >
            <LinearGradient
              colors={['#2563eb', '#1d4ed8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>{"Commencer à utiliser AtysPro"}</Text>
              )}
            </LinearGradient>
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
    backgroundColor: colors.slate900,
  },

  // Header + progress
  progressWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: colors.slate900,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 16 },
  logoText: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.white,
    flex: 1,
  },
  stepCounter: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepCounterText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(255,255,255,0.7)',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressSegmentActive: {
    backgroundColor: colors.atysBlue,
  },

  // Contenu
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: colors.white,
    marginBottom: 8,
    marginTop: 16,
  },
  stepSubtitle: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 24,
    lineHeight: 22,
  },

  // Formulaire étape 1
  label: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.white,
    fontFamily: fontFamily.regular,
  },
  hint: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 6,
  },
  specialtyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minHeight: minTouch,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.atysBlue,
    borderColor: colors.atysBlue,
  },
  chipText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(255,255,255,0.7)',
  },
  chipTextActive: {
    color: colors.white,
  },

  // Étape 2 — cartes info
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  infoCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.white,
    marginBottom: 8,
    flex: 1,
  },
  infoCardText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 21,
  },
  soonBadge: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soonText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#c4b5fd',
    letterSpacing: 0.5,
  },

  // Étape 3 — comment ça marche
  howRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  howIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37,99,235,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howEmoji: { fontSize: 22 },
  howTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  howTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.white,
    marginBottom: 4,
  },
  howDescription: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
  },

  // Commun
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 32,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minTouch,
  },
  btnDisabled: { opacity: 0.6 },
  submitText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
});
