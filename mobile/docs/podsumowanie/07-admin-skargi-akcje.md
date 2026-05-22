# 07 — Moderacja skarg i kont (admin)

- **`AdminComplaintsScreen`** + **`AdminComplaintDetailScreen`**: status moderacji (`ComplaintModerationStatus`), powiązanie z celem (`refTargetId` / tryb firebase vs mock przy demonstracji bez back-endu).
- Przy **Firebase**: na szczegółach skargi przyciski **Zaakceptuj** / **Odrzuć** oraz powrót do **oczekująca** (`firebaseSetComplaintModerationAdmin`). Dodatkowo **zawieszanie kont** (`firebaseSetAccountSuspendedAdmin`) przy zgodnych regułach w `firestore.rules`.
