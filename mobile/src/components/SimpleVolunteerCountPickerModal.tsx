import { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

/** Liczba w stylu „3 osoby”, „5 osób” (zgodnie z polską odmianą). */
export function formatVolunteerCount(n: number): string {
  const x = Math.min(99, Math.max(1, Math.round(n)))
  if (x === 1) return '1 osoba'
  const mod10 = x % 10
  const mod100 = x % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${x} osoby`
  }
  return `${x} osób`
}

function parseCount(s: string): number | null {
  const m = s.trim().match(/^(\d+)/)
  if (!m) return null
  const n = Number.parseInt(m[1], 10)
  if (!Number.isFinite(n) || n < 1 || n > 99) return null
  return n
}

const PRESET_COUNTS = [1, 2, 3, 5, 8, 10, 15, 20] as const
const MAX_COUNT = 30
const ALL_COUNTS = Array.from({ length: MAX_COUNT }, (_, i) => i + 1)

type Props = {
  visible: boolean
  value: string
  onClose: () => void
  onConfirm: (liczbaWolontariuszy: string) => void
}

export function SimpleVolunteerCountPickerModal({ visible, value, onClose, onConfirm }: Props) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (!visible) return
    const parsed = parseCount(value)
    setCount(parsed ?? 3)
  }, [visible, value])

  const preview = useMemo(() => formatVolunteerCount(count), [count])

  const handleConfirm = (): void => {
    onConfirm(preview)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Liczba wolontariuszy</Text>
          <Text style={styles.preview}>{preview}</Text>

          <Text style={styles.sectionLabel}>Szybki wybór</Text>
          <View style={styles.presetsWrap}>
            {PRESET_COUNTS.map((n) => {
              const on = count === n
              const label = formatVolunteerCount(n)
              return (
                <Pressable key={n} style={[styles.presetChip, on && styles.presetChipOn]} onPress={() => setCount(n)}>
                  <Text style={[styles.presetChipText, on && styles.presetChipTextOn]}>{label}</Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.sectionLabel}>Inna liczba (1–{MAX_COUNT})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {ALL_COUNTS.map((n) => (
                <Pressable
                  key={n}
                  style={[styles.miniChip, count === n && styles.miniChipOn]}
                  onPress={() => setCount(n)}
                >
                  <Text style={[styles.miniChipText, count === n && styles.miniChipTextOn]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Anuluj</Text>
            </Pressable>
            <Pressable style={styles.btnPrimary} onPress={handleConfirm}>
              <Text style={styles.btnPrimaryText}>Gotowe</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    maxHeight: '88%',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  preview: { fontSize: 15, fontWeight: '600', color: colors.primary, marginBottom: spacing.sm },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  presetsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  presetChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetChipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  presetChipTextOn: { color: '#fff' },
  chipsScroll: { flexGrow: 0, flexShrink: 0, marginBottom: spacing.sm },
  chipsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  miniChip: {
    minWidth: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
  },
  miniChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  miniChipText: { fontSize: 15, fontWeight: '700', color: colors.text },
  miniChipTextOn: { color: '#fff' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnGhostText: { fontWeight: '800', color: colors.textMuted },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  btnPrimaryText: { fontWeight: '800', color: '#fff', fontSize: 16 },
})
