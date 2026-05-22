# 02 — Rejestracja, hasło i typ konta (`Register`)

- Wybór: **wolontariusz** lub **organizacja** (modal picker).
- **Hasło**: polityka siły (min. 8 znaków, litera, cyfra, znak specjalny) — wspólna dla frontu przy rejestracji.
- Organizacja: **nazwa**, **obowiązkowy NIP** (walidacja sumy kontrolnej), **KRS opcjonalny** jeśli podmiot bez wpisu, **statut (plik)** wymagany w produkcji (`ORG_REGISTRATION_STATUT_OPTIONAL = false`).
- Po rejestracji plik statutu przy Firebase trafia do **Storage** (`orgDocs/…`), dokument organizacji dostaje `verificationStatus: pending`.
