import type { Ogloszenie } from '../types/ogloszenie'

export const ogloszenia: Ogloszenie[] = [
  {
    id: '1',
    tytul: 'Pomoc w schronisku dla psów',
    organizacja: "Schronisko 'Cztery łapy'",
    opis:
      'Poszukujemy wolontariuszy do pomocy w codziennej opiece nad psami w naszym schronisku. Zadania obejmują spacery z psami, karmienie, sprzątanie wybiegów oraz pomoc w socjalizacji zwierząt.',
    data: '10-11.06.2026',
    lokalizacja: 'Warszawa Mokotów',
    kategoria: 'Pomoc zwierzętom',
    status: 'Aktywne',
    godziny: '9:00 - 15:00',
    liczbaWolontariuszy: '5 osób',
    kod: 'OG-362',
    wymagania: [
      'Odpowiedzialność i punktualność',
      'Brak alergii na zwierzęta',
      'Kondycja fizyczna (spacery z dużymi psami)',
    ],
  },
  {
    id: '2',
    tytul: 'Sortowanie żywności — Bank Żywności',
    organizacja: 'Bank Żywności Kraków',
    opis:
      'Pakowanie paczek i sortowanie darów dla rodzin w potrzebie. Mile widziana dobra organizacja i uśmiech.',
    data: 'co środę',
    lokalizacja: 'Kraków Podgórze',
    kategoria: 'Społeczne',
    status: 'Aktywne',
    godziny: '10:00 - 14:00',
    liczbaWolontariuszy: '8 osób',
    kod: 'OG-401',
    wymagania: ['Punktualność', 'Gotowość do pracy stojącej'],
  },
  {
    id: '3',
    tytul: 'Nauka obsługi komputera — seniorzy',
    organizacja: 'DOM Seniora Poznań',
    opis:
      'Pomoc seniorom w podstawach obsługi komputera i internetu. Spotkania co wtorek.',
    data: 'każdy wtorek',
    lokalizacja: 'Poznań Jeżyce',
    kategoria: 'Seniorzy',
    status: 'Aktywne',
    godziny: '14:00 - 17:00',
    liczbaWolontariuszy: '4 osoby',
    kod: 'OG-388',
    wymagania: ['Cierpliwość', 'Znajomość podstaw IT'],
  },
  {
    id: '4',
    tytul: 'Sadzenie drzew miejskich — zieleń dla dzielnic',
    organizacja: 'Stowarzyszenie Zielona Stolica',
    opis:
      'Wspólna akcja sadzenia młodych drzew i pielęgnacja istniejących alejek. Mile widziane ręce do kopania, podlewania i oznaczania młodych sadzonek.',
    data: 'sobota i niedziela, 06-07.06.2026',
    lokalizacja: 'Łódź Bałuty',
    kategoria: 'Ekologia i środowisko',
    status: 'Aktywne',
    godziny: '9:00 – 13:00',
    liczbaWolontariuszy: '15 osób',
    kod: 'OG-512',
    wymagania: [
      'Wygodne obuwie robocze i strój przystosowany do pracy na zewnątrz',
      'Gotowość do pracy fizycznej',
      'Osoby niepełnoletnie tylko z opiekunem',
    ],
  },
  {
    id: '5',
    tytul: 'Warsztaty plastyczne dla dzieci z placówek wsparcia',
    organizacja: 'Fundacja Kolory Świata',
    opis:
      'Prowadzenie prostych zajęć plastycznych (malowanie, lepienie z gliny) dla grupy ok. 10 dzieci. Materiały zapewnia fundacja.',
    data: 'co poniedziałek (od 09.06.2026)',
    lokalizacja: 'Gdańsk Wrzeszcz',
    kategoria: 'Kultura i sztuka',
    status: 'Aktywne',
    godziny: '16:00 – 18:30',
    liczbaWolontariuszy: '6 osób',
    kod: 'OG-627',
    wymagania: ['Wiek min. 18 lat', 'Książeczka sanepidowa / orzeczenie do pracy z dziećmi (mile widziane)', 'Cierpliwość i komunikatywność'],
  },
]

export function getOgloszenie(id: string): Ogloszenie | undefined {
  return ogloszenia.find((o) => o.id === id)
}

export function getOgloszenieFromAll(id: string, all: Ogloszenie[]): Ogloszenie | undefined {
  return all.find((o) => o.id === id)
}
