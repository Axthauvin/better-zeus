# Better Zeus Extension - React

Extension pour améliorer l'interface de Zeus (zeus.ionis-it.com) avec un calendrier hebdomadaire interactif pour l'emploi du temps.

## Features

- 📅 Vue hebdomadaire du calendrier (Week view)
- ⚛️ Développé avec React 18 et JSX
- 🎨 Design inspiré d'Untitled UI
- 📱 Interface responsive
- 🔄 Navigation semaine par semaine
- ⏰ Affichage des événements avec créneaux horaires
- ⏱️ Indicateur de l'heure actuelle en temps réel
- ✨ Événements colorés avec détails (titre, heure)

## Installation

### Prérequis

- Node.js 18+ installé
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Build de l'extension

1. Compiler avec webpack :

```bash
npm run build:webpack
```

2. Construire pour votre navigateur :

```bash
npm run build     # Pour Chrome et Firefox
node build.js chrome   # Pour Chrome uniquement
node build.js firefox  # Pour Firefox uniquement
```

### Mode développement

Pour développer avec rechargement automatique :

```bash
npm run dev
```

Puis dans un autre terminal :

```bash
node build.js firefox  # Rebuild après chaque changement webpack
```

### Charger l'extension

#### Chrome / Edge

- Ouvrir `chrome://extensions`
- Activer "Mode développeur"
- Cliquer sur "Charger l'extension non empaquetée"
- Sélectionner le dossier `dist-chrome`

#### Firefox

- Ouvrir `about:debugging#/runtime/this-firefox`
- Cliquer sur "Charger un module complémentaire temporaire"
- Sélectionner le fichier `dist-firefox/manifest.json`

## Utilisation

1. Naviguez vers https://zeus.ionis-it.com/home
2. Le calendrier hebdomadaire s'affichera automatiquement en haut de la page
3. Utilisez les flèches pour naviguer entre les semaines
4. Cliquez sur "Today" pour revenir à la semaine actuelle
5. L'indicateur violet montre l'heure actuelle
6. Les événements s'affichent dans leur créneau horaire correspondant

## Structure du projet

```
better-zeus/
├── src/
│   └── content/
│       ├── index.jsx                    # Point d'entrée
│       └── components/
│           ├── WeekCalendar.jsx         # Composant calendrier semaine
│           └── WeekCalendar.css         # Styles du calendrier
├── dist/                                # Build webpack
├── dist-chrome/                         # Build final Chrome
├── dist-firefox/                        # Build final Firefox
├── manifest.chrome.json                 # Manifest V3 pour Chrome
├── manifest.firefox.json                # Manifest V2 pour Firefox
├── webpack.config.js                    # Configuration webpack
├── build.js                             # Script de build
└── package.json
```

## Technologies

- **React 18** - UI Library
- **date-fns** - Manipulation moderne des dates
- **Webpack 5** - Module bundler
- **Babel** - JSX transpiler
- **CSS3** - Styles
- **Browser Extension API** - Manifest V2/V3

## TODO

- [ ] Intégration avec l'API Zeus pour récupérer les vraies données
- [ ] Ajout de notifications pour les cours à venir
- [ ] Vue mensuelle en plus de la vue semaine
- [ ] Vue journalière détaillée
- [ ] Personnalisation des couleurs par type de cours
- [ ] Export du calendrier (iCal, Google Calendar)
- [ ] Synchronisation avec d'autres calendriers
- [ ] Mode sombre

## Scripts disponibles

- `npm run build` - Build complet (webpack + extension)
- `npm run build:webpack` - Build webpack uniquement
- `npm run dev` - Mode développement avec watch
- `npm test` - Lancer les tests
- `npm run test:watch` - Tests en mode watch

## Licence

MIT
