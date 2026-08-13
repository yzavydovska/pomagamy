import type { VolunteerEvent } from '../types'

export const events: VolunteerEvent[] = [
  {
    id: '1',
    title: 'Zbiórka żywności dla banków żywności',
    org: 'Fundacja Dobry Start',
    city: 'Warszawa',
    dateLabel: '24 kwi 2026, 10:00–14:00',
    spotsLeft: 8,
    category: 'Społeczne',
    description:
      'Pakowanie paczek i sortowanie darów. Mile widziana dobra organizacja pracy i uśmiech.',
    durationHours: 4,
  },
  {
    id: '2',
    title: 'Spacer z seniorami — Park Skaryszewski',
    org: 'Miejski Ośrodek Pomocy',
    city: 'Warszawa',
    dateLabel: '26 kwi 2026, 11:00',
    spotsLeft: 5,
    category: 'Wsparcie',
    description:
      'Towarzyszenie podczas krótkiego spaceru, rozmowa i pomoc w poruszaniu się po ścieżkach.',
    durationHours: 2,
  },
  {
    id: '3',
    title: 'Korepetycje z języka polskiego',
    org: 'Centrum Integracji',
    city: 'Kraków',
    dateLabel: '28 kwi 2026, 16:00–18:00',
    spotsLeft: 3,
    category: 'Edukacja',
    description:
      'Pomoc dzieciom w odrabianiu lekcji i ćwiczeniu konwersacji. Materiały zapewnia organizacja.',
    durationHours: 2,
  },
  {
    id: '4',
    title: 'Plantacja drzew — las komunalny',
    org: 'Zielona Stolica',
    city: 'Poznań',
    dateLabel: '3 maj 2026, 9:00–13:00',
    spotsLeft: 20,
    category: 'Ekologia',
    description:
      'Sadzenie młodych drzewek przy wsparciu leśników. Obuwie zamknięte i rękawice obowiązkowe.',
    durationHours: 4,
  },
]

export function getEventById(id: string): VolunteerEvent | undefined {
  return events.find((e) => e.id === id)
}
