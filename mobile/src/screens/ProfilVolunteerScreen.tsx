import { Ionicons } from '@expo/vector-icons'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { usePomagaMY } from '../context/PomagaMYContext'
import { ProfileAvatarCircle } from '../components/ProfileAvatarCircle'
import { ProfileIncompleteNotice } from '../components/ProfileIncompleteNotice'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'
import { copyTextToClipboard } from '../utils/copyToClipboard'

function useRootNavigation() {
  const nav = useNavigation()
  let p: typeof nav | undefined = nav
  while (p?.getParent()) p = p.getParent()
  return p as unknown as NativeStackNavigationProp<RootStackParamList>
}

export function ProfilVolunteerScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()
  const { session, mvp, logout, dataSource } = usePomagaMY()

  if (!session) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.scroll, styles.guestScroll, { paddingTop: Math.max(insets.top, spacing.xl) }]}
      >
        <Text style={styles.guestTitle}>Profil</Text>
        <Text style={styles.guestBody}>
          Przeglądasz ogłoszenia bez konta. Aby zgłosić chęć udziału w zadaniu i widzieć powiadomienia, zaloguj się
          {dataSource === 'firebase' ? ' (konto wolontariusza)' : ''}.
        </Text>
        <Pressable style={styles.btnPrimary} onPress={() => rootNav.navigate('Login')}>
          <Text style={styles.btnPrimaryText}>Zaloguj się</Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => rootNav.navigate('Register')}>
          <Text style={styles.btnSecondaryText}>Załóż konto</Text>
        </Pressable>
        <Pressable style={styles.btnGhost} onPress={() => rootNav.navigate('Welcome')}>
          <Text style={styles.btnGhostText}>Wróć do ekranu startowego</Text>
        </Pressable>
      </ScrollView>
    )
  }

  const initials = session.displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  const completedCount = mvp.applications.filter(
    (a) => a.volunteerEmail === session.email && a.status === 'zakończone',
  ).length
  /** Tylko wybrane tagi; puste łańcuchy pomijamy; unikalne kolejność zapisu. */
  const selectedInterests = [...new Set((session.interests ?? []).map((t) => t.trim()).filter(Boolean))]
  const pid = session.publicId?.trim()

  const onCopyId = () => {
    if (pid) void copyTextToClipboard(pid)
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.avatarWrap}>
          <ProfileAvatarCircle
            uri={session.avatarUri}
            initials={initials || '?'}
            hero
            size={104}
            onPress={() => rootNav.navigate('EditProfile')}
          />
        </View>
        <Text style={styles.heroName}>{session.displayName}</Text>
        <View style={styles.roleStrip}>
          <Text style={styles.roleText}>Wolontariusz</Text>
          <Pressable
            onPress={onCopyId}
            disabled={!pid}
            style={({ pressed }) => [styles.idBadge, !pid && styles.idBadgeMuted, pressed && pid && styles.idBadgePressed]}
            accessibilityRole="button"
            accessibilityLabel="Kopiuj numer ID"
          >
            <Text style={styles.idBadgeText} numberOfLines={1}>
              {pid ? `#${pid}` : '—'}
            </Text>
            {pid ? <Ionicons name="copy-outline" size={16} color={colors.primary} style={styles.idBadgeIcon} /> : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.sheet}>
        <ProfileIncompleteNotice
          city={session.city}
          about={session.about}
          variant="volunteer"
          onEdit={() => rootNav.navigate('EditProfile')}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Wykonanych zadań</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Informacje kontaktowe</Text>
          <Row label="Email" value={session.email} />
          <Row label="Telefon" value={session.phone || '—'} />
          <Row label="Lokalizacja" value={session.city || '—'} last />
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>O mnie</Text>
          <Text style={styles.about}>
            {session.about?.trim() ? session.about : 'Dodaj opis w edycji profilu.'}
          </Text>
        </View>

        {selectedInterests.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Zainteresowania</Text>
            <View style={styles.chipWrap}>
              {selectedInterests.map((tag) => (
                <View key={tag} style={[styles.chip, styles.chipOn]}>
                  <Text style={[styles.chipLabel, styles.chipLabelOn]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable style={styles.btnPrimary} onPress={() => rootNav.navigate('EditProfile')}>
          <Text style={styles.btnPrimaryText}>Edytuj profil</Text>
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
        <Pressable style={styles.linkComplaint} onPress={() => rootNav.navigate('ReportComplaint', {})}>
          <Text style={styles.linkComplaintText}>Zgłoś naruszenie / skargę</Text>
        </Pressable>
      </View>
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
  guestScroll: { paddingHorizontal: spacing.lg },
  guestTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  guestBody: { fontSize: 15, lineHeight: 22, color: colors.textMuted, marginBottom: spacing.lg },
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  avatarWrap: {
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 999,
    marginBottom: spacing.md,
  },
  heroName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  roleStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  roleText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    maxWidth: '58%',
  },
  idBadgeMuted: { opacity: 0.85 },
  idBadgePressed: { opacity: 0.92 },
  idBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 15,
    flexShrink: 1,
  },
  idBadgeIcon: { marginLeft: 6 },
  sheet: {
    backgroundColor: colors.surface,
    marginTop: 0,
  },
  statsRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: '600', textAlign: 'center' },
  block: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  blockTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: spacing.md },
  about: { color: colors.textMuted, lineHeight: 24, fontSize: 15 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  btnPrimary: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: 16,
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
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  btnGhostText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  linkComplaint: { alignItems: 'center', paddingBottom: spacing.lg },
  linkComplaintText: { color: colors.textMuted, fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
})
