import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'
import { isFirebaseConfigured } from '../firebase/env'

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.root,
        isFirebaseConfigured() && { paddingTop: Math.max(insets.top, spacing.sm) },
      ]}
    >
      {!isFirebaseConfigured() ? (
        <View style={[styles.adminBar, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
          <Pressable
            style={({ pressed }) => [styles.adminLink, pressed && styles.pressed]}
            onPress={() => navigation.navigate('AdminLogin')}
            hitSlop={8}
          >
            <Ionicons name="shield-outline" size={18} color={colors.primary} />
            <Text style={styles.adminLinkText}>Panel administratora (tryb bez Firebase)</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.hero}>
        <Image
          source={require('../../assets/welcome3.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="Ilustracja — PomagaMY"
        />
        <Text style={styles.brand}>PomagaMY</Text>
        <Text style={styles.tagline}>
          Połącz dobre serce z potrzebującymi. Razem tworzymy lepszy świat.
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnPrimaryText}>Zaloguj się</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.btnGhostText}>Zarejestruj się</Text>
        </Pressable>
        <Pressable onPress={() => navigation.replace('Main')} style={styles.skip}>
          <Text style={styles.skipText}>
            {isFirebaseConfigured() ? 'Przeglądaj ogłoszenia bez konta' : 'Kontynuuj bez logowania'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  adminBar: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.inputBg,
  },
  adminLinkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  illustration: {
    width: '100%',
    height: 280,
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  actions: { gap: spacing.md },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  btnGhost: {
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnGhostText: { color: colors.primary, fontWeight: '700', fontSize: 17 },
  pressed: { opacity: 0.88 },
  skip: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { color: colors.textMuted, fontSize: 14 },
})
