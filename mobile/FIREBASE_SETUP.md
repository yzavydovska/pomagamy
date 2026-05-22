# Firebase (Auth + Firestore) — PomagaMY

**Produktowo:** aplikacja jest obecnie kierowana **tylko na Android**; konfiguracja Firebase poniżej dotyczy tej samej aplikacji React Native działającej na Androidzie.

Bez pliku `.env` aplikacja działa w **trybie demo** (mocki + lokalna „sesja” admina).  
Gdy ustawisz zmienne `EXPO_PUBLIC_FIREBASE_*`, panel admina używa **Firebase Authentication** i **Cloud Firestore**.

## 1. Projekt w konsoli Firebase

1. [Firebase Console](https://console.firebase.google.com/) → **Dodaj projekt**.
2. **Authentication** → Sign-in method → włącz **E-mail/hasło**.
3. **Firestore Database** → utwórz bazę (tryb testowy na start lub od razu reguły poniżej).

## 2. Konfiguracja w aplikacji

1. W konsoli: **Project settings** (ikona zębatki) → **Your apps** → dodaj aplikację **Web**.
2. Skopiuj obiekt `firebaseConfig` do pliku `mobile/.env` (patrz `.env.example`).
3. Zrestartuj bundler: `npx expo start --clear`.

## 3. Pierwsze konto administratora

1. **Authentication** → **Users** → **Add user** — podaj e-mail i hasło.
2. Skopiuj **UID** tego użytkownika.
3. **Firestore** → kolekcja `users` → **Add document**:
   - **Document ID**: wklej **UID** z Authentication.
   - Pola (przykład):

   | Pole   | Typ    | Wartość              |
   |--------|--------|----------------------|
   | `email` | string | ten sam co w Auth   |
   | `role`  | string | `admin`             |

Dopóki `users/{uid}.role` nie jest `admin`, logowanie z ekranu administratora się nie powiedzie.

## 4. Dashboard administratora — liczniki z bazy

Panel główny admina **sam liczy dokumenty** w Firestore (agregacje `getCountFromServer`), ok. co 18 s:

- **Użytkownicy** — `users` z `role` w `volunteer` / `organization` (bez kont tylko admin).
- **Ogłoszenia** — liczba dokumentów w `ogloszenia`.
- **Zgłoszenia do zadań** — liczba dokumentów w `applications`.
- **Org. do weryfikacji** — `organizations` z `verificationStatus == "pending"`.
- **Skargi** — liczba dokumentów w `complaints`.

**Opcjonalnie** dokument **`admin` / `stats`** może **nadpisać** liczniki z agregacji — ale **tylko** gdy ma pole **`mergeCounts: true`**. Wtedy pola `uzytkownicy`, `ogloszenia`, `zgloszenia`, `doModeracji`, `skargi` z dokumentu zastępują wyniki zapytań (np. Cloud Function). Bez `mergeCounts: true` liczniki pochodzą wyłącznie z agregacji (pozwala to uniknąć sytuacji, gdy szablon dokumentu z samymi zerami kasuje prawdziwe dane).

### Indeks dla „Ostatnia aktywność” (skargi)

Zapytanie: `complaints` sortowane po `createdAt` malejąco. Przy pierwszym uruchomieniu, jeśli w logach pojawi się prośba o **indeks złożony**, utwórz go z linku w konsoli Firebase (Firestore → Indexes).

Jeśli dokumentu `admin/stats` nie ma lub **nie** ma `mergeCounts: true`, liczniki pochodzą wyłącznie z agregacji powyżej.

## 5. Organizacje do weryfikacji

Kolekcja **`organizations`**. Każdy dokument:

- `verificationStatus`: `pending` | `approved` | `rejected` (lista admina pokazuje tylko **`pending`**).
- `verificationRejectionReason` *(string)* — przy **`rejected`**: komunikat dla organizacji wpisywany w aplikacji przez admina; czyszczenie przy zatwierdzeniu albo przy ponownym zgłoszeniu przez organizację (`''`).
- `kod`, `nazwa`, `nip`, `krs`, `email`, `telefon`, `adres`, `www`
- `zgloszonoData`, `zgloszonoPelna` (teksty wyświetlane w UI)
- `dokumenty`: mapa `statut`, `krs`, `nip` (boolean)
- `dokumentyPliki`: tablica map `{ tytul, podtytul }`

**Przykład** (JSON w konsoli przy dodawaniu dokumentu — pola wg potrzeb):

```json
{
  "verificationStatus": "pending",
  "kod": "ORG-892",
  "nazwa": "Fundacja \"Nowa Przyszłość\"",
  "nip": "527-28-14-203",
  "krs": "0000891234",
  "email": "kontakt@example.org",
  "telefon": "+48 22 123 4567",
  "adres": "ul. Leśna 15, Warszawa",
  "www": "www.example.org",
  "zgloszonoData": "02.11.2025",
  "zgloszonoPelna": "02.11.2025, 15:30",
  "dokumenty": { "statut": true, "krs": true, "nip": true },
  "dokumentyPliki": [
    { "tytul": "Statut organizacji", "podtytul": "statut.pdf • 2 MB" }
  ]
}
```

## 6. Reguły Firestore (produkcja — szkic)

Dostosuj do swojej polityki; na start **nie** publikuj na sztywno `allow read, write: if true`.

Przykład idei: tylko zalogowany użytkownik z `users/{uid}.role == "admin"` może pisać w `organizations` oraz czytać i pisać wyłącznie dokument `admin/stats` (nadpisywanie liczników).  
**Teksty interfejsu aplikacji nie są przechowywane w Firestore** — nie twórz pod tego celu kolekcji ani dokumentów (np. tłumaczeń) w bazie.  
Reguły możesz dopracować, gdy pojawią się konta wolontariuszy i organizacji.

## 7. Native / AsyncStorage

Logowanie Firebase na Androidzie/iOS używa **`@react-native-async-storage/async-storage`** do trwałej sesji.  
Przy **własnym dev kliencie** po dodaniu pakietu wykonaj ponownie: `npx expo run:android` (lub iOS).

## 8. Pięć przykładowych ogłoszeń (`ogloszenia`)

- **Tryb bez Firebase**: pięć ogłoszeń jest wczytywane z kodu aplikacji — plik **`mobile/src/data/ogloszenia.ts`** (lista w widoku i szczegółach).
- **Tryb z Firebase**: wolontariusz i przegląd „bez konta” widzą tylko dokumenty z kolekcji **`ogloszenia`**, które mają **`visibleToVolunteers: true`**. Rozkład pól jak przy tworzeniu ogłoszenia przez organizację w aplikacji.

Szablon dokumentów oraz instrukcję dodania przez konsolę masz w folderze **`mobile/sample-data/`** (README + plik **`ogloszenia-seed-firestore.json`** z pięcioma wpisami `sample-ogl-01` … `sample-ogl-05`).
