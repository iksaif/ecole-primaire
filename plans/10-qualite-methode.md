# Plan 10 — Méthode qualité : exercices, niveaux, programme, langues

**But** : beaucoup d'exercices, pour des niveaux différents, qui découlent d'un programme officiel (national et, demain, ceux des langues régionales), et qui
restent cohérents et de bonne qualité dans plusieurs langues.

**Fait** (phases 0 à 4, 2026-10-05 à 2026-10-07) : garde-fous (ESLint de correction, CI, compteurs `npm run qualite`, TypeScript pour tout module nouveau), socle
d'exercice (`src/noyau/`), migration de tous les exercices et affiches publiés vers les définitions (`src/exercices/<id>/`, `src/affiches/<id>/`), langues dans un
registre typé (`src/langues/`), catalogue et build sans clic (fiches JSON et PDF, pages statiques). Le diagnostic de départ, le détail des phases et des lots, les
exemples de départ et le gel des refactors ont rejoint l'historique git (`git log -- plans/10-qualite-methode.md`). Les modèles à suivre sont dans
`src/exercices/README.md`, `src/affiches/README.md` et `AGENTS.md`.

## La méthode : 5 principes

1. **Une activité se déclare, tout le reste en découle.** Chaque exercice a une *définition* qui contient, par
   niveau, les compétences de `programme.ts` qu'il couvre, les réglages qui les produisent, et ce qui est
   « bonus » ou « hors programme ». On en dérive les boutons de niveau, les fiches prégénérées, le catalogue, la couverture et les
   tests. On ne déclare plus de niveau ailleurs.
   **On peut dévier du programme, mais toujours explicitement.** Une option hors programme est permise si elle est
   déclarée (`bonus`, ou `horsProgramme` avec une raison), jamais cochée par défaut, et visible comme telle ; les
   tests la tolèrent parce qu'elle est déclarée. Au départ, **priorité à la couverture** : remplir les 35
   compétences sans activité et les niveaux manquants (CP, CM1-CM2), suivi par `couverture.js` (objectif chiffré,
   qui ne peut que monter).
2. **Logique pure, vue mince.**
   - Générateur et fiche sont des fonctions pures, importables en node, testées en millisecondes :
     `(réglages, rng, T) → questions` puis `questions → fiche`.
   - La vue ne fait que le rendu d'une question.
   - Le jeu (score, retour, fin, timers) et le gabarit de fiche sont communs.
3. **Le hasard a toujours une graine.** Un seul `utils/hasard.js` (`mulberry32`). La graine vient de `?graine=`
   ou est tirée puis gardée. Même graine, même fiche, dans l'app comme au build.
4. **Aucune langue en dur.**
   - Une langue est un dossier qui se déclare : interface, contenu, règles, données sourcées, voix, programme
     propre, activités propres, site.
   - Trois notions distinctes : langue de l'**interface**, langue du **contenu** (fonction de l'activité : `fr`
     pour le français, sinon l'interface) et langues **régionales actives**.
   - Hors du dossier des langues, aucun code de langue n'est écrit en dur.
5. **Les règles sont vérifiées par des machines, pas par la mémoire.** CI sur chaque push. Lint de
   correction. Compteurs qui ne peuvent que baisser : `'br'` en dur, niveaux en texte, vues de plus de
   600 lignes. Tests de contraintes sur les réglages, avant même le rendu.

## Bibliothèques

