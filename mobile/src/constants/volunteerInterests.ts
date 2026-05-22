/** Zainteresowania wolontariusza — wybór w edycji profilu; w profilu widać tylko zaznaczone. */
export const VOLUNTEER_INTEREST_OPTIONS = [
  'Zwierzęta',
  'Seniorzy',
  'Środowisko',
  'Sport',
  'Edukacja',
  'Kultura i sztuka',
  'Zdrowie',
  'Dzieci i młodzież',
  'Pomoc humanitarna',
  'IT i technologie',
  'Wydarzenia i festiwale',
  'Społeczność lokalna',
  'Prawa człowieka',
  'Kuchnia i żywność',
  'Prawo i doradztwo',
] as const

export type VolunteerInterestTag = (typeof VOLUNTEER_INTEREST_OPTIONS)[number]
