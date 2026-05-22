# Historia zmian — PomagaMY (mobile)

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).  
Wpisujemy tu funkcje i ustawienia **bez przenoszenia pełnego kodu** między repozytoriami — przydatne do podsumowań dla GitHuba i promotora projektu.

## [Unreleased]

- Zaplanowane kolejne kroki (np. kolejny sprint) wpisuj tutaj lub w osobnym Issues / tablicie.

## [2026-05-22]

### Nawigacja i administrator

- **Ekran powitalny (`Welcome`):** przy braku konfiguracji Firebase (tryb demo) na górze pojawia się wejście do **informacji dla administratora** (trasa `AdminLogin` — tarcza + tekst „Panel administratora…”).
- **`AdminLogin`:** osobny ekran wyjaśnia, że w produkcji z Firebase administrator loguje się **tym samym kontem**, co przy zwykłym logowaniu e-mail/hasło, z rolą `admin` ustawianą w Firestore (`users/{uid}.role`).
- **`RootNavigator`:** ścieżka `AdminLogin` zarejestrowana w stacku głównym obok Welcome / Login / Register.

### Zakres Android

- Jednoznaczny opis produktowy: pierwsze wdrożenie pod **Android** (`README.md`, uproszczony zakres Firebase w `FIREBASE_SETUP.md`).
- **Ikona aplikacji (launcher):** `app.json` wskazuje `assets/welcome2.png`; po stronie Gradle trzeba unikać **`png` i `webp` o tej samej nazwie w `mipmap-*`** oraz po `expo prebuild` ewentualnie ponownie spiąć adaptive icon (`ic_launcher_foreground` we wszystkich rozdzielczościach), żeby nie pojawiał się „celownik” systemowy.

### Rejestracja organizacji

- **Wymagane:** ten sam **NIP** (walidacja z sumą kontrolną), **załączenie statutu** (`ORG_REGISTRATION_STATUT_OPTIONAL = false`).
- **Opcjonalne:** **KRS** — bez numeru pola można zostawić puste (`krsValidationErrorOptional`, dokument `dokumenty.krs` w Firestore tylko przy podanym numerze).

### Dokumentacja w repozytorium

- `firestore.rules` i `storage.rules` w folderze `mobile/` — zestaw pod Firebase (trzeba wdrożyć w konsoli przy publikacji).
- Repozytorium aplikacji tylko z `mobile/` (np. `pomagaMY_APP` na GitHubie) oraz pełniejsze `pomagamy` — opis synchronicznych pushy w [`docs/git-pushy-kroki.md`](docs/git-pushy-kroki.md).
