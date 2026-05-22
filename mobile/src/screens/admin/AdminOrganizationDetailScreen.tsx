import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import type { AdminOrgVerificationStackParamList } from '../../navigation/types'
import type { OrganizacjaDoWeryfikacji } from '../../data/adminMock'
import { AuthHeader } from '../../components/AuthHeader'
import { isFirebaseConfigured } from '../../firebase/env'
import {
  approveOrganization,
  fetchOrganizationById,
  rejectOrganization,
} from '../../firebase/adminFirestore'
import {
  approveOrganizationLocal,
  fetchLocalOrganizationByEmail,
  rejectOrganizationLocal,
} from '../../storage/localOrgVerification'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/spacing'

const ADMIN_REJECT_REASON_MIN = 10

type Props = NativeStackScreenProps<AdminOrgVerificationStackParamList, 'AdminOrgDetail'>

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

function labelForVerification(org: OrganizacjaDoWeryfikacji): string {
  switch (org.verificationStatus) {
    case 'approved':
      return 'Zatwierdzona'
    case 'rejected':
      return 'Odrzucona'
    default:
      return 'Oczekuje na decyzję'
  }
}

function badgeStyleForVerification(org: OrganizacjaDoWeryfikacji) {
  switch (org.verificationStatus) {
    case 'approved':
      return [styles.badgeStatusWrap, styles.badgeApprovedHero]
    case 'rejected':
      return [styles.badgeStatusWrap, styles.badgeRejectedHero]
    default:
      return [styles.badgeStatusWrap, styles.badgePendingHero]
  }
}

