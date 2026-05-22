import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { AuthHeader } from '../components/AuthHeader'
import { usePomagaMY } from '../context/PomagaMYContext'
import { isFirebaseConfigured } from '../firebase/env'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'
import type { UserRole } from '../types/mvp'
import { ORG_REGISTRATION_STATUT_OPTIONAL } from '../config/featureFlags'
import { isPlausibleKrs, nipValidationError, normalizeKrsInput } from '../utils/polishOrgIds'

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>

const accountTypes = ['Wolontariusz', 'Organizacja'] as const

export function RegisterScreen({ navigation }: Props) {
  const { register } = usePomagaMY()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [accountType, setAccountType] = useState<string | null>(null)
  const [terms, setTerms] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [orgNip, setOrgNip] = useState('')
  const [orgKrs, setOrgKrs] = useState('')
  const [statutAsset, setStatutAsset] = useState<{
    uri: string
    name: string
    mimeType?: string | null
  } | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [busy, setBusy] = useState(false)

  const role: UserRole | null =
    accountType === 'Wolontariusz' ? 'volunteer' : accountType === 'Organizacja' ? 'organization' : null

  const pickStatut = async () => {
    try {
      /** Dynamiczny import — inaczej stary dev build bez natywnego kodu wywala całą aplikację przy starcie. */
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

  const onSubmit = async () => {
    if (!role) {
      Alert.alert('Typ konta', 'Wybierz Wolontariusz lub Organizację.')
      return
    }
    if (password !== password2) {
      Alert.alert('Hasło', 'Hasła muszą być identyczne.')
      return
    }
    if (role === 'organization') {
      const nipErr = nipValidationError(orgNip)
      const krsClean = normalizeKrsInput(orgKrs)
      if (nipErr) {
        Alert.alert('NIP', nipErr)
        return
      }
      if (!isPlausibleKrs(krsClean)) {
        Alert.alert('KRS', 'Podaj poprawny numer KRS (9–10 cyfr).')
        return
      }
      if (!ORG_REGISTRATION_STATUT_OPTIONAL && !statutAsset?.uri) {
        Alert.alert(
          'Statut',
          'Załącz dokument statutu organizacji (PDF lub zdjęcie JPG/PNG). Administrator potrzebuje go do weryfikacji.',
        )
        return
      }
    }
    setBusy(true)
    try {
      const res = await register({
        email: email.trim(),
        password,
        role,
        displayName: displayName.trim(),
        phone: phone.trim(),
        organizationName: role === 'organization' ? organizationName.trim() : undefined,
        organizationNip: role === 'organization' ? orgNip : undefined,
        organizationKrs: role === 'organization' ? orgKrs : undefined,
        statutAsset: role === 'organization' ? statutAsset : undefined,
      })
      if (!res.ok) {
        Alert.alert('Rejestracja', res.message)
        return
      }
      navigation.replace('Main')
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title="Rejestracja" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Typ konta</Text>
        <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
          <Text style={accountType ? styles.selectValue : styles.selectPlaceholder}>
            {accountType ?? 'Wybierz typ konta'}
          </Text>
          <Text style={styles.chev}>⌄</Text>
        </Pressable>

        {role === 'organization' && (
          <>
            <Text style={styles.hint}>
              {isFirebaseConfigured()
                ? 'Podaj nazwę, która będzie widoczna przy ogłoszeniach i w kontakcie z wolontariuszami.'
                : 'Użyj tej samej nazwy co przy ogłoszeniach w aplikacji, żeby powiązać konto z ich obsługą.'}
            </Text>
            <Text style={styles.label}>Nazwa organizacji</Text>
            <TextInput
              style={styles.input}
              placeholder="np. Bank Żywności Kraków"
              placeholderTextColor={colors.textLight}
              value={organizationName}
              onChangeText={setOrganizationName}
            />

            <Text style={styles.label}>NIP organizacji</Text>
            <TextInput
              style={styles.input}
              placeholder="10 cyfr (bez lub z myślnikami)"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={orgNip}
              onChangeText={setOrgNip}
            />

            <Text style={styles.label}>Numer KRS</Text>
            <TextInput
              style={styles.input}
              placeholder="np. 0000123456"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              value={orgKrs}
              onChangeText={setOrgKrs}
            />

            <Text style={styles.label}>
              {ORG_REGISTRATION_STATUT_OPTIONAL
                ? 'Statut — plik PDF lub zdjęcie (opcjonalnie)'
                : 'Statut — plik PDF lub zdjęcie'}
            </Text>
            <Pressable style={styles.statutBtn} onPress={() => void pickStatut()}>
              <Ionicons name="attach-outline" size={22} color={colors.primary} />
              <Text style={styles.statutBtnText}>
                {statutAsset?.name ??
                  (ORG_REGISTRATION_STATUT_OPTIONAL
                    ? 'Dodaj statut później lub wybierz plik (max 15 MB)'
                    : 'Wybierz plik statutu (max 15 MB)')}
              </Text>
            </Pressable>
            <Text style={styles.docHint}>
              {ORG_REGISTRATION_STATUT_OPTIONAL
                ? 'Tymczasowo możesz zarejestrować organizację bez pliku. NIP i KRS trafią do administratora; statut możesz dosłać przed weryfikacją.'
                : 'Dane NIP, KRS i dokument statutu trafią do administratora w celu weryfikacji konta.'}
            </Text>
          </>
        )}

        <Text style={styles.label}>
          {role === 'organization' ? 'Osoba kontaktowa (imię i nazwisko)' : 'Imię i nazwisko'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Jan Kowalski"
          placeholderTextColor={colors.textLight}
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="+48 123 456 789"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Hasło (min. 8 znaków, litera, cyfra, znak specjalny)</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Powtórz hasło</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          placeholderTextColor={colors.textLight}
          value={password2}
          onChangeText={setPassword2}
        />

        <Pressable
          style={styles.checkRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: terms }}
          onPress={() => setTerms((t) => !t)}
        >
          <View style={[styles.checkbox, terms && styles.checkboxOn]}>
            {terms ? <Ionicons name="checkmark" size={17} color="#FFFFFF" /> : null}
          </View>
          <Text style={styles.checkText}>Akceptuję regulamin i politykę prywatności</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, (!terms || busy) && styles.btnDisabled]}
          disabled={!terms || busy}
          onPress={() => void onSubmit()}
        >
          <Text style={styles.btnText}>{busy ? 'Tworzenie konta…' : 'Zarejestruj się'}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalBox}>
            {accountTypes.map((t) => (
              <Pressable
                key={t}
                style={styles.modalItem}
                onPress={() => {
                  setAccountType(t)
                  setPickerOpen(false)
                  if (t !== 'Organizacja') {
                    setOrgNip('')
                    setOrgKrs('')
                    setStatutAsset(null)
                  }
                }}
              >
                <Text style={styles.modalItemText}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  label: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  selectPlaceholder: { color: colors.textLight, fontSize: 16 },
  selectValue: { color: colors.text, fontSize: 16 },
  chev: { fontSize: 18, color: colors.textMuted },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  statutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    marginBottom: spacing.xs,
  },
  statutBtnText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    color: colors.text,
  },
  docHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary },
  checkText: { flex: 1, color: colors.text, fontSize: 14 },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  modalItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: { fontSize: 17, color: colors.text },
})
