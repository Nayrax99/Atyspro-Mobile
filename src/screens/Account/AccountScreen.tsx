/**
 * AccountScreen - Profil éditable, numéro AtysPro, assistant IA, infos app, déconnexion
 */
import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Clock, Lock, Phone, Pencil, Camera } from 'lucide-react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { apiPatch } from '@/src/services/api';
import { colors } from '@/src/constants/colors';
import { fontFamily } from '@/src/constants/typography';
import { theme } from '@/src/constants/theme';

const PRESET_AVATARS: [string, string][] = [
  ['#1A56DB', '#7c3aed'],
  ['#16A34A', '#059669'],
  ['#ef4444', '#DC2626'],
  ['#f59e0b', '#D97706'],
  ['#0D1B38', '#1A56DB'],
  ['#7c3aed', '#9333ea'],
  ['#059669', '#0D9488'],
  ['#DC2626', '#9333ea'],
];

function SettingRow({
  icon,
  label,
  sub,
  right,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.settingRow, onPress && pressed && styles.rowPressed]}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={label}
    >
      <View style={styles.settingIconWrap}>{icon}</View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sub ? <Text style={styles.settingSub}>{sub}</Text> : null}
      </View>
      {right ? <View style={styles.settingRight}>{right}</View> : null}
    </Pressable>
  );
}

