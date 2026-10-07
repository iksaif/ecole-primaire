# Plan 11 — La base saine (TypeScript), puis on reporte l'existant

Décision de l'utilisateur, 2026-10-05. On cesse de refactorer l'existant au fil de l'eau. On construit une **base
saine, entièrement en TypeScript**, avec un exercice d'exemple et une affiche d'exemple, puis on **reporte** les
anciens exercices, affiches, impressions un par un contre cette base. Le plan 10 (méthode, socle, exemples) reste la
référence pour le *comment* ; ce plan-ci fixe le *périmètre* et l'*ordre*.

## Règles (valables tant que la base n'est pas validée)
1. **Branche locale `base-saine`.** On ne pousse rien, on ne déploie rien. `main` (= production, commit `f8080e1`
   au moment de la décision) reste intact et sert de référence pour reporter.
2. **L'existant est déconnecté, pas supprimé** : retiré du routeur, de la navigation, des catalogues et du build,
   mais ses fichiers restent là (et sur `main`). On peut le comparer et le reporter. Les tests de l'ancien code sont
   rangés à part (`tests/ancien/`, hors de `npm test`).
3. **Tout ce qu'on écrit ou réécrit est en TypeScript propre** (`erasableSyntaxOnly`, pas d'`enum`, imports avec
   extension `.ts`, `import type`). Quand un module de l'ancien monde nous gêne, on le réécrit, sans
   compatibilité avec l'ancien.
4. **Des fausses entrées de programme, disponibles seulement en développement,** servent aux exemples (un domaine
   `exemple` et quelques compétences), pour que les exemples ne dépendent pas des vraies données. Elles n'entrent
   ni dans un build de production, ni dans la couverture, ni dans le catalogue public.
5. Pas de pression sur les fiches existantes : les instantanés de l'ancien code sont suspendus.

## Ce que doit contenir la base saine
- **Sites** (`src/sites.ts`, typé) : réglages propres à chaque site, choisis par le mode Vite. Par défaut, pour
  **skoolik** : langue régionale breton active, interface en **breton ou français** (breton par défaut) ; pour
  **ecoleprimaire** : interface en français, langue régionale désactivée par défaut mais activable.
- **Langues** (`src/langues/`) : un registre typé. Trois notions séparées : langue de l'**interface**, langue du
  **contenu** (propre à l'exercice) et langue(s) **régionale(s)** actives. Aucun code de langue en dur ailleurs.
  Une langue régionale peut apporter ses données (alphabet, nombres, mots), ses règles, et plus tard son programme.
- **Traductions typées** : le français est la source ; les autres langues doivent avoir exactement les mêmes clés
  (erreur de compilation sinon, ce qui remplace une grande partie de `scripts/i18n.mjs`). Les statuts « à relire »
  restent comptés.
- **Navigation qui marche** : en-tête, pages d'accueil, de réglages (langue d'interface, langue régionale, classe,
  police), de la langue régionale, « À propos », pied de page, et la page `/dev` listant les exemples. Aucune page
  d'exercice ancienne n'est accessible.
