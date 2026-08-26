# EarthMap Game

Jeu éducatif interactif : trouve les pays ou les monuments sur un globe terrestre rotatif.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **D3** (globe orthographique)
- **Three.js** (fond étoilé + intro hyperspace)
- **GSAP** (animation intro)

## Démarrage

```sh
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | ESLint |

## Comment jouer

1. Sur l’accueil, lance l’intro (hyperspace + alien).
2. Sur `/play`, choisis un mode :
   - **Trouver le pays** — 5 jokers
   - **Trouver le monument** — 2 jokers
3. Clique le pays sur le globe, puis **Valider**.
4. 5 bonnes réponses → victoire ; 5 mauvaises → défaite.

### Contrôles carte

- **Glisser** : faire tourner le globe
- **Molette / pinch** : zoomer (le zoom est conservé pendant le jeu)
- **Cliquer** : sélectionner un pays

## Structure

```
app/           # Routes Next.js (/, /play, /winner, /loser)
components/    # GlobeMap, PlayGame, StarryBackground, GameHud
lib/           # Cache GeoJSON, logique jeu, hyperspace
data/          # monuments.json, translations.json
public/        # assets + world.geojson
types/         # Types TypeScript
```
