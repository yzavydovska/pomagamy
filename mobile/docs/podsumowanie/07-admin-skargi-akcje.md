# 07 — Moderacja skarg i kont (admin)

- **`AdminComplaintsScreen`** + **`AdminComplaintDetailScreen`**: status moderacji (`ComplaintModerationStatus`), powiązanie z celem (`refTargetId` / tryb firebase vs mock przy demonstracji bez back-endu).
- Akcje typu **`firebaseSetComplaintModerationAdmin`**, ustawienia **suspend** konta przy zgodnych regułach Firestore (ochrona w `firestore.rules`).