- **Les deux exemples** (plan 10) : exercice et affiche, avec leurs formulaires, jeu, impression, tests.
- **Fiches toutes prêtes sans pages HTML statiques** : le build produit `fiches/index.json` (liste, filtres, métadonnées)
  et un JSON par entrée (`fiches/<slug>.json`), plus les PDF et vignettes. `/telechargements` est une **page normale
  de l'app** qui charge ces JSON. Pas de sitemap ni de pages par fiche pour l'instant (on décidera plus tard d'un rendu
  HTML statique pour l'accessibilité ou le référencement, à partir de ces JSON).
- **Qualité** : `npm run types` = 0 erreur, lint, tests de la base (node + un test de fumée Chrome).

## Ordre et agents
1. **Exemples** (deux agents, en cours) — avec de fausses entrées de programme en développement.
2. **Sites + langues + traductions typées** (agent S) : en nouveaux fichiers d'abord ; puis, quand les exemples sont
   terminés, déconnexion de l'existant, routeur et navigation en TypeScript, pages de la base.
3. **Génération des JSON de fiches** (agent E) : schéma, nouveau script de build modulaire en TypeScript, page
   `/telechargements` ; il s'appuie sur les registres des exemples quand ils existent.
4. Validation par l'utilisateur (VS Code, `npm run dev`), puis **reports** un par un.

## Reporter un ancien exercice / une ancienne affiche
Copier la logique utile depuis `main`, la réécrire dans le modèle de l'exemple (définition, générateur pur, fiche,
vue), vérifier contre la version de `main` (fiches comparées à graine égale si on veut les garder), rebrancher dans
la navigation et le catalogue, supprimer l'ancien fichier. Le compteur de `npm run qualite` « fichiers non
reportés » doit ne faire que baisser.

## Fini quand
`npm run dev` et `npm run dev:skoolik` montrent une base saine complète (ci-dessus), `npm run types`, lint et les
tests de la base passent, le build produit les JSON, et l'utilisateur a validé. Alors seulement : reports, puis
fusion dans `main` et déploiement.

## État : fiches PDF et page /telechargements (agent E, 2026-10-05)
Fait : schéma `src/telechargements/` (types, valider, recherche, chargement, useFiches, README), build `scripts/fiches/`
(registres, rendu, produire, assembler, ecrire, commande ; `npm run fiches`, `fiches:dev`), vues `Telechargements.vue` et
`TelechargementsFiche.vue` + `CarteFiche.vue`, routes `/telechargements` et `/telechargements/:slug`, textes
`telechargements` (fr/br), lien dans la navigation, tests `tests/fiches.test.mjs` et `tests/fiches-fumee.test.mjs`.
Rendu : imports directs dans node (modules purs), Chrome seulement pour PDF et images.
Repoussé (anciennement dans `scripts/telechargements.mjs`, resté dans le dépôt) : sitemap, robots.txt, 404.html, manifeste,
image de partage og:image, JSON-LD, pages HTML par fiche, polices locales non redistribuables, fiches « à la main »
(écriture, alphabet, calcul : genre `fiche`, à reporter), exercices reportés (liste `EXERCICES_DE_LA_BASE` de
`scripts/fiches/registres.ts`, vide ; `--avec-anciens` lit l'ancien registre).

## État : sites, langues, shell (agent S, 2026-10-05)

**Fait.** `src/sites.ts` (typé, `SITES` par identifiant, `site()`), `src/langues/` (registre `LANGUES`, type `Langue` dérivé ; un
dossier par langue avec règles, nombres, drapeau, données régionales, voix, `traductionRelue`, emplacement `programme: null` ;
catalogues typés `fr/textes/<section>.ts` en source, `br/textes/<section>.ts` en `satisfies Traductions<typeof fr>` : une clé
manquante, en trop, un pluriel mal formé ne compile pas ; `t('section.cle', params)` avec clés et paramètres `{x}` dérivés du français,
pluriels `Intl.PluralRules` ; `useLangue()`, `useLangueRegionale()`, mêmes clés `localStorage` : `langue_interface`, `langue_regionale`).
Shell en TypeScript (`src/main.ts`, `src/router/index.ts`, `src/App.vue`, `src/shell/`), pages `src/pages/` (accueil, réglages,
langue régionale, à propos, nouveautés ; `/dev` conservée en développement). L'ancien monde est déconnecté (routeur, navigation,
build) : sa table de routes est dans `src/router/ancien-routes.js` (non importée) ; `index.html` lit son titre dans `sites.ts`
(plugin dans `vite.config.js`). Tests de l'ancien code dans `tests/ancien/` ; `npm test` = `sites`, `langues`, `definir`,
`exercices`, `affiches-modele`, `reponses`, `instantanes`, `base` (Chrome : pages fr/br, ecoleprimaire et skoolik).
Compteur `ancienMondeNonReporte` (162 au départ) dans `npm run qualite`.

