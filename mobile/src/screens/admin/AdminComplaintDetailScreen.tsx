import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthHeader } from '../../components/AuthHeader'
import { skargiAdmin } from '../../data/adminMock'
import {
  complaintEffectiveModeration,
  fetchComplaintDocumentForAdmin,
  findUserUidByAccountPublicId,
  firebaseSetAccountSuspendedAdmin,
  firebaseSetComplaintModerationAdmin,
} from '../../firebase/adminFirestore'
import { isFirebaseConfigured } from '../../firebase/env'
import type { AdminMainStackParamList } from '../../navigation/types'
import type { Complaint, ComplaintModerationStatus } from '../../types/mvp'
import { colors } from '../../theme/colors'
import { normalizeComplaintTargetId } from '../../utils/publicIds'
import { radius, spacing } from '../../theme/spacing'

type Props = NativeStackScreenProps<AdminMainStackParamList, 'AdminComplaintDetail'>

function formatPlDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function moderationLabel(s: ComplaintModerationStatus): string {
  if (s === 'resolved') return 'Rozpatrzona'
  if (s === 'rejected') return 'Odrzucona'
  return 'Oczekuje na decyzję'
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

function targetLooksLikeVolunteerOrgAccount(pid: string): boolean {
  const t = normalizeComplaintTargetId(pid)
  return /^(W|O)-[A-Z0-9]+$/.test(t)
}

export function AdminComplaintDetailScreen({ navigation, route }: Props) {
  const params = route.params
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(params.mode === 'firebase')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const firebaseComplaintId = params.mode === 'firebase' ? params.complaintId : ''

  const reloadFirestore = useCallback(async () => {
    if (params.mode !== 'firebase') return
    const c = await fetchComplaintDocumentForAdmin(firebaseComplaintId)
    if (c) setComplaint(c)
  }, [params.mode, firebaseComplaintId])

  useEffect(() => {
    let alive = true
    if (params.mode === 'mock') {
      const m = skargiAdmin.find((s) => s.id === params.mockId)
      if (!m) {
        setErr('Nie znaleziono wpisu demonstracyjnego.')
        setLoading(false)
        return
      }
      setComplaint({
        id: m.id,
        category: m.tytul,
        description:
          '(Tryb demonstracyjny — brak treści zapytania.) Zgłaszający: ' +
          `${m.zglaszajacy}. Data wg listy: ${m.data}. Status: ${m.status}. Kod: ${m.kod}.`,
        refTargetId: m.kod,
        createdAt: new Date().toISOString(),
        reporterEmail: m.zglaszajacy,
      })
      setLoading(false)
      return
    }

    if (!isFirebaseConfigured()) {
      setErr('Firebase jest wyłączony.')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const c = await fetchComplaintDocumentForAdmin(firebaseComplaintId)
        if (!alive) return
        if (!c) setErr('Nie znaleziono dokumentu skargi w bazie.')
        else setComplaint(c)
      } catch {
        if (alive) setErr('Nie udało się wczytać skargi. Sprawdź uprawnienia i sieć.')
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [params])

  const runAdminAction = async (title: string, fn: () => Promise<void>): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      await fn()
      await reloadFirestore()
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Operacja się nie powiodła. Spróbuj ponownie.'
      Alert.alert(title, msg)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (err || !complaint) {
    return (
      <View style={styles.root}>
        <AuthHeader title="Skarga" onBack={() => navigation.goBack()} />
        <View style={styles.pad}>
          <Text style={styles.errText}>{err ?? 'Brak danych.'}</Text>
        </View>
      </View>
    )
  }

  const c = complaint
  const eff = complaintEffectiveModeration(c)
  const mockNote = params.mode === 'mock' ? ' Lista demonstracyjna (bez Firebase).' : ''

  const onSetModeration = (status: ComplaintModerationStatus) => {
    if (params.mode !== 'firebase') return
    const title =
      status === 'pending'
        ? 'Przywrócić status «oczekująca»?'
        : status === 'resolved'
          ? 'Oznaczyć jako rozpatrzoną?'
          : 'Oznaczyć jako odrzuconą?'
    Alert.alert(title, 'Zmiana będzie widoczna w liście skarg.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Potwierdź',
        onPress: () =>
          void runAdminAction('Status skargi', async () =>
            firebaseSetComplaintModerationAdmin(firebaseComplaintId, status),
          ),
      },
    ])
  }

  const onSuspendReporter = () => {
    if (params.mode !== 'firebase' || !c.reporterUid) {
      Alert.alert('Blokada', 'Brak UID zgłaszającego w dokumencie skargi.')
      return
    }
    Alert.alert(
      'Zablokować konto zgłaszającego?',
      'Użytkownik nie zaloguje się do aplikacji (z wyjątkiem roli administratora).',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Zablokuj',
          style: 'destructive',
          onPress: () =>
            void runAdminAction('Blokada konta', async () =>
              firebaseSetAccountSuspendedAdmin(c.reporterUid!, true),
            ),
        },
      ],
    )
  }

  const onSuspendTargetAccount = () => {
    if (params.mode !== 'firebase') return
    const ref = normalizeComplaintTargetId(c.refTargetId)
    if (!targetLooksLikeVolunteerOrgAccount(ref)) {
      Alert.alert(
        'Cel skargi',
        'Blokada po numerze konta jest dostępna dopiero przy identyfikatorze typu W-… lub O-….',
      )
      return
    }
    Alert.alert(
      'Zablokować zgłoszone konto?',
      `Wyszukamy użytkownika po „${ref}” (pole „accountPublicId” w dokumentach użytkowników) i ustawimy blokadę logowania.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Szukaj i zablokuj',
          style: 'destructive',
          onPress: () =>
            void runAdminAction('Blokada wg numeru konta', async () => {
              const found = await findUserUidByAccountPublicId(ref)
              if (!found) {
                throw new Error(
                  'Nie znaleziono dopasowania w bazie. Konto mogło zostać utworzone przed dopisaniem numeru lub identyfikator jest inny.',
                )
              }
              if (c.reporterUid && found.uid === c.reporterUid) {
                throw new Error(
                  'Cel pokrywa się ze zgłaszającym — użyj przycisku blokady zgłaszającego lub zweryfikuj identyfikator.',
                )
              }
              await firebaseSetAccountSuspendedAdmin(found.uid, true)
            }),
        },
      ],
    )
  }

  return (
    <View style={styles.root}>
      <AuthHeader title={`Skarga • ${c.refTargetId || c.id.slice(0, 8)}`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>{c.category}</Text>
        {mockNote ? <Text style={styles.mockBanner}>{mockNote.trim()}</Text> : null}
        <Row label="Id dokumentu Firestore" value={c.id} />
        <Row label="Data zgłoszenia" value={formatPlDate(c.createdAt)} />
        <Row label="Cel (identyfikator w sprawie)" value={c.refTargetId || '—'} />
        <Row label="Zgłaszający (e-mail)" value={c.reporterEmail || '—'} />
        {c.reporterUid ? <Row label="UID zgłaszającego" value={c.reporterUid} /> : null}
        <Row label="Status moderacji" value={moderationLabel(eff)} />
        <Row label="Zmiana statusu przez admina" value={c.moderatedAt ? formatPlDate(c.moderatedAt) : '—'} />
        <Text style={styles.sectionTitle}>Treść skargi</Text>
        <Text style={styles.desc}>{c.description}</Text>

        {params.mode === 'firebase' && (
          <View style={styles.actions}>
            <Text style={styles.actionsTitle}>Akcje moderatora</Text>
            {busy ? (
              <ActivityIndicator style={{ marginVertical: spacing.md }} color={colors.primary} />
            ) : null}
            <Text style={styles.actionsHint}>Status skargi</Text>
            <View style={styles.btnRowWrap}>
              <Pressable style={styles.btnNeutral} onPress={() => onSetModeration('pending')}>
                <Text style={styles.btnNeutralText}>Oczekująca</Text>
              </Pressable>
              <Pressable style={styles.btnOk} onPress={() => onSetModeration('resolved')}>
                <Text style={styles.btnOkText}>Rozpatrzona</Text>
              </Pressable>
              <Pressable style={styles.btnDangerOutlined} onPress={() => onSetModeration('rejected')}>
                <Text style={styles.btnDangerText}>Odrzucona</Text>
              </Pressable>
            </View>

            <Text style={[styles.actionsHint, { marginTop: spacing.lg }]}>Konto użytkownika</Text>
            <Pressable style={styles.btnDanger} onPress={onSuspendReporter} disabled={!c.reporterUid || busy}>
              <Text style={styles.btnDangerSolidText}>Zablokuj konto zgłaszającego</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btnDanger,
                { marginTop: spacing.sm },
                !targetLooksLikeVolunteerOrgAccount(c.refTargetId) ? styles.btnMuted : null,
              ]}
              onPress={onSuspendTargetAccount}
              disabled={busy || !targetLooksLikeVolunteerOrgAccount(c.refTargetId)}
            >
              <Text style={styles.btnDangerSolidText}>Zablokuj konto celu (W- / O-)</Text>
            </Pressable>
            <Text style={styles.actionsFoot}>
              Konta blokowane są w polu „accountSuspended” w Firestore. Odblokowanie wykonasz w dokumentach
              użytkowników w konsoli Firebase lub przyszłą akcją w panelu.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  pad: { padding: spacing.lg },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  lead: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  mockBanner: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 16,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  row: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  rowLabel: { fontSize: 12, color: colors.textLight, marginBottom: 4, fontWeight: '700' },
  rowValue: { fontSize: 15, color: colors.text },
  errText: { color: colors.adminDangerText, fontSize: 16 },
  actions: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionsTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  actionsHint: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  actionsFoot: { fontSize: 12, color: colors.textLight, marginTop: spacing.md, lineHeight: 17 },
  btnRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  btnNeutral: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  btnNeutralText: { fontSize: 13, fontWeight: '700', color: colors.text },
  btnOk: {
    borderWidth: 2,
    borderColor: colors.successText,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.successBg,
  },
  btnOkText: { fontSize: 13, fontWeight: '700', color: colors.successText },
  btnDangerOutlined: {
    borderWidth: 2,
    borderColor: colors.adminDangerText,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.adminDangerBg,
  },
  btnDangerText: { fontSize: 13, fontWeight: '700', color: colors.adminDangerText },
  btnDanger: {
    backgroundColor: colors.adminDangerText,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnMuted: { opacity: 0.45 },
  btnDangerSolidText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
})
