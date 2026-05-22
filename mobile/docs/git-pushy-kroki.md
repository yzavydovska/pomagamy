# Częstsze „małe pushy” na GitHub (`pomagamy` + aplikacja tylko `mobile/`)

## Repozytorium `yzavydovska/pomagamy` (pełny projekt)

1. Rozbij zmianę na logiczny krok (np. tylko `docs`, potem osobny `fix`).
2. W katalogu głównym monorepo:

   ```bash
   git add <konkretne pliki lub mobile/…>
   git commit -m "docs: krótki opis dla widoku GitHub"
   git push origin main
   ```

3. Dobre prefiksy: `feat:`, `fix:`, `docs:`, `chore:` — przy wielu plikach w jednym commicie wpisz w wiadomości najważniejszy powód („dlaczego”).
4. Gdy promotor / promotorka projektu prosi o **„dużo różnych zmian widocznych na GitHubie”**, dodaj **osobny plik** pod `mobile/docs/podsumowanie/` (jeden ticket = jeden commit) lub zaktualizuj **jedno** miejsce w `CHANGELOG.md` — wtedy historia commitów robi się czytelna bez sztucznego dzielenia kodu.

## Repozytorium `yzavydovska/pomagaMY_APP` (sam `mobile/`)

To **inne** historia commitów niż na `main` w `pomagamy`:

- Jedna zbiorcza synchronizacja (np. po kilku dzień zmian na `mobile/`) lub skrypt osobisty z `git subtree split --prefix mobile` / powielenia drzewa tylko `mobile/` jest OK.
- Nie trzeba wypychać **każdego** drobiazgu osobno do `pomagaMY_APP` — ważniejszy jest **`CHANGELOG.md`** i commity widoczne na `pomagamy`.

Jeśli chcesz automatycznego workflow (np. skrypt npm `sync:pomaga-app`), można to dodać w osobnym zadaniu.
