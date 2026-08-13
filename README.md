# PomagaMY (`pomagamy`)

Repozytorium pracy dyplomowej: aplikacja wolontariacka i materiały projektu.

## Pakiety aplikacji

| Katalog | Opis |
|---------|------|
| [`mobile/`](mobile/) | Aplikacja **Expo / React Native** — główny produkt (**Android**). Instalacja: [`mobile/README.md`](mobile/README.md). |
| [`web/`](web/) | Warstwa webowa (Vite + React). |
| [`wordpress-landing-wolontariat/`](wordpress-landing-wolontariat/) | Motyw WordPress — landing. |

## Materiały projektu

| Katalog / pliki | Opis |
|-----------------|------|
| [`dokumentacja-projektu/`](dokumentacja-projektu/) | Dokumentacja projektu |
| [`prezentacja-obrona/`](prezentacja-obrona/) | Prezentacja na obronę |
| [`arkusze-moscow/`](arkusze-moscow/), `MOSCOW-*` | Analiza MoSCoW |
| [`figma/`](figma/) | Makiety UI |
| [`raporty/`](raporty/) | Raporty |

## Szybki start (aplikacja mobilna)

```bash
cd mobile
npm install
# skopiuj .env.example → .env i uzupełnij klucze Firebase (opcjonalnie)
npm run start:go
```
