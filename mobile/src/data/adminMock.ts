/** Dane przykładowe dla panelu administratora, gdy aplikacja działa bez połączenia z bazą. */

/** Zera przed pierwszym udanym odczytem z Firestore — unikamy mylących liczb „demo”. */
export const adminStatystykiPoczatkowe = {
  uzytkownicy: 0,
  ogloszenia: 0,
  zgloszenia: 0,
  doModeracji: 0,
  skargi: 0,
}

/** Dane demonstracyjne wyłącznie przy błędzie agregacji / braku dostępu — nie są z produkcyjnej bazy. */
export const adminStatystyki = {
  uzytkownicy: 847,
  ogloszenia: 142,
  zgloszenia: 56,
  doModeracji: 7,
  skargi: 3,
}

export const adminAktywnosc: { typ: 'ok' | 'reject' | 'block'; tekst: string }[] = [
  { typ: 'ok', tekst: "Zatwierdzono 'Zbiórka' • 1h temu" },
  { typ: 'reject', tekst: "Odrzucono 'Spam' • 2h temu" },
  { typ: 'block', tekst: 'Zablokowano spam_user • 3h temu' },
]

export type SkargaAdmin = {
  id: string
  kod: string
  tytul: string
  zglaszajacy: string
  data: string
  status: 'aktywna' | 'rozpatrzona'
}

export type OrganizacjaDoWeryfikacji = {
  id: string
  kod: string
  nazwa: string
  nip: string
  krs: string
  /** Stan w kolejce weryfikacji (Firestore `organizations.verificationStatus`). */
  verificationStatus: 'pending' | 'approved' | 'rejected'
  /** Tekst dla organizacji przy odrzuceniu (Firestore `organizations.verificationRejectionReason`). */
  verificationRejectionReason?: string
  dokumenty: { statut: boolean; krs: boolean; nip: boolean }
  zgloszonoData: string
  zgloszonoPelna: string
  email: string
  telefon: string
  adres: string
  www: string
  dokumentyPliki: { tytul: string; podtytul: string }[]
}

export const organizacjeOczekujace: OrganizacjaDoWeryfikacji[] = [
  {
    id: 'org1',
    kod: 'ORG-892',
    nazwa: 'Fundacja "Nowa Przyszłość"',
    nip: '527-28-14-203',
    krs: '0000891234',
    verificationStatus: 'pending',
    dokumenty: { statut: true, krs: true, nip: true },
    zgloszonoData: '02.11.2025',
    zgloszonoPelna: '02.11.2025, 15:30',
    email: 'kontakt@4lapy.pl',
    telefon: '+48 22 123 4567',
    adres: 'ul. Leśna 15, Warszawa',
    www: 'www.4lapy.pl',
    dokumentyPliki: [
      { tytul: 'Statut organizacji', podtytul: 'statut_fundacja.pdf • 2.4 MB' },
      { tytul: 'Wpis do KRS', podtytul: 'krs_wpis.pdf • 1.8 MB' },
      { tytul: 'NIP', podtytul: 'nip_zaswiadczenie.pdf' },
    ],
  },
  {
    id: 'org2',
    kod: 'ORG-901',
    nazwa: 'Stowarzyszenie "Dla Zwierząt"',
    nip: '951-22-11-887',
    krs: '0000456789',
    verificationStatus: 'pending',
    dokumenty: { statut: true, krs: true, nip: false },
    zgloszonoData: '01.11.2025',
    zgloszonoPelna: '01.11.2025, 10:15',
    email: 'biuro@dlazwierzat.pl',
    telefon: '+48 12 555 00 11',
    adres: 'ul. Parkowa 3, Kraków',
    www: 'www.dlazwierzat.pl',
    dokumentyPliki: [
      { tytul: 'Statut organizacji', podtytul: 'statut_stowarzyszenie.pdf • 1.1 MB' },
      { tytul: 'Wpis do KRS', podtytul: 'krs.pdf • 900 KB' },
    ],
  },
]

export const skargiAdmin: SkargaAdmin[] = [
  {
    id: 's1',
    kod: 'SK-1042',
    tytul: 'Niewłaściwe zachowanie na czacie',
    zglaszajacy: 'Użytkownik anonimowy',
    data: 'dziś, 09:12',
    status: 'aktywna',
  },
  {
    id: 's2',
    kod: 'SK-1038',
    tytul: 'Podejrzenie oszustwa w ogłoszeniu',
    zglaszajacy: 'jan.k@email.pl',
    data: 'wczoraj',
    status: 'aktywna',
  },
  {
    id: 's3',
    kod: 'SK-1001',
    tytul: 'Spam w wiadomościach',
    zglaszajacy: 'moderacja@org.pl',
    data: '28.10.2025',
    status: 'rozpatrzona',
  },
]
