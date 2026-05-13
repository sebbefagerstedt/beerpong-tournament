# 🍺 Beer Pong Turnering
En beer pong-turneringsapp för svensexan. Kör lokalt eller online så att alla kan följa med på sina telefoner.

Hemsida: https://sebbefagerstedt.github.io/beerpong-tournament/ 

## Funktioner

- Round-robin-turnering med valfritt antal lag (2–12)
- Timer per match med övertid
- Live-tabell med poäng och muggar
- **Online-läge** — skapa ett rum så kan andra gå med via rum-ID + PIN
- Fungerar på mobil och desktop

## Användning

### Lokal turnering
Öppna `beerpong.html` i en webbläsare. Ställ in lag, muggar och tid — kör igång.

### Online (flera enheter)
1. Tryck **🔗 Online** → **SKAPA RUM**
2. Dela rum-ID + PIN med de som ska följa med
3. Gästerna öppnar sidan → **🔗 Online** → skriver in rum-ID + PIN → **GÅ MED**
4. Alla ser turneringen i realtid och kan uppdatera poäng

## Deploy

Hostas via GitHub Pages. Pusha till `main` (eller den branch som GH Pages pekar på).

## Tech

- Vanilla HTML/CSS/JS — ingen build-step
- Firebase Realtime Database för online-synk
- Gratis på Firebase Spark-plan
