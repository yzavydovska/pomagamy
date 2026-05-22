# 03 — Ścieżka wolontariusza: ogłoszenia, wiadomości, profil

- Zakładki główne (`MainTabs`): **Ogłoszenia**, **Wiadomości**, **Profil** (`MainTabParamList`).
- Lista ogłoszeń **`OgloszeniaScreen`** oraz szczegóły **`OgloszenieDetailScreen`** (`HomeStack`): kategoria, dane kontaktowe organizacji, snapshot **NIP/KRS** przy publikacji (gdy dostępne).
- **`ReportComplaintScreen`** dostępny z korzenia (`RootNavigator`) — zgłoszenie uwag do treści lub zachowania; potwierdzenia w zakładce wiadomości.
- **`ProfilVolunteerScreen`**: dane osoby, avatar (z **`expo-image-picker`** gdzie dostępne), zainteresowania **`VOLUNTEER_INTEREST_OPTIONS`**.
