# PomagaMY — aplikacja mobilna (Expo)



**Zakres:** pierwsza wersja produktowa pod **Android** (bez iOS ani `web`).



## Wymagania



- Node.js + npm  

- Android Studio / SDK (np. `npm run android`) lub telefon Android z **development buildem** Expo



## Konfiguracja



1. `npm install`

2. Skopiuj **`.env.example`** → **`.env`** w tym katalogu. Wartości `EXPO_PUBLIC_FIREBASE_*` weź z Firebase Console (**Project settings** → aplikacja **Web** → konfiguracja SDK). Bez `.env` aplikacja startuje w trybie demo (`firestore.rules` w repo musisz wdrożyć samodzielnie w konsoli Firebase).



## Uruchomienie (Android)



```bash

npm run start       # Metro + dev client

npm run android     # expo run:android

```



Szybki podgląd w **Expo Go:** `npm run start:go`.



## Produkcja



iOS i WWW — poza zakresem bieżącej aplikacji.

