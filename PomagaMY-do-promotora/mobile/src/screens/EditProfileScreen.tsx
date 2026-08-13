import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthHeader } from '../components/AuthHeader'
import { ProfileAvatarCircle } from '../components/ProfileAvatarCircle'
import { VOLUNTEER_INTEREST_OPTIONS } from '../constants/volunteerInterests'
import { ORG_REGISTRATION_STATUT_OPTIONAL } from '../config/featureFlags'
import { usePomagaMY } from '../context/PomagaMYContext'
import { nipValidationError, krsValidationErrorOptional } from '../utils/polishOrgIds'
import { isExpoImagePickerNativeAvailable } from '../native/expoImagePickerNativeAvailable'
import type { RootStackParamList } from '../navigation/types'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>

type ImagePickerModule = typeof import('expo-image-picker')

function tryLoadImagePicker(): ImagePickerModule | null {
  if (!isExpoImagePickerNativeAvailable()) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-image-picker') as ImagePickerModule
  } catch {
    return null
  }
}

export function EditProfileScreen({ navigation }: Props) {
  const { session, updateProfile } = usePomagaMY()
  const sessionRef = useRef(session)
  sessionRef.current = session

  const [displayName, setDisplayName] = useState(session?.displayName ?? '')
  const [phone, setPhone] = useState(session?.phone ?? '')
  const [city, setCity] = useState(session?.city ?? '')
  const [about, setAbout] = useState(session?.about ?? '')
  const [orgName, setOrgName] = useState(session?.organizationName ?? '')
  const [orgNip, setOrgNip] = useState(session?.orgNip ?? '')
  const [orgKrs, setOrgKrs] = useState(session?.orgKrs ?? '')
  const [statutAsset, setStatutAsset] = useState<{
    uri: string
    name: string
    mimeType?: string | null
  } | null>(null)
  const [avatarUriDraft, setAvatarUriDraft] = useState(session?.avatarUri ?? '')
  const [interestsDraft, setInterestsDraft] = useState<string[]>(session?.interests ?? [])

  useFocusEffect(
    useCallback(() => {
      const s = sessionRef.current
      if (!s) return
      setDisplayName(s.displayName)
      setPhone(s.phone)
      setCity(s.city ?? '')
      setAbout(s.about ?? '')
      setOrgName(s.organizationName ?? '')
      setOrgNip(s.orgNip ?? '')
      setOrgKrs(s.orgKrs ?? '')
      setStatutAsset(null)
      setAvatarUriDraft(s.avatarUri ?? '')
      setInterestsDraft(s.role === 'volunteer' ? [...(s.interests ?? [])] : [])
    }, []),
  )

  if (!session) return null

  const isVolunteer = session.role === 'volunteer'
  const initials = session.displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  const pickAvatar = async () => {
    try {
      const ImagePicker = tryLoadImagePicker()
      if (
        !ImagePicker ||
        typeof ImagePicker.requestMediaLibraryPermissionsAsync !== 'function' ||
        typeof ImagePicker.launchImageLibraryAsync !== 'function'
      ) {
        Alert.alert(
          'Zdjęcie z galerii — przebudowa aplikacji',
          'Obecna instalacja nie ma modułu galerii (ExponentImagePicker). Odinstaluj PomagaMY z telefonu/emulatora, potem w folderze „mobile” uruchom:\n\nnpx expo run:android\n\nPo instalacji nowego APK uruchom: npm start i otwórz aplikację z ikony PomagaMY (dev client).',
        )
        return
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Dostęp', 'Aby wybrać zdjęcie, zezwól na dostęp do galerii w ustawieniach telefonu.')
        return
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      })
      if (!res.canceled && res.assets[0]?.uri) {
        setAvatarUriDraft(res.assets[0].uri)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (
        msg.includes('ExponentImagePicker') ||
        msg.includes('native module') ||
        msg.includes('Native module') ||
        msg.includes('Cannot find native module')
      ) {
        Alert.alert(
          'Zdjęcie — przebudowa aplikacji',
          'Odinstaluj aplikację z urządzenia i zbuduj ponownie: w folderze „mobile” → npx expo run:android. Expo Go nie zastąpi własnego dev builda z expo-image-picker.',
        )
        return
      }
      Alert.alert('Galeria', msg || 'Nie udało się otworzyć galerii.')
    }
  }

  const clearAvatar = () => setAvatarUriDraft('')

  const toggleInterest = (tag: string) => {
    setInterestsDraft((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const pickStatut = async () => {
    try {
      const DocumentPicker = await import('expo-document-picker')
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
      })
      if (res.canceled) return
      const asset = res.assets?.[0]
      if (!asset?.uri) return
      const maxBytes = 15 * 1024 * 1024
      if (asset.size != null && asset.size > maxBytes) {
        Alert.alert('Plik za duży', 'Maksymalny rozmiar statutu to 15 MB.')
        return
      }
      setStatutAsset({
        uri: asset.uri,
        name: asset.name ?? 'statut',
        mimeType: asset.mimeType ?? null,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (/native module|ExpoDocumentPicker|cannot find/i.test(msg)) {
        Alert.alert(
          'Przebuduj aplikację (Android)',
          'Moduł wyboru dokumentów wymaga ponownego zbudowania aplikacji natywnej.\n\nW folderze mobile uruchom:\n\nnpx expo run:android',
        )
        return
      }
      Alert.alert('Błąd', 'Nie udało się wybrać pliku.')
    }
  }

  const onSave = async () => {
    if (session.role === 'organization') {
      const nipErr = nipValidationError(orgNip)
      const krsErr = krsValidationErrorOptional(orgKrs)
      if (nipErr) {
        Alert.alert('NIP', nipErr)
        return
      }
      if (krsErr) {
        Alert.alert('KRS', krsErr)
        return
      }
      const hasStatut = Boolean(statutAsset?.uri || session.orgStatutUrl || session.orgStatutLabel)
      if (!ORG_REGISTRATION_STATUT_OPTIONAL && !hasStatut) {
        Alert.alert('Statut', 'Dołącz plik statutu (PDF lub zdjęcie), aby administrator mógł zweryfikować organizację.')
        return
      }
    }
    const base = {
      displayName: displayName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      about: about.trim(),
      ...(session.role === 'organization'
        ? {
            organizationName: orgName.trim(),
            organizationNip: orgNip,
            organizationKrs: orgKrs,
            ...(statutAsset ? { statutAsset } : {}),
          }
        : {}),
      ...(isVolunteer ? { interests: [...interestsDraft] } : {}),
    }
    const hadAvatar = Boolean(session.avatarUri)
    const draft = avatarUriDraft.trim()
    let avatarUri: string | null | undefined = undefined
    if (draft === '') {
      if (hadAvatar) avatarUri = null
    } else if (draft !== session.avatarUri) {
      avatarUri = draft
    }
    try {
      await updateProfile({
        ...base,
        ...(avatarUri !== undefined ? { avatarUri } : {}),
      })
      Alert.alert('Zapisano', 'Profil został zaktualizowany.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      Alert.alert(
        'Nie zapisano profilu',
        msg.includes('permission') || msg.includes('PERMISSION_DENIED')
          ? 'Brak uprawnień do zapisu profilu. Sprawdź ustawienia konta lub skontaktuj się z pomocą.'
          : msg || 'Spróbuj ponownie.',
      )
    }
  }

  const headerTitle = isVolunteer ? 'Edytowanie profilu' : 'Edytuj profil'

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title={headerTitle} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {isVolunteer ? (
          <>
            <View style={styles.heroPhoto}>
              <ProfileAvatarCircle
                uri={avatarUriDraft.trim() || undefined}
                initials={initials}
                size={120}
                onPress={pickAvatar}
              />
              <Pressable style={styles.changePhotoBtn} onPress={() => void pickAvatar()}>
                <Text style={styles.changePhotoBtnText}>Zmień</Text>
              </Pressable>
              {(avatarUriDraft.trim() || session.avatarUri) && (
                <Pressable style={styles.removePhotoLink} onPress={clearAvatar}>
                  <Text style={styles.removePhotoLinkText}>Usuń zdjęcie</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.label}>Imię i nazwisko</Text>
            <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />

            <Text style={styles.label}>Email kontaktowy</Text>
            <View style={[styles.input, styles.inputReadonly]}>
              <Text style={styles.readonlyText}>{session.email}</Text>
            </View>

            <Text style={styles.label}>Telefon</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <Text style={styles.label}>Miasto</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} />

            <Text style={styles.label}>O mnie</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={about}
              onChangeText={setAbout}
              multiline
              placeholder="Opisz siebie i swoje zainteresowania…"
            />

            <Text style={styles.label}>Zainteresowania</Text>
            <View style={styles.chipWrap}>
              {VOLUNTEER_INTEREST_OPTIONS.map((tag) => {
                const on = interestsDraft.includes(tag)
                return (
                  <Pressable key={tag} onPress={() => toggleInterest(tag)} style={[styles.chip, on && styles.chipOn]}>
                    <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{tag}</Text>
                  </Pressable>
                )
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.photoLabel}>Logo / zdjęcie organizacji</Text>
            <View style={styles.photoRow}>
              <ProfileAvatarCircle
                uri={avatarUriDraft.trim() || undefined}
                initials={initials}
                size={100}
                onPress={pickAvatar}
              />
              <View style={styles.photoActions}>
                <Pressable style={styles.secondaryBtn} onPress={() => void pickAvatar()}>
                  <Text style={styles.secondaryBtnText}>Wybierz z galerii</Text>
                </Pressable>
                {(avatarUriDraft.trim() || session.avatarUri) && (
                  <Pressable style={styles.ghostBtn} onPress={clearAvatar}>
                    <Text style={styles.ghostBtnText}>Usuń zdjęcie</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Text style={styles.hint}>Dotknij koła, aby zmienić obraz.</Text>

            <>
              <Text style={styles.label}>Nazwa organizacji</Text>
              <TextInput style={styles.input} value={orgName} onChangeText={setOrgName} />
            </>
            <Text style={styles.label}>NIP organizacji</Text>
            <TextInput
              style={styles.input}
              value={orgNip}
              onChangeText={setOrgNip}
              keyboardType="number-pad"
              placeholder="10 cyfr"
            />
            <Text style={styles.label}>KRS (opcjonalnie)</Text>
            <TextInput
              style={styles.input}
              value={orgKrs}
              onChangeText={setOrgKrs}
              keyboardType="number-pad"
              placeholder="9–10 cyfr, jeśli dotyczy"
            />
            <Text style={styles.label}>
              {ORG_REGISTRATION_STATUT_OPTIONAL ? 'Statut — PDF lub zdjęcie (opcjonalnie)' : 'Statut — PDF lub zdjęcie'}
            </Text>
            <Pressable style={styles.statutBtn} onPress={() => void pickStatut()}>
              <Text style={styles.statutBtnText}>
                {statutAsset?.name ??
                  session.orgStatutLabel ??
                  (ORG_REGISTRATION_STATUT_OPTIONAL ? 'Wybierz plik statutu (max 15 MB)' : 'Wybierz plik statutu (max 15 MB)')}
              </Text>
            </Pressable>
            {session.orgStatutUrl && !statutAsset ? (
              <Text style={styles.hint}>Obecny dokument: {session.orgStatutLabel ?? 'Statut organizacji'} (zapisany w chmurze)</Text>
            ) : null}
            <Text style={styles.label}>Imię i nazwisko / nazwa</Text>
            <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
            <Text style={styles.label}>Telefon</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Text style={styles.label}>Miasto</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} />
            <Text style={styles.label}>O organizacji</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={about}
              onChangeText={setAbout}
              multiline
              placeholder="Opisz działalność organizacji…"
            />
          </>
        )}

        <Pressable style={styles.btnSave} onPress={() => void onSave()}>
          <Text style={styles.btnSaveText}>{isVolunteer ? 'Zapisz zmiany' : 'Zapisz'}</Text>
        </Pressable>
        {isVolunteer ? (
          <Pressable style={styles.btnCancel} onPress={() => navigation.goBack()}>
            <Text style={styles.btnCancelText}>Anuluj</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  heroPhoto: { alignItems: 'center', marginBottom: spacing.lg },
  changePhotoBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  changePhotoBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  removePhotoLink: { marginTop: spacing.sm, padding: spacing.sm },
  removePhotoLinkText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  photoLabel: { fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  photoActions: { flex: 1, gap: spacing.sm },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '800' },
  ghostBtn: { paddingVertical: 8, alignItems: 'center' },
  ghostBtnText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 17 },
  label: { fontWeight: '700', marginBottom: 6, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    fontSize: 16,
    color: colors.text,
  },
  inputReadonly: { justifyContent: 'center' },
  readonlyText: { color: colors.textMuted, fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.chipInactiveBg,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  chipLabelOn: { color: '#fff' },
  btnSave: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnSaveText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  btnCancel: {
    marginTop: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  btnCancelText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  statutBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
  },
  statutBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
})
