import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors } from '../../theme/colors'
import type { AdminMainStackParamList, AdminTabParamList } from '../../navigation/types'
import { radius, spacing } from '../../theme/spacing'
import { skargiAdmin } from '../../data/adminMock'
import type { Complaint } from '../../types/mvp'
import { isFirebaseConfigured } from '../../firebase/env'
import { subscribeComplaintsForAdmin, complaintEffectiveModeration } from '../../firebase/adminFirestore'

type ComplaintsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList, 'AdminSkargi'>,
  NativeStackNavigationProp<AdminMainStackParamList>
>

function formatPlDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function AdminComplaintsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<ComplaintsNavigation>()
  const useFb = isFirebaseConfigured()
  const [firebaseList, setFirebaseList] = useState<Complaint[] | null>(null)
  const [loadErr, setLoadErr] = useState(false)

  useEffect(() => {
    if (!useFb) return
    const unsub = subscribeComplaintsForAdmin(
      (items) => {
        setLoadErr(false)
        setFirebaseList(items)
      },
      () => {
        setLoadErr(true)
        setFirebaseList([])
      },
    )
    return unsub
  }, [useFb])

  const openFirebaseDetail = (complaintId: string) => {
    const payload = { mode: 'firebase' as const, complaintId }
    const parent = navigation.getParent()
    if (parent) {
      ;(parent as NativeStackNavigationProp<AdminMainStackParamList>).navigate(
        'AdminComplaintDetail',
        payload,
      )
      return
    }
    navigation.navigate('AdminComplaintDetail', payload)
  }

  const openMockDetail = (mockId: string) => {
    const payload = { mode: 'mock' as const, mockId }
    const parent = navigation.getParent()
    if (parent) {
      ;(parent as NativeStackNavigationProp<AdminMainStackParamList>).navigate(
        'AdminComplaintDetail',
        payload,
      )
      return
    }
    navigation.navigate('AdminComplaintDetail', payload)
  }

  if (useFb && firebaseList === null) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie skarg…</Text>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.headerTitle}>Skargi</Text>
        <Text style={styles.headerSub}>
          {useFb
            ? 'Zgłoszenia z aplikacji — otwórz szczegóły, żeby zobaczyć pełny opis.'
            : 'Lista przykładowa bez Firebase.'}
        </Text>
      </View>

      {loadErr && useFb && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Nie udało się wczytać skarg. Sprawdź połączenie i uprawnienia konta administratora.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {useFb &&
          firebaseList &&
          firebaseList.map((s) => {
            const ms = complaintEffectiveModeration(s)
            const pending = ms === 'pending'
            const resolved = ms === 'resolved'
            return (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.kod}>#{s.id.slice(0, 10)}…</Text>
                <View
                  style={[
                    styles.pill,
                    pending ? styles.pillActive : resolved ? styles.pillDone : styles.pillNeutral,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      pending ? styles.pillTextActive : resolved ? styles.pillTextDone : styles.pillTextNeutral,
                    ]}
                  >
                    {pending ? 'Oczekuje' : resolved ? 'Zaakceptowana' : 'Odrzucona'}
                  </Text>
                </View>
              </View>
              <Text style={styles.tytul}>{s.category}</Text>
              <Text style={styles.desc} numberOfLines={4}>
                {s.description}
              </Text>
              <Text style={styles.meta}>
                {s.reporterEmail}
                {s.refTargetId ? ` • ${s.refTargetId}` : ''}
              </Text>
              <Text style={styles.metaMuted}>{formatPlDate(s.createdAt)}</Text>
              <Pressable style={styles.btn} onPress={() => openFirebaseDetail(s.id)}>
                <Text style={styles.btnText}>Szczegóły</Text>
              </Pressable>
            </View>
            )
          })}

        {useFb && firebaseList && firebaseList.length === 0 && (
          <Text style={styles.empty}>Brak skarg w bazie.</Text>
        )}

        {!useFb &&
          skargiAdmin.map((s) => (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.kod}>#{s.kod}</Text>
                <View
                  style={[
                    styles.pill,
                    s.status === 'aktywna' ? styles.pillActive : styles.pillDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      s.status === 'aktywna' ? styles.pillTextActive : styles.pillTextDone,
                    ]}
                  >
                    {s.status === 'aktywna' ? 'Aktywna' : 'Rozpatrzona'}
                  </Text>
                </View>
              </View>
              <Text style={styles.tytul}>{s.tytul}</Text>
              <Text style={styles.meta}>
                {s.zglaszajacy} • {s.data}
              </Text>
              <Pressable style={styles.btn} onPress={() => openMockDetail(s.id)}>
                <Text style={styles.btnText}>Szczegóły</Text>
              </Pressable>
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, color: colors.textMuted, textAlign: 'center' },
  banner: {
    backgroundColor: colors.adminDangerBg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radius.md,
  },
  bannerText: { color: colors.adminDangerText, fontSize: 13 },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kod: { fontSize: 16, fontWeight: '800', color: colors.primary },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pillActive: { backgroundColor: colors.adminDangerBg },
  pillDone: { backgroundColor: colors.successBg },
  pillText: { fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: colors.adminDangerText },
  pillTextDone: { color: colors.successText },
  pillNeutral: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pillTextNeutral: { color: colors.textMuted },
  tytul: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  desc: { fontSize: 14, color: colors.text, marginTop: spacing.xs, lineHeight: 20 },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  metaMuted: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  btn: {
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnText: { color: colors.primary, fontWeight: '800' },
})
