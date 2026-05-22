import { Ionicons } from '@expo/vector-icons'
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { OrgStackParamList } from '../../navigation/types'
import { usePomagaMY } from '../../context/PomagaMYContext'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/spacing'
import type { Ogloszenie } from '../../types/ogloszenie'

export function OrgOgloszeniaListScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<OrgStackParamList>>()
  const { session, allOgloszenia, mvp, dataSource, deleteOgloszenie, setListingArchived } = usePomagaMY()
  const orgName = session?.organizationName ?? session?.displayName ?? ''

  const list =
    dataSource === 'firebase'
      ? allOgloszenia
      : (() => {
          const mine = allOgloszenia.filter((o) => o.organizacja === orgName)
          return mine.length > 0 ? mine : allOgloszenia
        })()

  const pendingCount = (ogId: string) =>
    mvp.applications.filter((a) => a.ogloszenieId === ogId && a.status === 'oczekujące').length

  const canManageItem = (item: Ogloszenie) => orgName.length > 0 && item.organizacja === orgName

  const handleDelete = (item: Ogloszenie) => {
    Alert.alert(
      'Usunąć ogłoszenie?',
      `„${item.tytul}” zostanie usunięte. Tej operacji nie można cofnąć.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => {
            void deleteOgloszenie(item.id)
              .then(() => Alert.alert('Usunięto', 'Ogłoszenie zostało usunięte.'))
              .catch((e: unknown) =>
                Alert.alert('Błąd', e instanceof Error ? e.message : 'Nie udało się usunąć ogłoszenia.'),
              )
          },
        },
      ],
    )
  }

  const handleArchive = (item: Ogloszenie) => {
    Alert.alert(
      'Archiwizować ogłoszenie?',
      `„${item.tytul}” zniknie z listy dla wolontariuszy (np. przestarzała treść). W panelu nadal masz dostęp do zgłoszeń.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Ukryj / archiwizuj',
          onPress: () => {
            void setListingArchived(item.id, true)
              .then(() => Alert.alert('Zarchiwizowano', 'Ogłoszenie zostało ukryte przed wolontariuszami.'))
              .catch((e: unknown) =>
                Alert.alert('Błąd', e instanceof Error ? e.message : 'Nie udało się zarchiwizować.'),
              )
          },
        },
      ],
    )
  }

  const handleRestore = (item: Ogloszenie) => {
    const approved = session?.orgVerificationStatus === 'approved'
    Alert.alert(
      'Przywrócić ogłoszenie?',
      approved
        ? 'Ogłoszenie znów pojawi się w widoku dla wolontariuszy.'
        : 'Ogłoszenie wróci z archiwum, ale pozostanie niewidoczne dla wolontariuszy do czasu zatwierdzenia organizacji przez administratora.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Przywróć',
          onPress: () => {
            void setListingArchived(item.id, false)
              .then(() => Alert.alert('Przywrócono', 'Zapisano zmiany widoczności ogłoszenia.'))
              .catch((e: unknown) =>
                Alert.alert('Błąd', e instanceof Error ? e.message : 'Nie udało się przywrócić.'),
              )
          },
        },
      ],
    )
  }

  const renderItem = ({ item }: { item: Ogloszenie }) => (
    <View style={styles.card}>
      <Pressable
        onPress={() => navigation.navigate('OrgOgloszenieApplicants', { id: item.id })}
        accessibilityRole="button"
      >
        <Text style={styles.cardTitle}>{item.tytul}</Text>
        <Text style={styles.cardMeta}>{item.organizacja}</Text>
        {item.archived ? (
          <View style={styles.archiveBadge}>
            <Text style={styles.archiveBadgeText}>W archiwum — nie widać u wolontariuszy</Text>
          </View>
        ) : null}
        {pendingCount(item.id) > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount(item.id)} oczekujących zgłoszeń</Text>
          </View>
        ) : (
          <Text style={styles.hint}>Brak oczekujących — dotknij, aby zobaczyć historię</Text>
        )}
      </Pressable>
      {canManageItem(item) ? (
        <View style={styles.cardActions}>
          {item.archived ? (
            <Pressable style={styles.actionBtn} onPress={() => handleRestore(item)}>
              <Ionicons name="albums-outline" size={16} color={colors.primary} />
              <Text style={styles.actionTextRestore}>Przywróć</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.actionBtn} onPress={() => handleArchive(item)}>
              <Ionicons name="archive-outline" size={16} color={colors.textMuted} />
              <Text style={styles.actionTextArchive}>Archiwizuj</Text>
            </Pressable>
          )}
          <Pressable style={styles.actionBtn} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={16} color={colors.adminDangerText} />
            <Text style={styles.actionTextDanger}>Usuń</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )

  const statusBanner =
    session?.role === 'organization' &&
    (session.orgVerificationStatus === 'pending' || session.orgVerificationStatus === 'rejected') ? (
      session.orgVerificationStatus === 'pending' ? (
        <View style={styles.bannerPending}>
          <Text style={styles.bannerTitle}>Weryfikacja konta</Text>
          <Text style={styles.bannerText}>
            Twoje ogłoszenia są zapisane, ale nie są widoczne dla wolontariuszy, dopóki administrator nie
            zatwierdzi organizacji.
          </Text>
        </View>
      ) : (
        <View style={styles.bannerReject}>
          <Text style={styles.bannerTitle}>Konto nie zostało zatwierdzone</Text>
          <Text style={styles.bannerText}>
            Skontaktuj się z pomocą aplikacji. Ogłoszenia nie są publikowane w widoku dla wolontariuszy.
          </Text>
        </View>
      )
    ) : null

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel organizacji</Text>
        <Text style={styles.sub}>
          {dataSource === 'firebase'
            ? 'Twoje ogłoszenia z chmury. „Archiwizuj”, żeby ukryć nieaktualne przed wolontariuszami (nie kasuje historii zgłoszeń).'
            : list === allOgloszenia && !allOgloszenia.every((o) => o.organizacja === orgName)
            ? 'Brak ogłoszeń dla tej nazwy — wyświetlamy całą listę. Użyj nazwy zgodnej z ogłoszeniami, które chcesz prowadzić (np. Bank Żywności Kraków).'
            : 'Ogłoszenia przypisane do Twojej organizacji (zapisane na tym urządzeniu).'}
        </Text>
        {statusBanner}
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('OrgNewOgloszenie')}>
          <Text style={styles.addBtnText}>+ Dodaj ogłoszenie</Text>
        </Pressable>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Brak ogłoszeń.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20, fontSize: 13 },
  addBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bannerPending: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.adminWarningBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerReject: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.adminDangerBg,
    borderWidth: 1,
    borderColor: colors.adminDangerBorder,
  },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 6 },
  bannerText: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  actionTextArchive: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  actionTextRestore: { fontSize: 14, fontWeight: '700', color: colors.primary },
  actionTextDanger: { fontSize: 14, fontWeight: '700', color: colors.adminDangerText },
  archiveBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  archiveBadgeText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  cardMeta: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(232, 100, 42, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  hint: { marginTop: spacing.sm, fontSize: 12, color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
})
