# Blog na stronie PomagaMY (motyw WordPress)

## Dlaczego link „Blog” lub stopka nie działały

- Kotwice w menu prowadziły wcześniej do adresu `#sekcja` **na tej samej stronie**. Na podstronach (np. zwykła „Strona”) taki link **nie zmieniał URL** i nic nie przewijało.
- W stopce były linki `href="#"` — kliknięcie **nie otwiera** żadnej strony.
- WordPress **nie tworzy bloga w „Stronach”**: wpisy są w **Wpisy**, a adres listy wpisów ustawia się w **Czytaniu**.

## Co zrobić w panelu WordPress (kolejność)

1. **Strony → Dodaj nową**  
   - Utwórz np. stronę **„Blog”** (slug `blog` → adres `/blog/`).  
   - Treść strony może być pusta — WordPress i tak pokaże **listę wpisów** dzięki szablonowi `home.php`.

2. **Ustawienia → Czytanie**  
   - **Strona główna wyświetla**: *statyczną stronę*.  
   - **Strona główna**: wybierz stronę z landingu (np. „Strona główna” z `front-page.php`).  
   - **Strona z wpisami**: wybierz stronę **„Blog”**.  
   - Zapisz zmiany.

3. **Wpisy → Dodaj nowy**  
   - Opublikuj przynajmniej jeden wpis — wtedy na `/blog/` zobaczysz listę.

4. **Opcjonalnie — linki w stopce**  
   - **Polityka prywatności**: *Ustawienia → Prywatność* — wskaż stronę polityki (wtedy link w stopce zadziała).  
   - **Regulamin**: utwórz **Stronę** ze slugiem **`regulamin`** (adres `/regulamin/`).

5. **Bezpośrednie odnośniki**  
   Jeśli adresy typu `/blog/` zwracają 404: *Ustawienia → Bezpośrednie odnośniki* — zapisz ponownie (np. „Nazwa wpisu”).

Po kroku 2 w nagłówku pojawia się link **„Blog”** prowadzący na stronę z wpisami.
