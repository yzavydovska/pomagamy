/** Kategorie ogłoszeń — jedna lista dla formularza organizacji i filtrów wolontariusza. */
export const OGLOSZENIA_KATEGORIE = [
  'Społeczne',
  'Pomoc zwierzętom',
  'Seniorzy',
  'Edukacja i mentoring',
  'Ekologia i środowisko',
  'Kultura i sztuka',
  'Sport i rekreacja',
  'Zdrowie',
  'Pomoc humanitarna',
] as const

export type OgloszenieKategoria = (typeof OGLOSZENIA_KATEGORIE)[number]

export const DEFAULT_OGLOSZENIE_KATEGORIA: OgloszenieKategoria = 'Społeczne'

export function normalizeOgloszenieKategoria(raw: string): OgloszenieKategoria {
  const t = raw.trim()
  const exact = OGLOSZENIA_KATEGORIE.find((k) => k === t)
  if (exact) return exact
  const legacy: Record<string, OgloszenieKategoria> = {
    Społeczne: 'Społeczne',
    'Pomoc zwierzętom': 'Pomoc zwierzętom',
    Seniorzy: 'Seniorzy',
    Edukacja: 'Edukacja i mentoring',
    Ekologia: 'Ekologia i środowisko',
    Kultura: 'Kultura i sztuka',
  }
  const mapped = legacy[t]
  if (mapped) return mapped
  return DEFAULT_OGLOSZENIE_KATEGORIA
}
