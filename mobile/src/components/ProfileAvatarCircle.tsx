import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'

type Props = {
  uri?: string | null
  initials: string
  size?: number
  onPress?: () => void
  /** Jasny obramowanie i inicjały — na kolorowym tle nagłówka profilu */
  hero?: boolean
}

export function ProfileAvatarCircle({ uri, initials, size = 96, onPress, hero }: Props) {
  const dim = { width: size, height: size, borderRadius: size / 2 }
  const inner = (
    <View
      style={[
        styles.circle,
        dim,
        hero && styles.circleHero,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={[styles.image, dim]} resizeMode="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.28) }, hero && styles.initialsHero]}>
          {initials || '?'}
        </Text>
      )}
    </View>
  )
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Zdjęcie profilowe">
        {inner}
      </Pressable>
    )
  }
  return inner
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleHero: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: '#fff',
  },
  image: { backgroundColor: colors.inputBg },
  initials: { fontWeight: '800', color: colors.primary },
  initialsHero: { color: '#fff' },
})
