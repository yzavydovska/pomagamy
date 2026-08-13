export type Ogloszenie = {
  id: string
  
  createdByUid?: string
  
  organizerNip?: string
  organizerKrs?: string
  
  visibleToVolunteers?: boolean
  
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
