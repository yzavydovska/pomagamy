import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = {
  visible: boolean
  /** Krótki komunikat dla użytkownika (np. „Logowanie…”). */
  message: string
}

/**
 * Pełnoekranowe tło blokujące interakcję podczas operacji auth (logowanie / wylogowanie),
 * żeby nie wyglądało na „zawieszoną” aplikację.
 */
export function AuthBlockingOverlay({ visible, message }: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={() => {}}
      accessibilityLiveRegion="polite"
      accessibilityLabel={message.trim() ? message : 'Ładowanie'}
    >
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.msg}>{message.trim() ? message : 'Przetwarzanie…'}</Text>
          <Text style={styles.sub}>Może to potrwać kilka sekund…</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(246,246,251,0.94)',
    padding: spacing.xl,
  },
  card: {
    alignItems: 'center',
    maxWidth: 320,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl + spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  msg: {
    marginTop: spacing.md,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
})
