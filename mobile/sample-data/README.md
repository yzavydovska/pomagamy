# Dane przykładowe dla Firestore

## Ogłoszenia (`ogloszenia-seed-firestore.json`)

Ta sama treść pięciu ogłoszeń jest wbudowana w aplikację w pliku [`../src/data/ogloszenia.ts`](../src/data/ogloszenia.ts) dla trybu **bez Firebase**.  
Przy **włączonym Firebase** lista ogłoszeń dla wolontariusza i dla podglądu bez konta pochodzi **wyłącznie z kolekcji** `ogloszenia` w Firestore — wtedy warto zaimportować przykładowe dokumenty ręcznie.

### Kroki (Firebase Console)

1. Firestore Database → kolekcja **`ogloszenia`** (jeśli nie istnieje, utwórz ją przy pierwszym dokumencie).
2. **Add document** → jako **Document ID** wpisz wartość `documentId` z pliku JSON (np. `sample-ogl-01`).
3. Dla każdego pola z obiektu `data`:
   - string → typ **string**
   - `visibleToVolunteers` → typ **boolean** i wartość **`true`** (wymagane do publicznego odczytu wg reguł)
   - `wymagania` → typ **array**, elementy jako **string**
4. Powtórz dla wpisów `sample-ogl-02` … `sample-ogl-05`.

Teksty są skrótem z JSON — pełny opis warto mieć pod ręką w pliku **`ogloszenia-seed-firestore.json`**.

Opcjonalnie możesz dodać pole **`createdByUid`** (tekstowy UID dowolnej zweryfikowanej organizacji), nie jest jednak konieczne do samego przeglądania listy przez wolontariusza.
