import { Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { radius } from '../theme/spacing'

type Props = {
  title: string
  onBack: () => void
}

export function AuthHeader({ title, onBack }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable onPress={onBack} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.back} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
})
