import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  DEFAULT_OGLOSZENIE_KATEGORIA,
  OGLOSZENIA_KATEGORIE,
  normalizeOgloszenieKategoria,
  type OgloszenieKategoria,
} from '../data/ogloszeniaKategorie'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = {
  visible: boolean
  value: string
  onClose: () => void
  onConfirm: (kategoria: string) => void
}

export function SimpleCategoryPickerModal({ visible, value, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState<OgloszenieKategoria>(DEFAULT_OGLOSZENIE_KATEGORIA)

  useEffect(() => {
    if (!visible) return
    setSelected(normalizeOgloszenieKategoria(value))
  }, [visible, value])

  const handleConfirm = (): void => {
    onConfirm(selected)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Kategoria</Text>
          <Text style={styles.preview}>{selected}</Text>

          <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            <View style={styles.wrap}>
              {OGLOSZENIA_KATEGORIE.map((cat) => {
                const on = selected === cat
                return (
                  <Pressable
                    key={cat}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setSelected(cat)}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{cat}</Text>
                  </Pressable>
                )
              })}
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
  list: { maxHeight: 340 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
