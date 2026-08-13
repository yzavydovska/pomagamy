import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { spacing } from '../theme/spacing'
import { copyTextToClipboard } from '../utils/copyToClipboard'

type Props = {
  label: string
  value: string
  last?: boolean
}

function isCopyable(v: string): boolean {
  const t = v.trim()
  return t.length > 0 && t !== '—'
}

export function CopyableIdRow({ label, value, last }: Props) {
  const copyable = isCopyable(value)
  const trimmed = value.trim()

  if (!copyable) {
    return (
      <View style={[styles.row, !last && styles.rowLine]}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <Text style={[styles.rowLabel, styles.rowLabelShrink]}>{label}</Text>
      <View style={styles.valueSide}>
        <Text style={styles.rowValue} selectable>
          {value}
        </Text>
        <Pressable
          onPress={() => void copyTextToClipboard(trimmed)}
          hitSlop={10}
          style={({ pressed }) => [styles.copyBtn, pressed && styles.copyBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Kopiuj: ${label}`}
        >
          <Ionicons name="copy-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: spacing.sm,
  },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowLabelShrink: { flexShrink: 0, maxWidth: '46%' },
  rowValue: { color: colors.text, fontWeight: '600', textAlign: 'right', flex: 1, minWidth: 0 },
  valueSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
    gap: 4,
  },
  copyBtn: { padding: 4 },
  copyBtnPressed: { opacity: 0.55 },
})