export function AdminOrganizationDetailScreen({ navigation, route }: Props) {
  const ownerUid = route.params.id
  const [org, setOrg] = useState<OrganizacjaDoWeryfikacji | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReasonDraft, setRejectReasonDraft] = useState('')

  useEffect(() => {
    let alive = true
    if (!isFirebaseConfigured()) {
      ;(async () => {
        const o = await fetchLocalOrganizationByEmail(ownerUid)
        if (alive) {
          setOrg(o)
          setLoading(false)
        }
      })()
      return () => {
        alive = false
      }
    }
    ;(async () => {
      const o = await fetchOrganizationById(ownerUid)
      if (alive) {
        setOrg(o)
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [ownerUid])

  const runApprove = async () => {
    if (!isFirebaseConfigured()) {
      setActing(true)
      try {
        await approveOrganizationLocal(ownerUid)
        Alert.alert('Gotowe', 'Organizacja została zatwierdzona. Ogłoszenia są widoczne dla wolontariuszy.')
        navigation.goBack()
      } catch (e) {
        Alert.alert(
          'Błąd',
          e instanceof Error ? e.message : 'Nie udało się zatwierdzić. Spróbuj ponownie.',
        )
      } finally {
        setActing(false)
      }
      return
    }
    setActing(true)
    try {
      await approveOrganization(ownerUid)
      Alert.alert('Gotowe', 'Organizacja została zatwierdzona. Ogłoszenia są widoczne dla wolontariuszy.')
      navigation.goBack()
    } catch (e) {
      Alert.alert(
        'Błąd',
        e instanceof Error ? e.message : 'Nie udało się zatwierdzić. Spróbuj ponownie lub sprawdź uprawnienia.',
      )
    } finally {
      setActing(false)
    }
  }

  const runReject = async (reason: string) => {
    if (!isFirebaseConfigured()) {
      setActing(true)
      try {
        await rejectOrganizationLocal(ownerUid, reason)
        setRejectModalVisible(false)
        setRejectReasonDraft('')
        Alert.alert('Zapisano', 'Organizacja została odrzucona. Ogłoszenia nie są publiczne dla wolontariuszy.')
        navigation.goBack()
      } catch (e) {
        Alert.alert(
          'Błąd',
          e instanceof Error ? e.message : 'Nie udało się odrzucić. Spróbuj ponownie.',
        )
      } finally {
        setActing(false)
      }
      return
    }
    setActing(true)
    try {
      await rejectOrganization(ownerUid, reason)
      setRejectModalVisible(false)
      setRejectReasonDraft('')
      Alert.alert('Zapisano', 'Organizacja została odrzucona. Ogłoszenia nie są publiczne dla wolontariuszy.')
      navigation.goBack()
    } catch (e) {
      Alert.alert(
        'Błąd',
        e instanceof Error ? e.message : 'Nie udało się odrzucić. Spróbuj ponownie lub sprawdź uprawnienia.',
      )
    } finally {
      setActing(false)
    }
  }
  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!org) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Nie znaleziono organizacji.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Wróć</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <AuthHeader title="Weryfikacja organizacji" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroKod}>{org.kod || ownerUid}</Text>
          <Text style={styles.heroNazwa}>{org.nazwa}</Text>
          <View style={badgeStyleForVerification(org)}>
            <Text style={styles.badgeStatusText}>{labelForVerification(org)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Dane organizacji</Text>
        <View style={styles.card}>
          <Row label="E-mail" value={org.email || '—'} />
          <Row label="Telefon" value={org.telefon || '—'} />
          <Row label="Adres" value={org.adres || '—'} />
          <Row label="Strona WWW" value={org.www || '—'} />
          <Row label="NIP" value={org.nip || '—'} />
          <Row label="KRS" value={org.krs || '—'} />
          <Row label="Zgłoszono" value={org.zgloszonoPelna || '—'} />
        </View>

        <Text style={styles.section}>Dokumenty</Text>
        <View style={styles.card}>
          {org.dokumentyPliki.length === 0 ? (
            <Text style={styles.emptyDocs}>Brak przesłanych dokumentów.</Text>
          ) : (
            org.dokumentyPliki.map((d, i) => (
              <Pressable
                key={i}
                style={styles.docRow}
                onPress={() => {
                  const u = (d.podtytul ?? '').trim()
                  if (/^https?:\/\//i.test(u)) void Linking.openURL(u).catch(() => {})
                }}
              >
                <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{d.tytul}</Text>
                  <Text style={styles.docSub}>{d.podtytul}</Text>
                </View>
                <Ionicons name="download-outline" size={22} color={colors.textMuted} />
              </Pressable>
            ))
          )}
        </View>

        {org.verificationStatus === 'rejected' &&
        org.verificationRejectionReason &&
        org.verificationRejectionReason.trim().length > 0 ? (
          <>
            <Text style={styles.section}>Uwagi dla organizacji (widoczne w aplikacji)</Text>
            <View style={[styles.card, styles.orgReasonWrap]}>
              <Text style={styles.orgReasonText}>{org.verificationRejectionReason.trim()}</Text>
            </View>
          </>
        ) : null}

        {org.verificationStatus === 'pending' ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btnReject, acting && styles.btnDisabled]}
            disabled={acting}
            onPress={() => {
              setRejectReasonDraft('')
              setRejectModalVisible(true)
            }}
          >
            <Text style={styles.btnRejectText}>Odrzuć</Text>
          </Pressable>
          <Pressable
            style={[styles.btnApprove, acting && styles.btnDisabled]}
            disabled={acting}
            onPress={() => {
              Alert.alert(
                'Zatwierdzić organizację?',
                'Wszystkie ogłoszenia tej organizacji stają się widoczne w aplikacji dla wolontariuszy.',
                [
                  { text: 'Anuluj', style: 'cancel' },
                  { text: 'Zatwierdź', onPress: () => void runApprove() },
                ],
              )
            }}
          >
            {acting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnApproveText}>Zatwierdź</Text>
            )}
          </Pressable>
        </View>
        ) : null}
      </ScrollView>

      <Modal
        transparent
        visible={rejectModalVisible}
        animationType="fade"
        onRequestClose={() => !acting && setRejectModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.rejectModalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.rejectBackdropPress} onPress={() => !acting && setRejectModalVisible(false)} />
          <View style={styles.rejectModalCard}>
            <Text style={styles.rejectModalTitle}>Odrzuć weryfikację</Text>
            <Text style={styles.rejectModalLead}>
              Opisz konkretnie, co jest nie tak (dokumenty, dane, zgodność ze statutem itd.). Organizacja przeczyta to w
              aplikacji i może poprawić zgłoszenie oraz poprosić o ponowną weryfikację. Minimum{' '}
              {ADMIN_REJECT_REASON_MIN} znaków.
            </Text>
            <TextInput
              value={rejectReasonDraft}
              onChangeText={setRejectReasonDraft}
              placeholder={`Np. dokumenty nieczytelne — popraw lub uzupełnij aktualny statut albo dopisz KRS, jeśli dotyczy.`}
              placeholderTextColor={colors.textMuted}
              editable={!acting}
              multiline
              style={styles.rejectInput}
              textAlignVertical="top"
            />
            <View style={styles.rejectModalActions}>
              <Pressable
                style={[styles.rejectModalGhost, acting && styles.btnDisabled]}
                disabled={acting}
                onPress={() => !acting && setRejectModalVisible(false)}
              >
                <Text style={styles.rejectModalGhostText}>Anuluj</Text>
              </Pressable>
              <Pressable
                style={[styles.rejectModalDanger, acting && styles.btnDisabled]}
                disabled={
                  acting || rejectReasonDraft.trim().length < ADMIN_REJECT_REASON_MIN
                }
                onPress={() => {
                  const trimmed = rejectReasonDraft.trim()
                  if (trimmed.length < ADMIN_REJECT_REASON_MIN) {
                    Alert.alert(
                      'Za krótko',
                      `Wpisz co najmniej ${ADMIN_REJECT_REASON_MIN} znaki/znaków powodu — żeby organizacja wiedziała, co naprawić.`,
                    )
                    return
                  }
                  void runReject(trimmed)
                }}
              >
                {acting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.rejectModalDangerText}>Odrzuć organizację</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  hero: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroKod: { fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  heroNazwa: { fontSize: 20, fontWeight: '800', color: colors.text },
  badgeStatusWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  badgePendingHero: {
    backgroundColor: colors.adminWarningBg,
  },
  badgeApprovedHero: {
    backgroundColor: '#e8f4ea',
  },
  badgeRejectedHero: {
    backgroundColor: colors.adminDangerBg,
  },
  badgeStatusText: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { marginBottom: spacing.sm },
  rowLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '600' },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  docTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  docSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  emptyDocs: { color: colors.textMuted, fontSize: 14 },
  orgReasonWrap: {
    borderLeftWidth: 4,
    borderLeftColor: colors.adminDangerBorder,
    backgroundColor: colors.adminDangerBg,
  },
  orgReasonText: { fontSize: 15, lineHeight: 22, color: colors.text, fontWeight: '600' },
  rejectModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(26,35,76,0.45)',
  },
  rejectBackdropPress: { flex: 1 },
  rejectModalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  rejectModalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  rejectModalLead: { fontSize: 14, lineHeight: 21, color: colors.textMuted },
  rejectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 120,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.inputBg,
  },
  rejectModalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  rejectModalGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rejectModalGhostText: { fontWeight: '800', color: colors.text },
  rejectModalDanger: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.adminDangerBorder,
    alignItems: 'center',
  },
  rejectModalDangerText: { fontWeight: '800', color: '#fff', fontSize: 14 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnReject: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.adminDangerBorder,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.adminDangerBg,
  },
  btnRejectText: { color: colors.adminDangerText, fontWeight: '800', fontSize: 15 },
  btnApprove: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnApproveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnDisabled: { opacity: 0.65 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  fallbackText: { color: colors.textMuted, marginBottom: spacing.md },
  link: { color: colors.primary, fontWeight: '700' },
})
