# 06 — Weryfikacja organizacji (admin)

- **`AdminOrganizationListScreen`**: kolejka podmiotów do sprawdzenia; meta NIP/KRS oraz paski dokumentów (**statut / KRS jeśli był**, NIP jako potwierdzenie danych).
- **`AdminOrganizationDetailScreen`**: odczyt danych, **zatwierdzenie** lub **odrzucenie** z powodem (tekst dla organizacji po stronie kolejnego logowania / panelu organizacji przy chmurze).
- Przepły **`firebaseResubmitOrganizationVerification`**: przy odrzuconej organizacji można wrócić do stanu **`pending`** bez kasowania konta użytkownika.
