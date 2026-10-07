# Plan 06 — Accessibilité

**But** : un site utilisable au clavier et avec un lecteur d'écran, lisible (contrastes, tailles), pour les
enfants et les parents en situation de handicap.

## Étapes

1. **Audit automatique** :
   - axe-core via Playwright (`@axe-core/playwright` en devDependency, ou dans /tmp) sur toutes les routes,
     en français et en breton, en modes jeu et impression, plus les pages statiques ;
   - rapport par page : violations, gravité, éléments ;
   - script versionné `scripts/a11y.mjs`.
2. **Corrections attendues** (d'après le code actuel) :
   - boutons-icônes sans nom accessible : 🔊, ⚙️, 🗑, ✕, ◀ ▶, boutons de lettres et d'emojis, pièces et
     billets (MonnaieView), cases des quadrillages (GeometrieView). Ajouter `aria-label` ;
   - **langue des passages** : dans l'interface bretonne, les contenus français (exercices de français,
     citations) doivent porter `lang="fr"`, et inversement ;
   - contrastes : gris clairs (#888, #aaa) sur fond blanc pour les aides et les étiquettes, à vérifier
     (seuil 4,5:1) ;
   - focus visible sur tous les éléments interactifs (`:focus-visible`), y compris `.level-btn` et
     `.lettre-btn` ;
   - SVG interactifs (horloge, droite graduée, fractions, quadrillage) : `role`, nom, et commande au clavier.
     L'horloge a des boutons +/−, à vérifier ; le coloriage des fractions et la symétrie se font seulement à
     la souris aujourd'hui → flèches et espace ;
   - retours des exercices (« Bravo », « La bonne réponse était… ») : zone `aria-live="polite"` ;
   - confettis et animations : respecter `prefers-reduced-motion` ;
   - fenêtres modales (avis de traduction, recherche) : focus piégé et retour du focus à la fermeture.
3. **Lecteur d'écran** : un parcours manuel avec VoiceOver (macOS ou iPad) sur 3 exercices et une fiche.
4. **Police pour la dyslexie** : OpenDyslexic existe pour les fiches. Ajouter une option d'affichage pour
   l'interface elle-même dans les Paramètres ? À discuter.
5. Ajouter `scripts/a11y.mjs` aux tests, avec un échec si une violation « critique » ou « sérieuse »
   apparaît.

## Effort

Audit : 1 heure. Corrections : 1 à 2 jours selon le rapport.