| Choix | Décision |
|---|---|
| ESLint + eslint-plugin-vue, règles de **correction** seulement | **oui** (phase 0) |
| Prettier, formateur global | non : le style dense est assumé, et cela casserait `git blame` (236 fichiers touchés) |
| CI GitHub Actions (Node 22) | **oui** (phase 0) |
| `node:test` pour l'unitaire | **oui** ; Vitest seulement si on teste un jour des `.vue` |
| @playwright/test à la place du runner maison | **oui** (phase 5) : attentes automatiques, parallélisme, traces |
| TypeScript pour tout module nouveau (`src/noyau/`, programme, hasard, réponses, document) ; JSDoc dans le JS existant | **oui** (décision du 2026-10-05) ; `checkJs` reste désactivé : le JS n'est pas vérifié |
| Vue SSR pour les pages `/telechargements` | **oui** (phase 4) |
| Fluent (`@fluent/bundle`) + Weblate pour la relecture | **plus tard** (phase 3b), après la structure ; Weblate demande un compte (décision de l'utilisateur) |
| **VueUse** (`@vueuse/core`, tree-shaké) : `useLocalStorage(…, { mergeDefaults })` à la place de chargerReglages + watch + sauvegarder (20 vues), `useTimeoutFn` (timers nettoyés), `useEventListener` | **non** (évalué en phase 1, voir ci-dessous) |
| Pinia, seedrandom, composants headless, Paged.js, vite-ssg, vue-i18n, i18next | non : pas de besoin réel, ou contraire à l'esprit du projet |

## Décisions de l'utilisateur après la phase 2c (2026-10-05)

1. Changement de niveau : les réglages repartent des valeurs du nouveau niveau, un bonus n'est jamais reporté.
2. Maternelle : on garde la fin « étoiles » (composant commun) ; le primaire garde le message de fin commun.
3. Exercices sans niveaux (Tables, Calcul posé, Lettres, Ordonner en partie) : niveaux déduits du programme, et
   **on garde l'exercice parce que les enfants l'aiment bien** ; ce qui dépasse le programme est `bonus` ou
   `horsProgramme`, jamais par défaut.
4. Lecture et Quiz : hors du compteur pour l'instant, à reprendre une fois la migration terminée.
5. « Passer » : on enchaîne tout de suite, partout.
6. Pas d'option « accepter les réponses sans accents » pour l'instant.

## Modèle cible des affiches (demande du 2026-10-05)

Exemple et modèle : `src/affiches/` (README.md dans le dossier ; TypeScript ; `definirAffiche` + `choix` ; exemple `src/affiches/exemple/`,
visible sur `/dev/affiches` en développement seulement ; catalogue dérivé en données pures, sérialisables en JSON). Une affiche se **déclare** (`definition`), se **dessine** (`rendu.dessin`, pur) et s'**habille**
du cadre commun (`impression/affiches/cadre.ts`) ; formulaire, catalogue (slug, titre, niveaux, compétences, lien),
test de programme et instantané en découlent. Emplacement `src/affiches/<id>/` en miroir de `src/exercices/<id>/` : une affiche
est une ressource de même rang qu'un exercice (domaine, niveaux, compétences), et `src/impression/` reste le cadre et les
générateurs de fiches. Préparatifs faits : `src/utils/page.ts` (formats et `documentImpression`, purs ; les @font-face sont
fournis par `utils/impression.js` à son chargement), pour que le cadre et les tests tournent sous node.

Décisions de l'utilisateur (2026-10-05), appliquées dans `src/affiches/` :
1. Les affiches riches (alphabet, nombres) entrent dans le modèle : le formulaire générique a des groupes, un ordre, des aides et des
   réglages conditionnels (`formulaire.groupes`, `visibleSi`).
2. Plusieurs pages : `dessin` rend une liste de pages ; cadre, aperçu, test de mise en page et catalogue (`pages`) les comptent.
3. Bilingue au choix de chaque affiche : `langues` + `bilingue` (langues affichées sur la feuille) ou une entrée par langue.
4. `variantes` accepte une fonction pure (sérialisée à l'arrivée).
5. Chaque site publie les langues qu'il propose (`catalogueDe(modules, site)`).
6. Titre personnalisé : option commune du cadre, jamais redéclarée.
7. Police : `{ mode: 'unique', defaut? }` ou `{ mode: 'parType', types, defauts }` ; titre et interface toujours en Andika.
8. Deux formulaires (affiche, exercice) qui partagent leurs briques (`ChoixReglage`, `GroupeReglages`, `ChoixPolice`, aperçu).
9. Graine seulement pour les affiches à hasard (`hasard: true`, `creerRng`).
10. L'entrée de catalogue suffit pour les JSON publics.

## Reste ouvert

- **Fluent (`.ftl`) + Weblate** pour la relecture collaborative du breton : seulement quand un relecteur est trouvé et que l'utilisateur le décide ; les catalogues
  typés (`src/langues/<langue>/textes/`) sont plats, un script les convertirait. Pontoon est l'autre outil possible.
- **`@playwright/test`** à la place du runner maison (`tests/lancer.mjs`, attentes automatiques, parallélisme, traces) : décidé « oui » en phase 5, **pas fait** ;
  le runner actuel (codes de sortie, deux niveaux rapide/complet) fonctionne.
- **Passes de lisibilité** sur le code porté : critères chiffrés (duplication ≥ 8 lignes avec jscpd, complexité cyclomatique et cognitive avec `eslint-plugin-sonarjs`,
  code mort avec knip, fonctions > 50 lignes, fichiers > 300 lignes), en compteurs à cliquet dans `npm run qualite` ; seul `textesRepetes` existe aujourd'hui. À
  reprendre exercice par exercice, avec `npm run instantanes` vert après chaque fonction (l'ordre des tirages du `rng` fait les fiches).
