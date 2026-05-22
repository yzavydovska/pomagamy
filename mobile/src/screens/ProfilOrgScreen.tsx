import { useState } from 'react'
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CommonActions, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { usePomagaMY } from '../context/PomagaMYContext'
import { ProfileAvatarCircle } from '../components/ProfileAvatarCircle'
import { CopyableIdRow } from '../components/CopyableIdRow'
import { ProfileIncompleteNotice } from '../components/ProfileIncompleteNotice'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

function useRootNavigation() {
  const nav = useNavigation()
  let p: typeof nav | undefined = nav
  while (p?.getParent()) p = p.getParent()
  return p as unknown as NativeStackNavigationProp<RootStackParamList>
}


export function ProfilOrgScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()
  const { session, logout, requestOrgVerificationResubmit } = usePomagaMY()
  const [resubmitBusy, setResubmitBusy] = useState(false)

  if (!session || session.role !== 'organization') return null

  const orgLabel = session.organizationName ?? session.displayName
  const initials = orgLabel
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  const v = session.orgVerificationStatus
  const rejectionFromAdmin = (session.orgVerificationRejectionReason ?? '').trim()

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingBottom: 100 }]}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.avatarWrap}>
          <ProfileAvatarCircle
            uri={session.avatarUri}
            initials={initials || '?'}
            hero
            onPress={() => rootNav.navigate('EditProfile')}
          />
        </View>
        <Text style={styles.name}>{orgLabel}</Text>
        <View style={styles.roleRow}>
          <Text style={styles.role}>Organizacja</Text>
          {v === 'approved' ? (
            <View style={[styles.verPill, styles.verPillApproved]}>
              <Text style={styles.verPillTextOk}>Zweryfikowana</Text>
            </View>
          ) : v === 'pending' ? (
            <View style={[styles.verPill, styles.verPillPending]}>
              <Text style={styles.verPillTextWarn}>Oczekuje na weryfikację</Text>
            </View>
          ) : v === 'rejected' ? (
            <View style={[styles.verPill, styles.verPillRejected]}>
              <Text style={styles.verPillTextErr}>Konto niezatwierdzone</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.refHint}>
          Zarządzasz ogłoszeniami i zgłoszeniami wolontariuszy. Dane kontaktowe i opis — poniżej.
        </Text>
      </View>

      <ProfileIncompleteNotice
        city={session.city}
        about={session.about}
        variant="organization"
        onEdit={() => rootNav.navigate('EditProfile')}
      />

      {v === 'rejected' ? (
        <View style={styles.rejectedCard}>
          <Text style={styles.rejectedTitle}>Weryfikacja odrzucona</Text>
          {rejectionFromAdmin.length > 0 ? (
            <>
              <Text style={styles.rejectAdminHead}>Uwagi administratora — co warto poprawić</Text>
              <Text style={styles.rejectAdminBody}>{rejectionFromAdmin}</Text>
            </>
          ) : null}
          <Text style={styles.rejectedBody}>
            Konto nadal działa, ale ogłoszenia nie są widoczne dla wolontariuszy, dopóki administrator ponownie nie
            zatwierdzi organizacji. Możesz poprosić o ponowną weryfikację — trafisz z powrotem do kolejki oczekujących.
          </Text>
          <Pressable
            style={[styles.resubmitBtn, resubmitBusy && styles.resubmitBtnDisabled]}
            disabled={resubmitBusy}
            onPress={() => {
              Alert.alert(
                'Ponowna weryfikacja',
                'Czy wysłać prośbę o ponowną weryfikację konta? Administrator zobaczy organizację na liście do sprawdzenia.',
                [
                  { text: 'Anuluj', style: 'cancel' },
                  {
                    text: 'Wyślij',
                    onPress: () => {
                      setResubmitBusy(true)
                      void requestOrgVerificationResubmit()
                        .then((r) => {
                          if (r.ok) {
                            Alert.alert('Wysłano', 'Twoja organizacja znów oczekuje na weryfikację przez administratora.')
                          } else {
                            Alert.alert('Nie udało się', r.message)
                          }
                        })
                        .finally(() => setResubmitBusy(false))
                    },
                  },
                ],
              )
            }}
          >
            {resubmitBusy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resubmitBtnText}>Poproś o ponowną weryfikację</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Informacje kontaktowe</Text>
        <Row label="E-mail" value={session.email} />
        <CopyableIdRow label="Numer ID organizacji" value={session.publicId ?? '—'} />
        <Row label="Telefon" value={session.phone || '—'} />
        <Row label="Osoba kontaktowa" value={session.displayName || '—'} />
        <Row label="Miasto" value={session.city || '—'} last />
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>O organizacji</Text>
        <Text style={styles.about}>
          {session.about?.trim() ? session.about : 'Dodaj krótki opis działalności w edycji profilu.'}
        </Text>
      </View>

      <Pressable style={styles.btnPrimary} onPress={() => rootNav.navigate('EditProfile')}>
        <Text style={styles.btnPrimaryText}>Edytuj profil</Text>
      </Pressable>
      <Pressable style={styles.btnSecondary} onPress={() => rootNav.navigate('ReportComplaint', {})}>
        <Text style={styles.btnSecondaryText}>Zgłoś naruszenie / skargę</Text>
      </Pressable>
      <Pressable
        style={styles.btnGhost}
        onPress={() => {
          Alert.alert('Wylogowanie', 'Czy na pewno?', [
            { text: 'Anuluj', style: 'cancel' },
            {
              text: 'Wyloguj',
              style: 'destructive',
              onPress: () =>
                void logout().then(() =>
                  rootNav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] })),
                ),
            },
          ])
        }}
      >
        <Text style={styles.btnGhostText}>Wyloguj się</Text>
      </Pressable>
    </ScrollView>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 999,
    marginBottom: spacing.md,
  },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', paddingHorizontal: spacing.md },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  role: { color: '#fff', fontSize: 16 },
  verPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  verPillApproved: { backgroundColor: colors.successBg },
  verPillPending: { backgroundColor: colors.adminWarningBg },
  verPillRejected: { backgroundColor: colors.adminDangerBg },
  verPillTextOk: { fontSize: 12, fontWeight: '700', color: colors.successText },
  verPillTextWarn: { fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  verPillTextErr: { fontSize: 12, fontWeight: '700', color: colors.adminDangerText },
  refHint: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: 360,
    alignSelf: 'center',
  },
  block: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  rejectedCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.adminDangerBg,
    borderWidth: 1,
    borderColor: colors.adminDangerBorder,
  },
  rejectedTitle: { fontSize: 16, fontWeight: '800', color: colors.adminDangerText, marginBottom: spacing.sm },
  rejectAdminHead: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.adminDangerText,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rejectAdminBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectedBody: { fontSize: 14, lineHeight: 21, color: colors.text, marginBottom: spacing.md },
  resubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  resubmitBtnDisabled: { opacity: 0.7 },
  resubmitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  blockTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  about: { color: colors.textMuted, lineHeight: 24 },
  btnPrimary: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnSecondary: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  btnSecondaryText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  btnGhost: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnGhostText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
})
