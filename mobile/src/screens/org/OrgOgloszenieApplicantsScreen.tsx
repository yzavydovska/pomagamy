import { Ionicons } from '@expo/vector-icons'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OrgStackParamList } from '../../navigation/types'
import { AuthHeader } from '../../components/AuthHeader'
import { usePomagaMY } from '../../context/PomagaMYContext'
import { getOgloszenieFromAll } from '../../data/ogloszenia'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/spacing'
import { copyTextToClipboard } from '../../utils/copyToClipboard'

type Props = NativeStackScreenProps<OrgStackParamList, 'OrgOgloszenieApplicants'>

export function OrgOgloszenieApplicantsScreen({ navigation, route }: Props) {
  const { id } = route.params
  const { mvp, acceptApplication, completeApplication, allOgloszenia } = usePomagaMY()
  const o = getOgloszenieFromAll(id, allOgloszenia)
  const apps = mvp.applications.filter((a) => a.ogloszenieId === id)

  if (!o) {
    return (
      <View style={styles.fallback}>
        <Text>Nie znaleziono ogłoszenia.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Wróć</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <AuthHeader title="Zgłoszenia wolontariuszy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>{o.tytul}</Text>
        <Text style={styles.sub}>#{o.kod} • {o.organizacja}</Text>

        {apps.length === 0 ? (
          <Text style={styles.empty}>Brak zgłoszeń do tego ogłoszenia.</Text>
        ) : (
          apps.map((a) => (
            <View key={a.id} style={styles.card}>
              <Text style={styles.name}>{a.volunteerName}</Text>
              <Text style={styles.email}>{a.volunteerEmail}</Text>
              {a.publicId ? (
                <View style={styles.appIdRow}>
                  <Text style={styles.appId} selectable>
                    Nr zgłoszenia: {a.publicId}
                  </Text>
                  <Pressable
                    onPress={() => void copyTextToClipboard(a.publicId!)}
                    hitSlop={10}
                    style={({ pressed }) => [styles.appCopyBtn, pressed && styles.appCopyBtnPressed]}
                    accessibilityRole="button"
                    accessibilityLabel="Kopiuj numer zgłoszenia"
                  >
                    <Ionicons name="copy-outline" size={20} color={colors.primary} />
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{a.status}</Text>
              </View>
              {a.status === 'oczekujące' && (
                <Pressable
                  style={styles.btn}
                  onPress={() => {
                    Alert.alert('Akceptacja', `Zaakceptować zgłoszenie od ${a.volunteerName}?`, [
                      { text: 'Anuluj', style: 'cancel' },
                      {
                        text: 'Akceptuj',
                        onPress: () => void acceptApplication(a.id),
                      },
                    ])
                  }}
                >
                  <Text style={styles.btnText}>Akceptuj zgłoszenie</Text>
                </Pressable>
              )}
              {a.status === 'zaakceptowane' && (
                <Pressable
                  style={[styles.btn, styles.btnDone]}
                  onPress={() => {
                    Alert.alert('Zakończenie', 'Potwierdzić wykonanie zadania?', [
                      { text: 'Anuluj', style: 'cancel' },
                      {
                        text: 'Zakończ zadanie',
                        onPress: () => void completeApplication(a.id),
                      },
                    ])
                  }}
                >
                  <Text style={styles.btnText}>Zakończ zadanie</Text>
                </Pressable>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  h1: { fontSize: 20, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  name: { fontWeight: '800', fontSize: 16, color: colors.text },
  email: { color: colors.textMuted, marginTop: 4 },
  appId: { color: colors.primary, fontSize: 13, fontWeight: '700', flex: 1, minWidth: 0 },
  appIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  appCopyBtn: { padding: 4 },
  appCopyBtnPressed: { opacity: 0.55 },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  statusText: { fontWeight: '700', color: colors.primary, fontSize: 12 },
  btn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnDone: { backgroundColor: '#15803d' },
  btnText: { color: '#fff', fontWeight: '800' },
  empty: { color: colors.textMuted, marginTop: spacing.lg },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  link: { color: colors.primary, fontWeight: '700', marginTop: spacing.md },
})
