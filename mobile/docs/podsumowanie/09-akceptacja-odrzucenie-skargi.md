# 09 — Zaakceptowanie i odrzucenie skargi (Firebase)

- Na **`AdminComplaintDetailScreen`** przy `params.mode === 'firebase'` moderator ma trzy przyciski statusu moderacji wywołujące **`firebaseSetComplaintModerationAdmin`**:
  - **`Oczekująca`** (`pending`) — przywraca stan przed decyzją.
  - **`Zaakceptuj`** (`resolved`) — skarga uznana / zamknięta pozytywnie („zaakceptowana”); w interfejsie status wyświetlany jako **Zaakceptowana**.
  - **`Odrzuć`** (`rejected`) — skarga odrzucona przez moderatora; wyświetlanie statusu **Odrzucona**.
- Przed zmianą statusu pojawia się **`Alert`** z krótkim opisem (zaakceptowanie vs odrzucenie vs przywrócenie oczekiwania).
- Lista **`AdminComplaintsScreen`** (Firebase): pille statusu są spójne z powyższym oznaczeniem.
