import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import type { HomeStackParamList, RootStackParamList } from '../navigation/types'
import { getOgloszenieFromAll } from '../data/ogloszenia'
import { normalizeOgloszenieKategoria } from '../data/ogloszeniaKategorie'
import { formatKrsForDisplay, formatNipForDisplay } from '../utils/polishOrgIds'
import { AuthHeader } from '../components/AuthHeader'
import { usePomagaMY } from '../context/PomagaMYContext'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = NativeStackScreenProps<HomeStackParamList, 'OgloszenieDetail'>

function useRootNavigation(): NativeStackNavigationProp<RootStackParamList> {
  const nav = useNavigation()
  let p: typeof nav | undefined = nav
  while (p?.getParent()) p = p.getParent()
  return p as unknown as NativeStackNavigationProp<RootStackParamList>
}

export function OgloszenieDetailScreen({ navigation, route }: Props) {
  const { id } = route.params
  const rootNav = useRootNavigation()
  const { allOgloszenia, session, mvp, submitApplication } = usePomagaMY()
  const o = getOgloszenieFromAll(id, allOgloszenia)

  const myApp = session
    ? mvp.applications.find(
        (a) => a.ogloszenieId === id && a.volunteerEmail === session.email && a.status !== 'zakończone',
      )
    : undefined

  const myEndedApplication =
    session?.role === 'volunteer'
      ? mvp.applications.find(
          (a) =>
            a.ogloszenieId === id && a.volunteerEmail === session.email && a.status === 'zakończone',
        )
      : undefined

  if (!o) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Nie znaleziono ogłoszenia.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Wróć</Text>
        </Pressable>
      </View>
    )
  }

  const hasOrgLegalIds = !!(o.organizerNip?.trim() || o.organizerKrs?.trim())

  const onApply = async () => {
    if (!session) {
      Alert.alert('Zaloguj się, aby pomóc', 'Musisz mieć konto wolontariusza, aby zgłosić chęć udziału.', [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Zaloguj', onPress: () => rootNav.navigate('Login') },
      ])
      return
    }
    if (session.role !== 'volunteer') {
      Alert.alert('Zgłoszenie', 'Tylko konto wolontariusza może zgłaszać chęć udziału w tym zadaniu.')
      return
    }
    const res = await submitApplication(o)
    if (!res.ok) {
      Alert.alert('Zgłoszenie', res.message)
      return
    }
    Alert.alert('Wysłano', 'Twoje zgłoszenie trafiło do organizacji. Śledź status w Wiadomościach i Profilu.')
  }

  return (
    <View style={styles.root}>
      <AuthHeader title="Szczegóły ogłoszenia" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{o.tytul}</Text>
          <Text style={styles.heroSub}>
            🏢 {o.organizacja} • 📍 {o.lokalizacja.split(' ')[0]}
          </Text>
        </View>

        {hasOrgLegalIds ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dane organizacji (weryfikacja)</Text>
            <Text style={styles.refHint}>
              NIP i KRS pochodzą z informacji podanych przy rejestracji organizacji (stan na moment dodania ogłoszenia).
              Nie zastępują oficjalnej weryfikacji — warto sprawdzić wpis w publicznych rejestrach (np. CEIDG lub KRS).
            </Text>
            {o.organizerNip?.trim() ? (
              <DetailRow
                label="NIP"
                value={formatNipForDisplay(o.organizerNip)}
                last={!o.organizerKrs?.trim()}
              />
            ) : null}
            {o.organizerKrs?.trim() ? (
              <DetailRow label="KRS" value={formatKrsForDisplay(o.organizerKrs)} last />
            ) : null}
          </View>
        ) : session?.role === 'volunteer' ? (
          <View style={[styles.section, styles.softBox]}>
            <Text style={styles.softTitle}>Organizacja</Text>
            <Text style={[styles.refHint, styles.refHintFlush]}>
              Przy tym ogłoszeniu nie ma zapisanego NIP ani KRS (np. starsze ogłoszenie). Możesz zapytać organizację o
              dane lub zgłosić problem przez skargę w aplikacji.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Opis</Text>
            <View style={styles.idTag}>
              <Text style={styles.idTagText}>#{o.kod}</Text>
            </View>
          </View>
          <Text style={styles.refHint}>
            Kod ogłoszenia przy # — możesz wpisać go w skardze z prefiksem OG- albo same cyfry. W profilu znajdziesz też numer konta W- lub O-.
          </Text>
          {session ? (
            <Pressable
              style={styles.reportLink}
              onPress={() => rootNav.navigate('ReportComplaint', { refTargetId: o.kod })}
            >
              <Text style={styles.reportLinkText}>Zgłoś skargę dotyczącą tego ogłoszenia</Text>
            </Pressable>
          ) : null}
          <Text style={styles.body}>{o.opis}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Szczegóły</Text>
          <DetailRow label="Data" value={o.data} />
          <DetailRow label="Godziny" value={o.godziny} />
          <DetailRow label="Liczba wolontariuszy" value={o.liczbaWolontariuszy} />
          <DetailRow label="Kategoria" value={normalizeOgloszenieKategoria(o.kategoria)} />
          <DetailRow label="Stan ogłoszenia" value={o.status} last />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wymagania</Text>
          {o.wymagania.map((line: string) => (
            <Text key={line} style={styles.bullet}>
              • {line}
            </Text>
          ))}
        </View>

        {myApp ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Twoje zgłoszenie</Text>
            <Text style={styles.statusValue}>{myApp.status}</Text>
          </View>
        ) : myEndedApplication ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Twój udział</Text>
            <Text style={styles.statusValue}>{myEndedApplication.status}</Text>
            <Text style={styles.statusHint}>
              {o.status === 'Zakończone'
                ? 'Organizacja zakończyła to ogłoszenie lub potwierdziła realizację u wszystkich aktywnych zgłoszeń.'
                : 'Ogłoszenie jest nadal widoczne, ale dla Ciebie to zadanie zostało domknięte.'}
            </Text>
          </View>
        ) : (!session || session.role === 'volunteer') && o.status === 'Zakończone' ? (
          <View style={[styles.statusBox, styles.statusBoxMuted]}>
            <Text style={styles.statusClosedTitle}>Ogłoszenie zamknięte</Text>
            <Text style={styles.statusHint}>Nie przyjmujemy już nowych zgłoszeń na to zadanie.</Text>
          </View>
        ) : (
          <Pressable style={styles.cta} onPress={() => void onApply()}>
            <Text style={styles.ctaText}>Zgłoś się do zadania</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: spacing.sm },
  heroSub: { color: '#fff', fontSize: 15, opacity: 0.95 },
  section: { marginBottom: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  idTag: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  idTagText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  refHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  reportLink: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    paddingVertical: 6,
  },
  reportLinkText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  body: { color: colors.textMuted, lineHeight: 24, fontSize: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, flex: 1 },
  rowValue: { color: colors.text, fontWeight: '700', flex: 1, textAlign: 'right' },
  bullet: { color: colors.textMuted, lineHeight: 26, fontSize: 15 },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  statusBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  statusLabel: { color: colors.textMuted, fontSize: 13 },
  statusValue: { fontWeight: '800', fontSize: 18, color: colors.primary, marginTop: 4 },
  statusHint: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 19 },
  statusClosedTitle: { fontWeight: '800', fontSize: 16, color: colors.text },
  statusBoxMuted: { backgroundColor: colors.background, opacity: 0.95 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  fallbackText: { marginBottom: spacing.md, color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '700' },
  softBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  softTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  refHintFlush: { marginBottom: 0 },
})
