# 🍺 Beer Pong Turnering
En beer pong-turneringsapp för svensexan. Kör lokalt eller online så att alla kan följa med på sina telefoner.

Hemsida: https://sebbefagerstedt.github.io/beerpong-tournament/ 

## Funktioner

- Round-robin-turnering med valfritt antal lag (2–12)
- Timer per match med övertid (timestamp-baserad, synkar korrekt mellan enheter)
- Live-tabell med poäng och muggar
- Möjlighet att ändra resultat även efter avslutad match
- **Online-läge** med rum-ID och rollbaserad åtkomst

## Roller

| Roll | Åtkomst |
|------|---------|
| **Värd** (skapare + de med värd-PIN) | Starta/pausa timer, ändra poäng, återställa matcher, avsluta turnering |
| **Åskådare** (de med åskådar-PIN) | Följa turneringen live, ingen möjlighet att ändra |

## Användning

### Lokal turnering
Öppna `beerpong.html` → ställ in lag, muggar och tid → kör igång.

### Online (flera enheter)
1. Tryck **🔗 Online** → **SKAPA RUM**
2. Du får ett rum-ID + två PIN-koder:
   - **Värd-PIN** — dela med de som ska kunna styra turneringen
   - **Åskådar-PIN** — dela med de som bara ska titta
3. Andra öppnar sidan → **🔗 Online** → skriver in rum-ID + PIN → rollen bestäms automatiskt
4. Om värden stänger fliken/tappar anslutning rensas rummet automatiskt

## Deploy

Hostas via GitHub Pages. Pusha till `main` (eller den branch som GH Pages pekar på).

## Tech

- Vanilla HTML/CSS/JS — ingen build-step
- Firebase Realtime Database för online-synk
- Gratis på Firebase Spark-plan
