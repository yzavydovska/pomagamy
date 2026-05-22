import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { usePomagaMY } from '../context/PomagaMYContext'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

function useRootNavigation() {
  const nav = useNavigation()
  let p: typeof nav | undefined = nav
  while (p?.getParent()) p = p.getParent()
  return p as unknown as NativeStackNavigationProp<RootStackParamList>
}

export function WiadomosciScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()
  const { session, mvp, markNotificationRead, markAllNotificationsRead } = usePomagaMY()
  const { notifications } = mvp
  const unread = notifications.filter((n) => !n.read).length

  if (!session) {
    return (
      <View style={[styles.root, styles.guestRoot, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Powiadomienia</Text>
        <Text style={styles.sub}>
          Powiadomienia o zgłoszeniach i decyzjach organizacji są dostępne po zalogowaniu.
        </Text>
        <Pressable style={styles.loginBtn} onPress={() => rootNav.navigate('Login')}>
          <Text style={styles.loginBtnText}>Zaloguj się</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.headRow}>
        <Text style={styles.title}>Powiadomienia</Text>
        {unread > 0 && (
          <Pressable onPress={() => void markAllNotificationsRead()}>
            <Text style={styles.markAll}>Oznacz jako przeczytane</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.sub}>Powiadomienia o Twoich zgłoszeniach i decyzjach organizacji.</Text>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={56} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Brak powiadomień</Text>
          <Text style={styles.emptySub}>
            Gdy wyślesz zgłoszenie lub organizacja zmieni status, pojawi się tu wpis.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 88 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, !item.read && styles.cardUnread]}
              onPress={() => void markNotificationRead(item.id)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleString('pl-PL')}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: 88,
  },
  guestRoot: { justifyContent: 'flex-start' },
  loginBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  markAll: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  sub: { color: colors.textMuted, marginBottom: spacing.lg, fontSize: 13 },
  empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: spacing.md, color: colors.text },
  emptySub: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(232, 100, 42, 0.06)',
  },
  cardTitle: { fontWeight: '800', color: colors.text, fontSize: 16 },
  cardBody: { color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  cardDate: { fontSize: 12, color: colors.textLight, marginTop: 8 },
})
