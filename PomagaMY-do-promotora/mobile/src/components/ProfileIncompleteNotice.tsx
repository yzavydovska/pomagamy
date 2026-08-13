import { Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = {
  city?: string
  about?: string
  variant: 'volunteer' | 'organization'
  onEdit: () => void
}

export function ProfileIncompleteNotice({ city, about, variant, onEdit }: Props) {
  const missingCity = !city?.trim()
  const missingAbout = !about?.trim()
  if (!missingCity && !missingAbout) return null

  const bits: string[] = []
  if (missingCity) bits.push('miasto')
  if (missingAbout) {
    bits.push(variant === 'volunteer' ? 'pole „O mnie”' : 'pole „O organizacji”')
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Ionicons name="information-circle" size={22} color={colors.primaryDark} />
        <Text style={styles.title}>Uzupełnij profil</Text>
      </View>
      <Text style={styles.body}>
        Brakuje jeszcze: {bits.join(' oraz ')}. Uzupełnij te pola w edycji profilu — profil będzie czytelniejszy
        dla innych.
      </Text>
      <Pressable style={styles.btn} onPress={onEdit}>
        <Text style={styles.btnText}>Edytuj profil</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.adminWarningBg,
    borderWidth: 1,
    borderColor: colors.adminWarningBorder,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  body: { fontSize: 14, lineHeight: 20, color: colors.textMuted, marginBottom: spacing.md },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
})
