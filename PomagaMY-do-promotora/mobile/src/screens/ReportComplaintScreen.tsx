import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import type { RootStackParamList } from '../navigation/types'
import { AuthHeader } from '../components/AuthHeader'
import { getComplaintsHotline } from '../config/supportContact'
import { usePomagaMY } from '../context/PomagaMYContext'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'
import { getFirebaseAuth } from '../firebase/client'
import { fetchUserRole } from '../firebase/adminAuth'
import { isFirebaseConfigured } from '../firebase/env'
import { isValidComplaintTargetId, normalizeComplaintTargetId, resolveComplaintTargetId } from '../utils/publicIds'

const categories = ['Nieodpowiednie ogłoszenie', 'Zachowanie użytkownika', 'Nieuczciwa ocena', 'Inne'] as const

type Props = NativeStackScreenProps<RootStackParamList, 'ReportComplaint'>

export function ReportComplaintScreen({ navigation, route }: Props) {
  const { fileComplaint, session } = usePomagaMY()
  const hotline = getComplaintsHotline()
  const initialTarget = useMemo(() => {
    const raw = route.params?.refTargetId ?? route.params?.ogloszenieKod ?? ''
    const n = normalizeComplaintTargetId(raw)
    const r = resolveComplaintTargetId(raw)
    return isValidComplaintTargetId(r) ? r : n
  }, [route.params?.refTargetId, route.params?.ogloszenieKod])

  const [category, setCategory] = useState<string>(categories[0])
  const [description, setDescription] = useState('')
  const [refTargetId, setRefTargetId] = useState(initialTarget)
  const [reporterLabel, setReporterLabel] = useState('')

  const [blockedAsAdmin, setBlockedAsAdmin] = useState<'unknown' | 'yes' | 'no'>(
    () => (!isFirebaseConfigured() ? 'no' : 'unknown'),
  )

  useEffect(() => {
    setRefTargetId(initialTarget)
  }, [initialTarget])

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setBlockedAsAdmin('no')
      return
    }
    const auth = getFirebaseAuth()
    let cancelled = false
    const check = async (uid: string | undefined) => {
      if (!uid) {
        if (!cancelled) setBlockedAsAdmin('no')
        return
      }
      try {
        const role = await fetchUserRole(uid)
        if (!cancelled) setBlockedAsAdmin(role === 'admin' ? 'yes' : 'no')
      } catch {
        if (!cancelled) setBlockedAsAdmin('no')
      }
    }
    void check(auth.currentUser?.uid)
    const unsub = onAuthStateChanged(auth, (u) => void check(u?.uid ?? undefined))
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setReporterLabel(session?.email?.trim() ?? '')
      return
    }
    const auth = getFirebaseAuth()
    const sync = (): void => {
      const u = auth.currentUser
      const mail = u?.email?.trim() || session?.email?.trim()
      const label = mail || (u?.uid ? `Konto (${u.uid.slice(0, 8)}…)` : '')
      setReporterLabel(label)
    }
    sync()
    return onAuthStateChanged(auth, sync)
  }, [session?.email])

  const onSend = async () => {
    if (blockedAsAdmin === 'yes') return
    if (description.trim().length < 8) {
      Alert.alert('Opis', 'Opisz zgłoszenie (min. kilka znaków).')
      return
    }
    const resolved = resolveComplaintTargetId(refTargetId)
    if (!isValidComplaintTargetId(resolved)) {
      Alert.alert(
        'Identyfikator',
        'Wpisz numer widoczny w aplikacji: W- lub O- (wolontariusz / organizacja), Z- (zgłoszenie), OG- lub same cyfry z kodu ogłoszenia, albo ORG- (rekord organizacji w panelu), np. 362 lub OG-362, W-A1B2C3d4.',
      )
      return
    }

    try {
      await fileComplaint({
        category,
        description: description.trim(),
        refTargetId: resolved,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Zapis skargi nie powiódł się. Sprawdź internet i spróbuj ponownie.'
      Alert.alert('Skarga', msg)
      return
    }

    Alert.alert(
      'Dziękujemy',
      'Zgłoszenie zostało zapisane. Potwierdzenie znajdziesz w zakładce Wiadomości. Administrator rozpatrzy sprawę.',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    )
  }

  if (blockedAsAdmin === 'unknown') {
    return (
      <View style={[styles.root, styles.policyCenter]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.policyMuted, { marginTop: spacing.md }]}>Sprawdzanie dostępu…</Text>
      </View>
    )
  }

  if (blockedAsAdmin === 'yes') {
    return (
      <View style={styles.root}>
        <AuthHeader title="Zgłoś skargę" onBack={() => navigation.goBack()} />
        <View style={styles.policyBody}>
          <Text style={styles.policyTitle}>Formularz niedostępny dla administratora</Text>
          <Text style={styles.policyMuted}>
            Konto administratora nie składa skarg w aplikacji. Przegląd zgłoszeń jest w zakładce Skargi w panelu
            admina.
          </Text>
          <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Wróć</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title="Zgłoś skargę" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {hotline ? (
          <View style={styles.hotlineCard}>
            <Text style={styles.hotlineTitle}>Telefon do skarg (infolinia)</Text>
            <Text style={styles.hotlineBody}>
              Możesz zadzwonić lub wypełnić formularz poniżej — obie ścieżki są dla administratora.
            </Text>
            <Pressable
              onPress={() => void Linking.openURL(hotline.telUrl)}
              style={styles.hotlineBtn}
            >
              <Text style={styles.hotlineBtnText}>{hotline.display}</Text>
            </Pressable>
          </View>
        ) : null}
        {reporterLabel ? (
          <View style={styles.reporterBadge}>
            <Text style={styles.reporterBadgeText}>
              Dane zapisane jako zgłaszający (automatycznie){'\n'}
              <Text style={styles.reporterEmail}>{reporterLabel}</Text>
            </Text>
          </View>
        ) : null}
        <Text style={styles.hint}>
          Wpisz jeden identyfikator — numer konta wolontariusza lub organizacji (W-/O-), kod zgłoszenia Z-, kod ogłoszenia
          OG- lub same cyfry jak przy # ogłoszenia, ewentualnie ORG- z panelu org.
        </Text>
        <Text style={styles.label}>Kategoria</Text>
        <View style={styles.catRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[styles.catChip, category === c && styles.catChipOn]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.catChipText, category === c && styles.catChipTextOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Temat skargi (jeden wpis)</Text>
        <TextInput
          style={styles.input}
          value={refTargetId}
          onChangeText={setRefTargetId}
          placeholder="np. 362 lub W-X7Y8… albo ORG-892"
          autoCapitalize="characters"
        />
        <Text style={styles.label}>Opis</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Opisz sytuację…"
        />
        <Pressable style={styles.btn} onPress={() => void onSend()}>
          <Text style={styles.btnText}>Wyślij zgłoszenie</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  policyCenter: { justifyContent: 'center', alignItems: 'center' },
  policyBody: { padding: spacing.lg, paddingTop: spacing.xl },
  policyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  policyMuted: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  hotlineCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  hotlineTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  hotlineBody: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
  hotlineBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  hotlineBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  reporterBadge: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  reporterBadgeText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  reporterEmail: { fontWeight: '700', color: colors.text },
  hint: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  label: { fontWeight: '700', marginBottom: 6, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    fontSize: 16,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  catChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  catChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 12, color: colors.text },
  catChipTextOn: { color: '#fff', fontWeight: '700' },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
})
