import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AdminOrgVerificationStackParamList } from '../../navigation/types'
import type { OrganizacjaDoWeryfikacji } from '../../data/adminMock'
import { isFirebaseConfigured } from '../../firebase/env'
import { subscribeOrganizationsByVerification } from '../../firebase/adminFirestore'
import { loadOrganizationsLocalByVerification } from '../../storage/localOrgVerification'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/spacing'

type Props = NativeStackScreenProps<AdminOrgVerificationStackParamList, 'AdminOrgList'>

type VerificationFilter = OrganizacjaDoWeryfikacji['verificationStatus']

export function AdminOrganizationListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<VerificationFilter>('pending')
  const [orgs, setOrgs] = useState<OrganizacjaDoWeryfikacji[]>([])
  const [loading, setLoading] = useState(true)

  const reloadLocal = useCallback(async () => {
    setLoading(true)
    try {
      const list = await loadOrganizationsLocalByVerification(filter)
      setOrgs(list)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useFocusEffect(
    useCallback(() => {
      if (!isFirebaseConfigured()) {
        void reloadLocal()
      }
    }, [reloadLocal]),
  )

  useEffect(() => {
    if (!isFirebaseConfigured()) return
    setLoading(true)
    const unsub = subscribeOrganizationsByVerification(
      filter,
      (list) => {
        setOrgs(list)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [filter])

  const count = orgs.length

  const headerSub = loading
    ? 'Ładowanie…'
    : filter === 'pending'
      ? count === 0
        ? 'Brak kont oczekujących na weryfikację'
        : count === 1
          ? '1 konto oczekuje na weryfikację'
          : `${count} kont oczekuje na weryfikację`
      : filter === 'approved'
        ? count === 0
          ? 'Brak zatwierdzonych organizacji'
          : count === 1
            ? '1 zatwierdzona organizacja'
            : `${count} zatwierdzonych organizacji`
        : count === 0
          ? 'Brak odrzuconych organizacji'
          : count === 1
            ? '1 odrzucona organizacja'
            : `${count} odrzuconych organizacji`

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.headerTitle}>Weryfikacja organizacji</Text>

        <View style={styles.segmentRow}>
          {(
            [
              ['pending', 'W kolejce'],
              ['approved', 'Zatwierdzone'],
              ['rejected', 'Odrzucone'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.segmentChip, filter === key && styles.segmentChipOn]}
              onPress={() => setFilter(key)}
            >
              <Text style={[styles.segmentChipText, filter === key && styles.segmentChipTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.headerSub}>{headerSub}</Text>
        <Text style={styles.headerHint}>
          Po zatwierdzeniu organizacja nie znika — przechodzi do zakładki «Zatwierdzone».
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {orgs.map((org) => {
            const bdStyle =
              org.verificationStatus === 'approved'
                ? styles.badgeApproved
                : org.verificationStatus === 'rejected'
                  ? styles.badgeRejected
                  : styles.badgeNowa
            const bdLabel =
              org.verificationStatus === 'approved'
                ? 'Zatwierdzona'
                : org.verificationStatus === 'rejected'
                  ? 'Odrzucona'
                  : 'Oczekuje'
            return (
              <View key={org.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.kod}>{org.kod || org.id}</Text>
                  <View style={[styles.badgeBase, bdStyle]}>
                    <Text style={styles.badgeText}>{bdLabel}</Text>
                  </View>
                </View>
                <Text style={styles.nazwa}>{org.nazwa}</Text>
                <Text style={styles.meta}>NIP: {org.nip}</Text>
                <Text style={styles.meta}>KRS: {org.krs}</Text>
                <Text style={styles.data}>Zgłoszono: {org.zgloszonoPelna || '—'}</Text>

                <View style={styles.docsRow}>
                  <View style={[styles.docPill, org.dokumenty.statut ? styles.docOk : styles.docMissing]}>
                    <Text style={styles.docPillText}>Statut</Text>
                  </View>
                  <View style={[styles.docPill, org.dokumenty.krs ? styles.docOk : styles.docMissing]}>
                    <Text style={styles.docPillText}>KRS</Text>
                  </View>
                  <View style={[styles.docPill, org.dokumenty.nip ? styles.docOk : styles.docMissing]}>
                    <Text style={styles.docPillText}>NIP</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.btn}
                  onPress={() => navigation.navigate('AdminOrgDetail', { id: org.id })}
                >
                  <Text style={styles.btnText}>Zobacz szczegóły</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </Pressable>
              </View>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  segmentChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  segmentChipOn: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  segmentChipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  segmentChipTextOn: { color: colors.primary },
  headerSub: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  headerHint: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kod: { fontSize: 16, fontWeight: '800', color: colors.primary },
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeNowa: {
    backgroundColor: colors.successBg,
  },
  badgeApproved: {
    backgroundColor: '#e8f4ea',
  },
  badgeRejected: {
    backgroundColor: colors.adminDangerBg,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.text },
  nazwa: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  data: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm },
  docsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  docPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  docOk: { backgroundColor: colors.successBg },
  docMissing: { backgroundColor: colors.adminWarningBg },
  docPillText: { fontSize: 12, fontWeight: '700', color: colors.text },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  btnText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
})