**Décisions.** (1) L'état de langue est unique pour les deux mondes : `src/i18n/index.js` et l'ancien `useLangueRegionale` relisent
`src/langues/etat.ts`. `useI18n`/`contenu` de l'ancien monde restent pour les exercices pas encore reportés ; `src/noyau/textes.ts`
lit le catalogue typé (section `cadre`, `formulaireAffiche`). (2) `utils/nombres.js`, `i18n/regles.js`, `data/drapeaux.js`,
`site.js` ne sont plus que des raccourcis vers le nouveau code. (3) Une langue régionale est une langue du registre qui a `donnees` ;
si l'interface est dans cette langue et que le site la propose, elle est activée d'office (comme avant). (4) Les fichiers de
l'ancien monde (`activites.js`, `catalogue.js`, `exercices/index.js`…) ne sont pas vidés : plus rien de la base ne les atteint
(compteur) ; les vider casserait les scripts et l'option `avecAnciens` de l'agent E. (5) Pas de recherche globale ni de page
« Programme » : elles dépendent de l'ancien catalogue.

**Difficultés.** Typage des pluriels (le breton a plus de formes que le français : le type `Pluriel` accepte les cinq) ; `satisfies`
ne vérifie les clés en trop que sur un objet littéral frais, d'où un `satisfies` par section et un autre à l'agrégat ; pas de
`any`. `importsBr` (54 pour un seuil de 53) : l'ajout de `exercices/exemple/textes.ts` et `scripts/fiches/assembler.ts` (imports
directs de catalogues bretons) dépasse le seuil, à régler quand les textes des exemples passeront dans `src/langues/`.

**Manque pour la suite.** Porter les catalogues d'interface restants (`commun.js` : valider, quitter, bonus… lu par le noyau via
l'ancien `useI18n`) ; page « À imprimer » (agent E) ; recherche globale ; page « Programme » ; textes des exercices et affiches
dans le système typé (`contenu(langue).t` accepte pour l'instant les seules clés de l'interface).

## État : textes du noyau et des exemples dans le système typé (2026-10-06)
**Fait.** Sections typées `communs` (texte du jeu et des fiches lu par le noyau), `domaines` (noms courts, lus par
`scripts/fiches/assembler.ts`), `exemple`, `exempleCorpus`, `dev` (interface des exemples et des pages /dev), en plus de `cadre` et
`formulaireAffiche`. Le noyau (`src/noyau/`, `src/impression/document.ts`) lit `useLangue()` / `traduire` : `src/noyau/textes.ts` est
supprimé, plus aucun import de `src/i18n/` depuis le noyau, les exemples, `src/affiches/` et `scripts/fiches/` (sauf le pont
`src/exercices/traducteur.ts`).
**Contenu d'un exercice.** `catalogue(français, { br? })` (`src/langues/catalogue.ts`) : le français est la source, une traduction
doit avoir les mêmes clés (compilateur), sans traduction le catalogue est « français seulement » (exemple corpus). `traducteur(cat,
langue | () => langue)` donne le `T` loose du générateur et de la fiche ; `contenuDe` un `t` typé ; `T` lit aussi `communs`. Les
affiches gardent leurs clés à points calculées (`traducteurAffiche`), non typées une à une. `npm run i18n` compte aussi les « à relire »
des catalogues de contenu. Compteur `importsBr` : 55 -> 52 (seuil resserré).
**Reste en ancien système.** Catalogues `src/i18n/**` (ancien monde) ; pont `src/exercices/traducteur.ts` (exercices de
`src/exercices/index.js` au format `{ fr, br }`) ; `scripts/nouveau.mjs` (génère encore vers l'ancien registre et `src/i18n/`, à
réécrire au premier report) ; clés `T('…')` des générateurs non typées (vérifiées par test pour les exemples).
