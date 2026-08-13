# Prezentacja obrony — PomagaMY

Folder zawiera prezentację PowerPoint (8–10 slajdów) w kolorystyce aplikacji mobilnej.

## Pliki

| Plik | Opis |
|------|------|
| `PomagaMY-obrona-pracy.pptx` | Gotowa prezentacja (generowana skryptem) |
| `generate_presentation.py` | Generator — uruchom ponownie po dodaniu filmów |
| `videos/` | Folder na nagrania ekranu aplikacji |

## Struktura slajdów (9)

1. **Tytułowy** — PomagaMY, autor, promotor
2. **Problem i cel**
3. **Architektura systemu**
4. **Demo — Wolontariusz** (film)
5. **Demo — Organizacja** (film)
6. **Demo — Administrator** (film)
7. **Przepływ biznesowy**
8. **Stack technologiczny**
9. **Podsumowanie**

## Jak dodać filmiki

1. Nagraj ekran emulatora/telefonu (np. OBS, wbudowany recorder Androida).
2. Zapisz pliki **MP4** w folderze `videos/`:

   ```
   videos/wolontariusz.mp4
   videos/organizacja.mp4
   videos/admin.mp4
   ```

3. Wygeneruj prezentację ponownie:

   ```powershell
   cd prezentacja-obrona
   python generate_presentation.py
   ```

4. Otwórz `PomagaMY-obrona-pracy.pptx` w PowerPoint i uzupełnij na slajdzie 1: **autor**, **promotor**, **kierunek**.

## Kolorystyka (z aplikacji)

- Primary: `#B67D2B`
- Tło: `#F5F5F5`
- Tekst: `#1A1A1A`

## Wskazówki na obronę

- Slajdy demo (4–6): krótkie nagrania (30–60 s) — lista ogłoszeń, zgłoszenie, panel org, weryfikacja admina.
- Przed obroną otwórz PPTX i uruchom **Slideshow** — sprawdź, czy filmy odtwarzają się lokalnie.
- Jeśli PowerPoint nie odtwarza osadzonego wideo, wstaw ręcznie: **Wstaw → Wideo → To urządzenie** w ramkę na slajdzie demo.
