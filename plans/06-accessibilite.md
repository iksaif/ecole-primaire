# Plan 06 — Accessibilité

**But** : un site utilisable au clavier et avec un lecteur d'écran, lisible (contrastes, tailles), pour les enfants et les parents en situation de handicap.

## Fait

- Audit automatique : axe-core (`tests/accessibilite.test.mjs`, `tests/outils-axe.mjs`) sur les routes de la base, en français et en breton, à 360 et 1280 px ;
  **aucune violation critique ou sérieuse** exigée par `npm test` (toutes les routes au niveau `test:complet`). Les boutons sans nom accessible sont donc déjà
  détectés sur ces parcours.
- Focus clavier visible partout (`:focus-visible` global dans `src/style.css`), contrastes de texte relevés (`--bleu-fort`, `--texte-doux` : 4,5:1 au moins).

## Reste (à vérifier ou à faire)

1. **Langue des passages** : dans l'interface bretonne, les contenus français (exercices de français, citations) devraient porter `lang="fr"`, et inversement
   (aucun `lang=` posé dans les composants du noyau aujourd'hui).
2. **Passe manuelle** : clavier seul, puis VoiceOver (macOS ou iPad) sur 3 exercices et une fiche ; axe ne voit pas l'ordre de lecture ni la qualité des libellés.
3. **SVG interactifs** (horloge, droite graduée, fractions, quadrillage, symétrie) : nom, `role` et commande au clavier (flèches, espace) ; le coloriage des
   fractions et la symétrie se faisaient seulement à la souris.
4. **Annonces** : les retours (« Bravo », « La bonne réponse était… ») dans une zone `aria-live="polite"` partout où ce n'est pas déjà le cas ; confettis et
   animations : respecter `prefers-reduced-motion` (présent dans quelques composants seulement).
5. **Fenêtres modales** (avis de traduction, recherche) : focus piégé et retour du focus à la fermeture.
6. À discuter : une option d'affichage pour l'interface elle-même (OpenDyslexic existe pour les fiches).

Effort : 1 à 2 jours selon ce que la passe manuelle trouve.
