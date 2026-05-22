import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import type { AdminMainStackParamList, AdminTabParamList, RootStackParamList } from '../../navigation/types'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/spacing'
import { adminAktywnosc, adminStatystykiPoczatkowe } from '../../data/adminMock'
import { clearAdminSession } from '../../auth/adminSession'
import { isFirebaseConfigured } from '../../firebase/env'
import { signOutFirebase } from '../../firebase/adminAuth'
import { getFirebaseAuth } from '../../firebase/client'
import {
  subscribeAdminDashboardMetrics,
  subscribeAdminRecentComplaintActivity,
  type AdminActivityRow,
  type AdminDashboardStats,
} from '../../firebase/adminFirestore'
import { usePomagaMY } from '../../context/PomagaMYContext'

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'AdminDashboard'>,
  CompositeNavigationProp<
    NativeStackNavigationProp<AdminMainStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>

type Props = { navigation: Nav }

function formatAdminDate(d: Date) {
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function AdminDashboardScreen({ navigation }: Props) {
  const { runWithAuthOverlay } = usePomagaMY()
  const insets = useSafeAreaInsets()
  const [stats, setStats] = useState<AdminDashboardStats>(() => ({ ...adminStatystykiPoczatkowe }))
  const [statsHint, setStatsHint] = useState<string | null>(() =>
    isFirebaseConfigured() ? 'Ładowanie…' : 'Tryb bez połączenia z chmurą.',
  )
  const [activity, setActivity] = useState<AdminActivityRow[]>([])

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setActivity([])
      setStatsHint('Tryb bez połączenia z chmurą.')
      return
    }
    const unsub = subscribeAdminDashboardMetrics(
      (next, meta) => {
        setStats(next)
        if (meta?.source === 'mock') {
          setStatsHint(
            'Nie udało się pobrać aktualnych liczb. Wyświetlane są wartości przykładowe.',
          )
        } else {
          setStatsHint(null)
        }
      },
      (err) => {
        console.warn('[AdminDashboard] agregacja:', err)
      },
    )
    return unsub
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const unsub = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        setStats({ ...adminStatystykiPoczatkowe })
        setStatsHint('Zaloguj się ponownie jako administrator, aby wczytać liczniki.')
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    const unsub = subscribeAdminRecentComplaintActivity(
      (rows) => setActivity(rows),
      () => setActivity([]),
    )
    return unsub
  }, [])

  const wylogujPotwierdzone = async () => {
    await runWithAuthOverlay('Wylogowywanie…', async () => {
      if (isFirebaseConfigured()) {
        await signOutFirebase()
        return
      }
      await clearAdminSession()
    })
    navigation.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    })
  }

  const zapytanieWyloguj = () => {
    Alert.alert('Wylogowanie', 'Czy na pewno chcesz się wylogować z panelu administratora?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyloguj',
        style: 'destructive',
        onPress: () => void wylogujPotwierdzone(),
      },
    ])
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable onPress={zapytanieWyloguj} hitSlop={12} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>Dashboard Admina</Text>
        <View style={styles.logoutBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeHi}>Witaj Admin! 👋</Text>
          <Text style={styles.welcomeDate}>{formatAdminDate(new Date())}</Text>
        </View>

        {statsHint ? <Text style={styles.hintBar}>{statsHint}</Text> : null}

        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{stats.uzytkownicy}</Text>
            <Text style={styles.statLabel}>Użytkownicy (wol. + org.)</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{stats.ogloszenia}</Text>
            <Text style={styles.statLabel}>Ogłoszenia</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{stats.zgloszenia}</Text>
            <Text style={styles.statLabel}>Zgłoszenia do zadań</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{stats.doModeracji}</Text>
            <Text style={styles.statLabel}>Org. do weryfikacji</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{stats.skargi}</Text>
            <Text style={styles.statLabel}>Skargi</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Wymagają uwagi</Text>

        <View style={styles.actionCard}>
          <View style={[styles.actionAccent, { backgroundColor: colors.adminWarningBorder }]} />
          <View style={styles.actionBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Weryfikacja organizacji</Text>
              <Text style={styles.actionSub}>
                {stats.doModeracji === 1
                  ? '1 organizacja oczekuje'
                  : `${stats.doModeracji} organizacji oczekuje`}
              </Text>
            </View>
            <Pressable
              style={styles.btnSoftOrange}
              onPress={() => navigation.navigate('AdminWeryfikacjaOrg')}
            >
              <Text style={styles.btnSoftOrangeText}>Sprawdź</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionCard}>
          <View style={[styles.actionAccent, { backgroundColor: colors.adminDangerBorder }]} />
          <View style={styles.actionBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Skargi do rozpatrzenia</Text>
              <Text style={styles.actionSub}>
                {stats.skargi === 1 ? '1 wpis w bazie' : `${stats.skargi} wpisów w bazie`}
              </Text>
            </View>
            <Pressable
              style={styles.btnSoftRed}
              onPress={() => navigation.navigate('AdminSkargi')}
            >
              <Text style={styles.btnSoftRedText}>Przejrzyj</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Ostatnia aktywność (skargi)</Text>
        {isFirebaseConfigured() && activity.length === 0 ? (
          <Text style={styles.emptyActivity}>Brak wpisów w tej sekcji.</Text>
        ) : null}
        {(activity.length > 0 ? activity : !isFirebaseConfigured() ? adminAktywnosc : []).map((row, i) => {
          const key: string = activity.length > 0 ? String((row as AdminActivityRow).id) : `mock-${i}`
          return (
            <View key={key} style={styles.logRow}>
            {row.typ === 'ok' && <Ionicons name="checkmark-circle" size={20} color={colors.successText} />}
            {row.typ === 'reject' && <Ionicons name="close-circle" size={20} color={colors.adminDangerText} />}
            {row.typ === 'block' && <Ionicons name="ban" size={20} color={colors.adminDangerText} />}
            <Text style={styles.logText}>{row.tekst}</Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: 16,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  logoutBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  welcomeHi: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: spacing.xs },
  welcomeDate: { color: 'rgba(255,255,255,0.9)', fontSize: 15 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCell: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNum: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 13, color: colors.text, marginTop: 4, textAlign: 'center' },
  hintBar: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 18 },
  emptyActivity: { color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm, lineHeight: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionAccent: { width: 5 },
  actionBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionTitle: { fontWeight: '800', fontSize: 15, color: colors.text },
  actionSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  btnSoftOrange: {
    backgroundColor: colors.adminWarningBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  btnSoftOrangeText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  btnSoftRed: {
    backgroundColor: colors.adminDangerBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  btnSoftRedText: { color: colors.adminDangerText, fontWeight: '700', fontSize: 13 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logText: { flex: 1, color: colors.textMuted, fontSize: 14 },
})
