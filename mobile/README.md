# PomagaMY — aplikacja mobilna (Expo)

**Aktualny zakres:** ta wersja produktu jest **przeznaczona wyłącznie na Androida** — budowanie testów na emulatorze lub urządzeniu oraz docelową dystrybucję zakładamy dla **Android**, nie dla iOS ani przeglądarki (`web`). Skrypty i konfiguracja Expo mogą nadal zawierać pola techniczne pod inne platformy; nie oznacza to wsparcia w pierwszym wydaniu.

## Wymagania

- Node.js + npm  
- Android Studio / SDK (do `npm run android` i emulatora) lub fizyczny telefon Android z deweloperskim lub **development buildiem** Expo

## Konfiguracja

1. `npm install`
2. Skopiuj `mobile/.env.example` → `mobile/.env` i uzupełnij klucze Firebase (szczegóły: `FIREBASE_SETUP.md`).

## Uruchomienie (Android)

```bash
npm run start       # Metro + dev client
npm run android     # kompilacja / uruchomienie na Androidzie (expo run:android)
```

Do szybkich testów aplikacji w **Expo Go** (telefon Android) można użyć `npm run start:go`.

## Produkcja i inne platformy

iOS i strona WWW **nie są** w zakresie bieżącej pracy nad aplikacją — dodanie ich będzie osobnym etapem.