export default function AccountScreen() {
  const { account, user, logout, refreshAuth } = useAuth();

  const acc = account as Record<string, unknown>;
  const [nameValue, setNameValue] = useState(account?.name ?? '');
  const [firstNameValue, setFirstNameValue] = useState(acc?.first_name as string ?? '');
  const [lastNameValue, setLastNameValue] = useState(acc?.last_name as string ?? '');
  const [companyNameValue, setCompanyNameValue] = useState(acc?.company_name as string ?? '');
  const [cityValue, setCityValue] = useState(acc?.city as string ?? '');
  const [specialty] = useState(acc?.specialty as string ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [avatarPreset, setAvatarPreset] = useState<[string, string]>(['#1A56DB', '#7c3aed']);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (account) {
      const a = account as Record<string, unknown>;
      setNameValue(account.name ?? '');
      setFirstNameValue(typeof a.first_name === 'string' ? a.first_name : '');
      setLastNameValue(typeof a.last_name === 'string' ? a.last_name : '');
      setCompanyNameValue(typeof a.company_name === 'string' ? a.company_name : '');
      setCityValue(typeof a.city === 'string' ? a.city : '');
    }
  }, [account]);

  const isDirty =
    nameValue !== (account?.name ?? '') ||
    firstNameValue !== (typeof acc?.first_name === 'string' ? acc.first_name : '') ||
    lastNameValue !== (typeof acc?.last_name === 'string' ? acc.last_name : '') ||
    companyNameValue !== (typeof acc?.company_name === 'string' ? acc.company_name : '') ||
    cityValue !== (typeof acc?.city === 'string' ? acc.city : '');

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    const res = await apiPatch('/api/account', {
      name: nameValue,
      first_name: firstNameValue,
      last_name: lastNameValue,
      company_name: companyNameValue,
      city: cityValue,
      specialty,
    });
    if (!res.success) {
      setSaveError(res.error ?? 'Erreur lors de la sauvegarde');
    } else {
      await refreshAuth();
    }
    setSaving(false);
  }

  async function handlePickFromGallery() {
    setShowAvatarPicker(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function handleSelectPreset(preset: [string, string]) {
    setAvatarPreset(preset);
    setPhotoUri(null);
    setShowAvatarPicker(false);
  }

  const displayName = firstNameValue && lastNameValue
    ? `${firstNameValue} ${lastNameValue}`
    : companyNameValue || nameValue || account?.name || 'U';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar avec bouton caméra */}
      <View style={styles.profileSection}>
        <Pressable
          onPress={() => setShowAvatarPicker(true)}
          style={styles.avatarWrap}
          accessibilityRole="button"
          accessibilityLabel="Modifier la photo de profil"
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImg} />
          ) : (
            <LinearGradient
              colors={avatarPreset}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          )}
          <View style={styles.cameraBtn}>
            <Camera size={12} color={colors.white} />
          </View>
        </Pressable>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
      </View>

      {/* Champs profil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon profil</Text>
        <View style={styles.card}>
          {/* PRÉNOM */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>PRÉNOM</Text>
            <View style={styles.fieldInputRow}>
              <TextInput
                style={styles.fieldInput}
                value={firstNameValue}
                onChangeText={setFirstNameValue}
                placeholder="Jean"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                accessibilityLabel="Prénom"
              />
              <Pencil size={14} color={colors.slate400} />
            </View>
          </View>

          <View style={styles.separator} />

          {/* NOM */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>NOM</Text>
            <View style={styles.fieldInputRow}>
              <TextInput
                style={styles.fieldInput}
                value={lastNameValue}
                onChangeText={setLastNameValue}
                placeholder="Dupont"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                accessibilityLabel="Nom de famille"
              />
              <Pencil size={14} color={colors.slate400} />
            </View>
          </View>

          <View style={styles.separator} />

          {/* ENTREPRISE */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>ENTREPRISE</Text>
            <View style={styles.fieldInputRow}>
              <TextInput
                style={styles.fieldInput}
                value={companyNameValue}
                onChangeText={setCompanyNameValue}
                placeholder="Nom de votre entreprise"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                accessibilityLabel="Entreprise"
              />
              <Pencil size={14} color={colors.slate400} />
            </View>
          </View>

          <View style={styles.separator} />

          {/* NOM COMPTE (legacy) */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>NOM COMPTE</Text>
            <View style={styles.fieldInputRow}>
              <TextInput
                style={styles.fieldInput}
                value={nameValue}
                onChangeText={setNameValue}
                placeholder="Nom affiché sur le compte"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                accessibilityLabel="Nom compte"
              />
              <Pencil size={14} color={colors.slate400} />
            </View>
          </View>

          <View style={styles.separator} />

          {/* EMAIL — verrouillé */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.fieldInputRow}>
              <Text style={[styles.fieldValue, styles.fieldReadOnly]} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
              <Lock size={14} color={colors.slate300} />
            </View>
            <Text style={styles.fieldHint}>Non modifiable</Text>
          </View>

          <View style={styles.separator} />

          {/* VILLE */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>VILLE</Text>
            <View style={styles.fieldInputRow}>
              <TextInput
                style={styles.fieldInput}
                value={cityValue}
                onChangeText={setCityValue}
                placeholder="Paris, Lyon, Marseille…"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
                accessibilityLabel="Ville"
              />
              <Pencil size={14} color={colors.slate400} />
            </View>
            <Text style={styles.fieldHint}>Utilisée pour personnaliser votre profil</Text>
          </View>

          <View style={styles.separator} />

          {/* MÉTIER — verrouillé */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>MÉTIER</Text>
            <View style={styles.fieldInputRow}>
              <Text style={[styles.fieldValue, styles.fieldReadOnly]}>
                {specialty || '—'}
              </Text>
              <Lock size={14} color={colors.slate300} />
            </View>
            <Text style={styles.fieldHint}>Modifiable depuis le dashboard web</Text>
          </View>
        </View>

        {isDirty && (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Sauvegarder le profil"
          >
            <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</Text>
          </Pressable>
        )}
        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
      </View>

      {/* Section Numéro AtysPro */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Numéro professionnel</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Phone size={18} color={colors.atysViolet} />}
            label="Numéro professionnel"
            sub={"Un numéro dédié sera attribué à votre compte"}
            right={
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>SOON</Text>
              </View>
            }
          />
          <Text style={styles.numberPlaceholder}>{"En cours d'attribution"}</Text>
        </View>
      </View>

      {/* Section Assistant IA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistant IA</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Lock size={18} color={colors.slate400} />}
            label={"Activer / désactiver l'agent"}
            sub="Bientôt disponible"
          />
          <View style={styles.separator} />
          <SettingRow
            icon={<Clock size={18} color={colors.slate400} />}
            label="Plages horaires actives"
            sub="Bientôt disponible"
          />
        </View>
      </View>

      {/* Section Application */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<View style={styles.versionDot} />}
            label="Version"
            right={<Text style={styles.versionText}>1.0.0 (Bêta)</Text>}
          />
          <View style={styles.separator} />
          <SettingRow
            icon={<View style={styles.versionDot} />}
            label="Dashboard web"
            onPress={() => Linking.openURL('https://atyspro-backend.vercel.app')}
            right={<Text style={styles.linkText}>{'Ouvrir →'}</Text>}
          />
        </View>
      </View>

      {/* Déconnexion */}
      <Pressable
        onPress={logout}
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
        accessibilityRole="button"
        accessibilityLabel="Déconnexion"
      >
        <Text style={styles.logoutText}>Déconnexion</Text>
      </Pressable>

      {/* Modal sélecteur de photo */}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAvatarPicker(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Photo de profil</Text>

            <Pressable
              onPress={handlePickFromGallery}
              style={styles.galleryBtn}
              accessibilityRole="button"
              accessibilityLabel="Choisir depuis la galerie"
            >
              <Camera size={18} color={colors.atysBlue} />
              <Text style={styles.galleryBtnText}>Choisir depuis la galerie</Text>
            </Pressable>

            <Text style={styles.presetsLabel}>Avatars prédéfinis</Text>
            <View style={styles.presetsGrid}>
              {PRESET_AVATARS.map((preset, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSelectPreset(preset)}
                  accessibilityRole="button"
                  accessibilityLabel={`Avatar ${i + 1}`}
                >
                  <LinearGradient
                    colors={preset}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.presetAvatar,
                      avatarPreset[0] === preset[0] && !photoUri && styles.presetSelected,
                    ]}
                  >
                    <Text style={styles.presetText}>{initials}</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const minTouch = Platform.OS === 'android' ? 48 : 44;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: 40, gap: 0 },

  // Profil
  profileSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fontFamily.bold,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.atysBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileName: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },

  // Sections
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginLeft: 16,
  },

  // Champs éditables
  fieldRow: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    minHeight: minTouch,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  fieldReadOnly: {
    color: colors.textMuted,
  },
  fieldHint: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: colors.slate400,
    marginTop: 3,
  },

  // Save
  saveBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.atysBlue,
    alignItems: 'center',
    minHeight: minTouch,
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.white,
  },
  saveError: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.atysDanger,
    textAlign: 'center',
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    minHeight: minTouch,
  },
  rowPressed: { backgroundColor: colors.slate50 },
  settingIconWrap: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, fontFamily: fontFamily.medium, color: colors.textPrimary },
  settingSub: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 2 },
  settingRight: { marginLeft: 8 },

  // Badges
  soonBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soonText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.atysViolet,
    letterSpacing: 0.5,
  },
  numberPlaceholder: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 14,
    marginLeft: 44,
  },

  // Version & link
  versionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate400,
  },
  versionText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary },
  linkText: { fontSize: 14, fontFamily: fontFamily.medium, color: colors.atysBlue },

  // Logout
  logoutBtn: {
    marginTop: theme.spacing.md,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    minHeight: minTouch,
    justifyContent: 'center',
  },
  logoutPressed: { opacity: 0.9 },
  logoutText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.atysDanger,
    textAlign: 'center',
  },

  // Modal avatar picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EBF2FF',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  galleryBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.atysBlue,
  },
  presetsLabel: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  presetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetSelected: {
    borderWidth: 3,
    borderColor: colors.atysBlue,
  },
  presetText: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
});
