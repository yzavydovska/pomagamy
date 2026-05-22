export type Ogloszenie = {
  id: string
  /** Właściciel ogłoszenia w chmurze (opcjonalnie przy danych tylko lokalnych). */
  createdByUid?: string
  /** Snapshot NIP/KRS przy publikacji — wolontariusz może zweryfikować organizację w rejestrach. */
  organizerNip?: string
  organizerKrs?: string
  /** Firebase: widoczne dla wolontariuszy po zatwierdzeniu organizacji. */
  visibleToVolunteers?: boolean
  /** Ukryte z listy wolontariuszy (treść przestarzała / ręczne archiwum). Zwykle razem z `visibleToVolunteers: false`. */
  archived?: boolean
  tytul: string
  organizacja: string
  opis: string
  data: string
  lokalizacja: string
  kategoria: string
  status: 'Aktywne' | 'Zakończone'
  godziny: string
  liczbaWolontariuszy: string
  wymagania: string[]
  kod: string
}
