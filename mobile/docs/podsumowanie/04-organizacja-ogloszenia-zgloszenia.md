# 04 — Ścieżka organizacji: ogłoszenia, zgłoszenia wolontariuszy

- Osobny **`OrgHomeStack`**: lista własnych ogłoszeń, tworzenie nowego (**`OrgNewOgloszenieScreen`**), przegląd **zgłoszonych wolontariuszy** przy ogłoszeniu (**`OrgOgloszenieApplicantsScreen`**).
- Kontekst aplikacji trzyma spójność nazwy organizacji, widoczności ogłoszeń dla wolontariuszy zależnej od **`orgVerificationStatus`** (np. dopiero po zatwierdzeniu przez admina).
- **`ProfilOrgScreen`**: widok dla organizacji, m.in. status weryfikacji oraz możliwość **ponownego złożenia weryfikacji** po odrzuceniu (flow powiązany z Firestore przy chmurze).
