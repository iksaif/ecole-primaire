# Plan 10 — Couvrir tout le programme de la MS

**But** : chaque compétence de `src/data/programme.js` au niveau `ms` est travaillée sur le site par au moins un
exercice de l'app **et** une fiche ou une affiche, sans sortir des `CONTRAINTES` de la MS ; les exercices sont
utilisables par un enfant de 4 ans qui ne lit pas (consigne dite par `useTTS`, images, gros boutons, aucune
réponse à écrire au clavier).

**Couvre le point du TODO** : « Couverture complète PS, MS, GS, CP, CE1 » (volet MS) ; reprend dans « Maths » :
« formes : bouton MS/GS, solides du cycle 1 ; maternelle : composer/décomposer ».

**Sources relues pour ce plan** (2026-10-04) : `programme.js`, `savoirs.js`, `couverture.html`, `couverture.js`,
`scripts/couverture.mjs`, `activites.js`, `exercices.js`, `catalogue.js`, `affiches/catalogue.js`,
`affiches/formes.js`, `affiches/cadre.js`, `ecriture.js`, les six vues `src/views/maternelle/*.vue`, `useTTS.js`,
`ConfigExercice.vue`, `journal.js`, `tests/programme-maths.test.mjs`, `tests/logique.test.mjs`, `tests/outils.mjs`.
Programmes : BO n° 41 (PDF complet) et BO n° 19 (PDF complet), lus par extraction du texte des PDF (pas d'outil de
rendu de pages installé) ; les pages citées ci-dessous qui ne viennent pas déjà de `programme.js` sont **à vérifier
sur le PDF** (l'extraction perd des mots et les numéros de page sont recalculés).

## 1. État actuel (relevé le 2026-10-04)

Contraintes MS (`CONTRAINTES`, niveau `ms`) : `nombreMax` 6, `comptineMax` 12, `ecritureChiffresMax` 6,
`figures` triangle / carré / disque, `solides` cube / boule / pyramide / cylindre, `lettres: 'prenom'`,
`cursive: 'initiation'`.

**15 compétences au niveau MS.** Rapport `couverture.html` : 6 couvertes (5 par un exercice 🎯, 1 par des
affiches 📘), **9 sans rien**, aucune case verte. Vérifié dans le code :

| Compétence (`id`) | Ce qui la couvre aujourd'hui | Écarts au programme constatés dans le code | Manque |
|---|---|---|---|
| `denombrer-6` | 🎯 `/maternelle/compter` (`CompterView`, bouton MS : 1 à 6, 4 choix) ; fiche « écrire » ou « entourer » ; PDF bilan `exercices-compter-ms` (**non compté** par le rapport, voir constat B) | aucun (nombres ≤ 6) | constituer une collection d'un cardinal donné (le cœur du programme à 4 ans, BO 41 p. 62), comptine jusqu'à 12, tracer les chiffres 1 à 6, représentations constellation / doigts |
| `comparer-quantites` | 🎯 `/maternelle/comparer` (MS : 1 à 5) ; fiche « entoure le groupe qui a le plus » ; bilan `exercices-comparer-ms` (non compté) | la correction du jeu affiche `3 > 2` (`ComparerView`, `repondre()`) : les symboles < et > sont du CP (`comparer-ranger`, c2maths p. 4) ; « le moins » absent ; MS plafonnée à 5 au lieu de 6 | consigne « le moins », fiche « le moins » |
| `composer-decomposer` | rien | — | tout |
| `bande-numerique` | 🎯 `/maternelle/ordonner` (MS : 3 à 5 nombres parmi 1–5, croissant / décroissant) ; bilan `exercices-ranger-ms` (non compté) | fiche : cases séparées par `&lt;` / `&gt;` (`OrdonnerView`, `htmlFiche()`) — symboles du CP ; pas de bande numérique à l'écran : c'est un rangement de nombres (interprétation déjà notée au plan 09) | bande 1–6 lacunaire, placer constellations / doigts / chiffres dans les cases (BO 41 p. 65) |
| `problemes-maternelle` | rien | — | tout (parties-tout, ajout / retrait, position sur une piste, partage) |
| `comparer-longueurs-maternelle` | rien | — | tout |
| `comparer-masses-maternelle` | rien | — | tout (voir décision 2 : soupeser ne se fait pas à l'écran) |
| `formes-maternelle` | 🎯 `/maternelle/formes` (`FormesView`, sans bouton de niveau) ; bilan `exercices-formes-ms-gs` (non compté) | **le rectangle** est dans `FORMES` et `COULEURS_FICHE` : au programme à 5 ans seulement (`CONTRAINTES.ms.figures`) → la fiche MS imprime « rectangle » ; mode « Compter les côtés » = décrire (5 ans) ; mode « Comment s'appelle cette forme ? » = nommer, alors que le BO demande à 4 ans de reconnaître et classer et met en garde contre la dénomination prématurée (BO 41 p. 68) ; triangle et carré toujours dans la même orientation à l'écran (le BO demande de varier, p. 68) ; l'affiche `affiche-formes-planes-cycle-1-2` est notée « GS · CP · CE1 » (pas de variante MS) ; le test `tests/programme-maths.test.mjs` (cas `/maternelle/formes`, `ms`) ne cherche que losange, pentagone, hexagone, ovale, cercle | exercice et fiche MS à 3 formes, affiche MS |
| `solides-maternelle` | rien (`competencesAffiche` donne `solides-maternelle` aux affiches de solides, mais elles sont notées CE1 · CE2 et CM1 · CM2) | — | « les représentations en perspective de solides ne sont pas abordées ou utilisées en maternelle » (BO 41 p. 68) : voir décision 2 |
| `assemblages-maternelle` | rien | — | reproduire un modèle de 5 pièces au plus (BO 41 p. 69) |
| `motifs-maternelle` | rien | — | tout (motifs répétitifs ; les motifs évolutifs sont à 5 ans, p. 70) |
| `jours-mois` | rien (`fiche-ecriture-jours-de-la-semaine-attache` est notée CP · CE1, en cursive Seyès) | — | nommer les jours, la semaine = 7 jours, avant / après, hier / demain (BO 19 p. 24) |
| `syllabes-orales` | rien (le mode « syllabes » de `/lecture` est CP → CE2) | les découpages de `LectureView` sont **écrits** (`feuil·le`, `rou·ge`, `ca·rot·te`) : à l'oral, « feuille » et « rouge » ont une syllabe ; ils ne peuvent pas servir pour l'oral | frapper / compter les syllabes d'un mot entendu |
| `nom-lettres` | 📘 affiches de l'alphabet (`/imprimer/alphabet` et 5 PDF, « MS · GS · CP · CE1 ») | `/maternelle/lettres` est noté GS · CP (`activites.js`, `exercices.js` : `C('gs-cp', null)`) : rien à l'écran en MS ; l'exercice tire 15 lettres de tout l'alphabet, alors qu'à 4 ans ce sont les lettres du prénom et quelques lettres | lettres du prénom, apparier capitale / script / cursive minuscule |
| `geste-ecriture-maternelle` | rien : `/imprimer/ecriture` et toutes les fiches `fiche-ecriture-*` sont notées à partir de la GS (lignage Seyès) | — | capitales à repasser sur bandes larges, son prénom en capitales, graphisme (traits, ronds, ponts, boucles) |

**Constats transversaux**

- A. **Aucune consigne orale** dans les vues maternelle : `useTTS` n'est utilisé que par `LectureView`, `DicteeView`,
  `VocabulaireView`, `GrammaireView`, `ProblemesView`, `HeureView`. Les consignes (« Combien de pommes ? »,
  « Quel groupe a le plus ? ») sont écrites. `useTTS` force `fr-FR` ; les vues qui l'utilisent cachent le bouton
  🔊 en breton (`v-if="langue !== 'br'"`, `HeureView`) : il n'y a pas de voix bretonne (TODO, « Synthèse vocale »).
- B. **Les PDF bilans des exercices maternelle ne comptent pas** dans la couverture : `RESSOURCES`
  (`couverture.js`) ne reprend des exercices que les fiches par compétence (`fichesDe`), et les exercices maternelle
  n'ont pas de `fiches` (choix du plan 09 : « bilan seul »). Les pages `exercices-compter-ms`,
  `exercices-comparer-ms`, `exercices-ranger-ms`, `exercices-formes-ms-gs` existent pourtant.
- C. Niveaux codés en dur : `maxNb()` vaut 6 / 5 / 5 en MS selon la vue (`CompterView`, `ComparerView`,
  `OrdonnerView`) au lieu de `contraintesDe('ms').nombreMax`.
- D. `MaternelleView.vue` liste les cartes à la main (« MS / GS », « GS / CP ») : toute nouvelle vue y ajoute sa carte.
- E. Vie privée : `ConfigExercice` passe `config` à `SignalerErreur` (texte du signalement) et à `ApercuImpression`,
  qui l'envoie à `journaliser('imprimer', { d: reglages })`. **Un prénom saisi ne doit jamais être dans `config`.**

## 2. Propositions

Principes communs à toutes les vues MS :
- un écran = une question ; consigne **dite** à l'arrivée de la question et rejouable par un grand bouton 🔊 ;
  correction dite aussi (« Oui ! Il y en a quatre. ») ; réponses par images, constellations, doigts ou chiffres
  ≤ 6, boutons d'au moins 72 px ; pas de score 💔 affiché (garder les étoiles de fin) ;
- en breton : consigne écrite et pictogramme, pas de 🔊 (voir décision 3) ;
- niveaux tirés de `contraintesDe(niveau)` (pas de 5 / 6 / 10 en dur) ;
- fiche par `htmlFiche()` avec `${ligneNomDate(langue)}` et `<section class="corrige">` ; consigne de la fiche
  courte, lue par l'adulte ; dessins en SVG au trait (coloriables) ;
- chaque nouvelle activité : entrée dans `ACTIVITES` + `COMPETENCES_ROUTES` (`activites.js`), carte dans
  `MaternelleView.vue`, route dans `src/router/index.js`, entrée dans `tests/outils.mjs` (`ROUTES`), entrée
  `LISTE` dans `exercices.js` (bilan par classe, et `fiches` par compétence quand l'exercice a plusieurs
  compétences), catalogues `src/i18n/{fr,br}/views/maternelle/<Vue>.js` (breton marqué `// br: à relire`),
  `npm run i18n` à 0.

### Étape 0 — Corrections et socle (prérequis)

**0.1 Sortir du programme = bug : corrections**
- `FormesView.vue` : bouton de niveau MS / GS (`config.niveau`, mémorisé par `chargerReglages('formes_config', …)`).
  MS = `CONTRAINTES.ms.figures` (disque, carré, triangle), GS = + rectangle. Modes MS : « Trouve la même forme »
  (une forme modèle, 4 choix de tailles et d'orientations différentes) et « Montre le … » (la forme est dite :
  reconnaître, pas nommer). « Comment s'appelle cette forme ? » et « Compter les côtés » : GS seulement.
  Orientation aléatoire et triangles quelconques à l'écran (`rotate`, sommets tirés), comme la fiche le fait déjà.
  Fiche MS : 3 formes, 3 couleurs. Slug : voir décision 1.
- `ComparerView.vue` : correction sans symbole (« Ce groupe en a plus : 4, c'est plus que 2 ») ; MS jusqu'à
  `nombreMax` (6).
- `OrdonnerView.vue` : fiche sans `&lt;` / `&gt;` (flèche « du plus petit au plus grand » au-dessus des cases) ;
  en MS, sens « croissant » par défaut et 3 ou 4 nombres ; jusqu'à 6.
- Tests (`tests/programme-maths.test.mjs`) : ajouter `rectangle: /rectangle/i` à `NOMS_FIGURES` et un cas
  `['/maternelle/formes', 'MS', 'ms', [figures]]` ; un cas `sans(/[<>]|&lt;|&gt;/, 'symbole du CP')` pour
  compter / comparer / ordonner en MS et en GS ; `champ('nombreMax')` reste.
- Fiches générées qui changent volontairement : `exercices-comparer-*`, `exercices-ranger-*`, `exercices-formes-*`
  (le dire dans le commit, comparer le HTML avant / après à graine fixe pour le reste).

**0.2 Couverture : compter les bilans**
- `src/impression/couverture.js` : pour un exercice de `EXERCICES` **sans** `fiches`, ajouter une ressource
  `sorte: 'fiche'`, `slug: exercices-<id>-<classe>`, `competences` = celles de l'activité de même route
  (`ACTIVITES.find(a => a.to === ex.route).competences`), classes `classesDe(c.classe)`. Effet : 📄 en face des
  4 exercices maternelle (et du quiz, hors programme). La page `/programme` n'affiche pas les fiches (TODO) : pas
  d'effet visible.

**0.3 Socle maternelle**
- `src/composables/useConsigneOrale.js` (nouveau, au-dessus de `useTTS`) : `dire(texte)`, `redire()`,
  `direCorrection(ok, texte)`, `disponible` (faux en breton ou sans `speechSynthesis`) ; arrête la voix au
  démontage de la vue. Un composant `src/components/BoutonEcouter.vue` (gros 🔊, `aria-label` traduit).
- `src/utils/maternelle.js` (nouveau, sans dépendance au navigateur, partagé app / fiches) : `constellation(n)`
  (SVG des points du dé, n ≤ 6 ; au-delà, deux dés), `doigts(n)` (SVG d'une ou deux mains), `perle(couleur)`,
  `forme(nom, { angle, taille, plein })` (reprend les SVG de `FormesView` pour qu'ils servent aussi aux motifs et
  aux assemblages).
- Styles communs des vues maternelle (gros boutons de choix, grille d'images) : classes `.mat-*` dans
  `src/style.css`, au lieu des styles `scoped` recopiés de vue en vue.
- Tests : `tests/logique.test.mjs`, `constellation(n)` a n points pour n = 1…6 ; `useConsigneOrale` n'est pas testé
  (dépend du navigateur), mais `tests/routes.test.mjs` passe en breton sans 🔊.

### Étape 1 — Motifs (`motifs-maternelle`) : nouvel exercice

> **Fait (012a2e7, avec la PS)** : « Et après ? » et « Il en manque un », motifs par niveau dans `src/utils/motifs.js`. Reste : « reproduire » / « l'erreur » / « même motif » (GS).


- Vue `src/views/maternelle/MotifsView.vue`, route `/maternelle/motifs`, activité `matiere: 'maths'`,
  `domaine: 'motifs'`, niveaux `['ms', 'gs']`, `competences: ['motifs-maternelle']`.
- À l'écran : un collier de perles (ou une frise de formes, ou d'emojis) ; consigne dite « Quelle perle vient
  après ? ». Modes : **continuer** (le motif s'arrête, 3 perles au choix), **compléter** (un trou au milieu),
  **reproduire** (un collier modèle en haut, l'enfant enfile les perles en touchant les couleurs ; « effacer »).
- Options : éléments (couleurs / formes / images), motif. MS : motifs répétitifs AB, ABB, AAB, ABC ; GS : + AABB,
  ABCD et motifs évolutifs (A AB ABB…), réservés à 5 ans (BO 41 p. 70).
- Fiche : 6 colliers à continuer en coloriant les perles vides (perles au trait), ou à compléter ; corrigé
  coloré. Fiches toutes prêtes : bilan `exercices-motifs-ms`, `exercices-motifs-gs`.
- Tests : `tests/logique.test.mjs` — le générateur de motifs ne produit en MS que des motifs de période ≤ 3 et
  jamais évolutifs (fonction pure exportée d'un module `src/utils/motifs.js`, pas de la vue).
- Effort : 1 à 1,5 jour.

### Étape 2 — Bande numérique et rang (`bande-numerique`, `denombrer-6`)

- `OrdonnerView.vue` : nouveau mode **« La bande numérique »** (à côté de « Ranger ») : une bande de 6 cases
  (MS) ou 10 (GS), une ou deux cases vides ; l'enfant choisit ce qui manque parmi 3 cartes. Option
  « représentation » : chiffres, constellations, doigts, ou mélangé (BO 41 p. 65 : « positionner des
  représentations (constellation, doigts, écriture chiffrée) des nombres ≤ 6 dans les premières cases ; placer un
  objet dans une case correspondant à une position donnée ; compléter une bande numérique lacunaire »).
  Second mode **« Place le jeton »** : « Mets la coccinelle dans la case 4 ».
- Le rang (« montre le 3e wagon ») est au programme à 4 ans (BO 41 p. 64, voir partie 4) : mode
  **« Le train »** si la compétence est ajoutée (décision 6) ; sinon rien.
- Fiche : bandes lacunaires à compléter (écrire le chiffre, ou relier la constellation à sa case).
- `exercices.js` : `choix: ['Ranger', 'Bande numérique', 'Place le jeton']` et `fiches` :
  `F('bande', 'la bande numérique', 'bande-numerique', ['Bande numérique', 'Place le jeton'])` ; le bilan reste.
- Affiche (étape 9) : bande numérique murale 1–6 / 1–10.
- Effort : 1 jour.

### Étape 3 — Compter : constituer une collection et comptine (`denombrer-6`)

- `CompterView.vue`, nouveaux modes :
  - **« Donne-moi… »** : « Mets 4 pommes dans le panier » (chiffre + constellation affichés, nombre dit) ;
    l'enfant touche les pommes d'une réserve de 10 pour les mettre dans le panier (une touche les retire) puis
    « C'est fini ». C'est l'objectif principal à 4 ans (BO 41 p. 62 : « constituer une collection d'un cardinal
    donné »).
  - **« La comptine »** (français seulement, besoin de la voix) : la voix compte « un, deux, … » et s'arrête ;
    l'enfant choisit le nombre suivant parmi 3 boutons qui disent leur nombre au toucher, puis valide. MS jusqu'à
    `comptineMax` (12), GS jusqu'à 30.
  - Option « réponses » : chiffres / constellations / doigts.
- Fiche « Tracer les chiffres de 1 à 6 » : grands chiffres en pointillés à repasser, chacun à côté de sa
  collection (`ecritureChiffresMax`). Réalisée dans `CompterView` (`htmlFiche()`, option « Tracer les chiffres »)
  ou par le générateur d'écriture (étape 6) — un seul des deux (recommandé : écriture, voir étape 6).
- `exercices.js` : `choix: ['Combien', 'Donne-moi']`, pas de `fiches` à part (une seule compétence en MS).
- Tests : cas existants (`champ('nombreMax')`) ; `comptineMax` vérifié sur le corrigé de la comptine si une fiche
  existe.
- Effort : 1 jour.

### Étape 4 — Petits problèmes, composer et décomposer (`composer-decomposer`, `problemes-maternelle`)

- Vue `src/views/maternelle/ProblemesMaternelleView.vue`, route `/maternelle/problemes`, `matiere: 'maths'`,
  `domaine: 'nombres-calcul'`, niveaux `['ms', 'gs']`, `competences: ['composer-decomposer', 'problemes-maternelle']`.
- Modes, tous racontés par la voix et animés (emojis), totaux ≤ 6 en MS, ≤ 10 en GS :
  - **« Les deux mains »** (composer) : deux mains montrent 2 et 3 doigts → « Combien de doigts en tout ? » ;
  - **« Sous le chapeau »** (décomposer, parties-tout) : 5 jetons, le chapeau en cache, on en voit 3 →
    « Combien sous le chapeau ? » (exemple du BO 41 p. 67) ;
  - **« La valise »** (ajout / retrait) : 2 peluches dans la valise, on en ajoute 1 → « Combien maintenant ? » ;
  - **« Le jeu de l'oie »** (position finale) : le pion est sur la case 2, le dé montre 3 → « Où arrive le
    pion ? » (l'enfant touche la case) ;
  - **« Le partage »** : 6 gâteaux pour 2 poupées ; l'enfant les distribue un à un (pas de reste en MS).
- Réponses : 4 cartes (chiffres ou constellations).
- Fiche : 6 petits problèmes illustrés lus par l'adulte (« entoure le bon nombre de points » / « dessine les
  gâteaux de chaque poupée ») ; corrigé.
- `exercices.js` : `choix: ['Les deux mains', 'Sous le chapeau', 'La valise', 'Le jeu de l', 'Le partage']`,
  `fiches: [F('composer', 'composer et décomposer', 'composer-decomposer', ['Les deux mains', 'Sous le chapeau']),
  F('problemes', 'petits problèmes', 'problemes-maternelle', ['La valise', 'Le jeu de l', 'Le partage'])]`.
- Tests : cas `['/maternelle/problemes', 'MS', 'ms', [champ('nombreMax')]]` et GS ; `sans(/[+=−]/)` (pas
  d'écriture additive en maternelle).
- Effort : 2 à 3 jours (animations).

### Étape 5 — Lettres en MS (`nom-lettres`)

- `LettresView.vue` : niveau MS (activité `niveaux: ['ms', 'gs', 'cp']`, `exercices.js` : ajouter `C('ms', '\\bMS\\b')`
  — nouveau slug `exercices-lettres-ms`, le slug `exercices-lettres-gs-cp` ne bouge pas). Modes MS :
  - **« Mon prénom »** : l'adulte tape le prénom dans les réglages ; l'enfant retrouve les lettres de son prénom,
    dans l'ordre, parmi d'autres lettres capitales ; puis reconstitue l'étiquette prénom ;
  - **« La même lettre »** : une capitale → la même capitale (formes proches en distracteurs), puis capitale →
    script minuscule, puis script → cursive minuscule (BO 41 p. 52 : correspondance « scripte majuscule /
    minuscule et cursive minuscule ») ; lettres tirées du prénom et de quelques lettres (voyelles), pas de tout
    l'alphabet.
  - Nom de la lettre dit par la voix en français (en breton : pas de voix, voir décision 3).
- **Prénom** : stocké avec `chargerReglages('lettres_prenom', …)` dans une `ref` **séparée** de `config` (constat
  E : `config` part dans le journal et dans les signalements) ; jamais dans l'URL ; un bouton « Oublier le
  prénom ». Décision 4.
- Fiche MS : « Mon prénom » — l'étiquette en capitales, en script et en cursive, puis une grille de lettres où
  entourer celles du prénom ; sans prénom saisi : les voyelles.
- Effort : 1,5 jour.

### Étape 6 — Écriture en MS (`geste-ecriture-maternelle`)

- `src/impression/ecriture.js` + `EcritureView.vue` : un lignage **« bandes »** (deux traits espacés de 15 mm, ou
  sans ligne) à côté du Seyès ; capitales script en gris à repasser (le mécanisme `repasser` / `gris` existe), en
  pointillés en option.
- Contenus MS : **« Mon prénom en capitales »** (prénom tapé dans le générateur, même précaution que l'étape 5),
  **« Les capitales »** (une lettre par ligne, puis l'alphabet), **« Les chiffres 1 à 6 »**, **« Graphisme »**
  (traits verticaux, horizontaux, ronds, puis ponts, vagues, boucles : préparation de la cursive, BO 41 p. 56,
  « s'initier aux tracés de l'écriture cursive »). Le graphisme est un dessin SVG, pas une police.
- `ACTIVITES` : `/imprimer/ecriture` passe à `de('ms', 'ce2')` (`COMPETENCES_ROUTES` contient déjà
  `geste-ecriture-maternelle`).
- Fiches toutes prêtes (`catalogue.js`, `ECRITURE`, niveaux « MS · GS ») : `fiche-ecriture-capitales-bandes`,
  `fiche-ecriture-chiffres-1-a-6`, `fiche-graphisme-traits-ronds`, `fiche-graphisme-ponts-boucles` (nouveaux
  slugs).
- Tests : `tests/affiches.test.mjs` (rien ne dépasse) pour les nouvelles fiches ; `tests/logique.test.mjs` : la
  fiche « chiffres 1 à 6 » ne contient aucun nombre > `ecritureChiffresMax`.
- Effort : 1,5 à 2 jours.

### Étape 7 — Les jours de la semaine (`jours-mois`)

- Vue `src/views/maternelle/SemaineView.vue`, route `/maternelle/semaine`, `matiere: 'autres'`,
  `domaine: 'temps-espace'`, niveaux `['ms', 'gs']` (GS : mois et saisons plus tard), `competences: ['jours-mois']`.
- À l'écran : **« Le train des jours »** — 7 wagons, la voix dit chaque jour ; un wagon vide → 3 jours au choix
  (boutons qui disent leur nom) ; **« Avant, après »** — « Quel jour vient après mercredi ? » ; **« Hier,
  demain »** — « Aujourd'hui, c'est jeudi. Demain, c'est… ? » (jour du jour tiré de la date, ou choisi).
  BO 19 p. 24 : « savoir que la semaine est une suite de sept jours », « nommer les jours de la semaine »,
  « situer les évènements […] en utilisant les mots aujourd'hui, demain, hier ».
- Breton : listes **vérifiées** de `languesRegionales.js` (`jours` : Lun, Meurzh… ; `jours-di` : Dilun, Dimeurzh…) ;
  ne pas les retraduire. Consignes bretonnes nouvelles : `// br: à relire`.
- Fiche : les 7 étiquettes des jours à découper et à coller dans l'ordre sur un train (lecture par l'adulte ;
  premier jour imprimé comme repère) ; corrigé.
- Affiche : étape 9.
- Effort : 1,5 jour.

### Étape 8 — Syllabes à l'oral (`syllabes-orales`)

- Vue `src/views/maternelle/SyllabesView.vue`, route `/maternelle/syllabes`, `matiere: 'francais'`,
  `domaine: 'lecture'`, niveaux `['ms', 'gs']`, `competences: ['syllabes-orales']`.
- À l'écran : une image (emoji), la voix dit le mot ; l'enfant **frappe** sur un tambour une fois par syllabe
  (chaque frappe allume un rond) puis valide ; ou choisit parmi 1, 2, 3, 4 ronds. MS : mots de 1 à 3 syllabes
  orales ; GS : jusqu'à 4, puis « enlever une syllabe » (5 ans, BO 41 p. 52).
- Données : `src/i18n/fr/contenu/syllabes-orales.js` (nouveau) — `{ emoji, mot, syllabes: ['pa', 'pi', 'llon'] }`
  découpées **à l'oral** (« rouge » : 1 syllabe). Les mots finissant par un e muet (« tomate », « carotte ») se
  comptent différemment selon la diction (2 ou 3) : les éviter et choisir des mots sans ambiguïté (chat, lapin,
  vélo, papillon, crocodile…). Ne pas reprendre la liste de `LectureView`.
- Langue : contenu en français (`enLangue('fr', …)`, règle des exercices de français) et voix nécessaire : voir
  décision 3 pour le site breton.
- Fiche : 8 images, sous chacune 4 ronds ; « colorie autant de ronds que de syllabes » (l'adulte dit le mot) ;
  corrigé.
- Tests : `tests/programme-francais.test.mjs` — chaque mot MS a 1 à 3 syllabes, aucun mot ne finit par un e muet
  précédé d'une consonne (liste à relire par un enseignant).
- Effort : 1,5 jour (dont la liste de mots).

### Étape 9 — Affiches MS (`formes-maternelle`, `bande-numerique`, `denombrer-6`, `jours-mois`)

Toutes par `cadreAffiche()` (`affiches/cadre.js`), entrées dans `AFFICHES_PROGRAMME` et `TELECHARGEMENTS_AFFICHES`
(`affiches/catalogue.js`), compétences dans `competencesAffiche()`.
- **Formes MS** : `LOTS_FORMES['plan-ms'] = { titre: 'Les formes', type: 'figures', liste: ['disque', 'carre',
  'triangle'], simple: true }` ; `formes.js` : avec `simple`, pas de texte `info` (côtés égaux, angles droits :
  cycle 2) ni de légende, formes dans deux orientations. Slug `affiche-formes-ms`, niveaux « MS ».
  `competencesAffiche` : `formes-maternelle`. Pas d'affiche de solides en MS (perspective, décision 2).
- **Bande numérique 1–6 et 1–10** : nouvelle famille `affiches/bande.js` — chaque case : chiffre, constellation,
  doigts, collection. Slugs `affiche-bande-numerique-1-a-6` (MS), `affiche-bande-numerique-1-a-10` (GS) ;
  compétences `bande-numerique`, `denombrer-6` / `denombrer-10` ; `DOMAINES_AFFICHES.bande = 'nombres-calcul'`.
- **La semaine** : nouvelle famille `affiches/semaine.js` — les 7 jours en bandes, en français ou en breton (listes
  vérifiées), A4 / A3 paysage. Slug `affiche-jours-de-la-semaine` (fr ; version bretonne si les affiches du
  programme passent en breton). `DOMAINES_AFFICHES.semaine = 'temps-espace'`.
- Tests : `tests/affiches.test.mjs` (dépassement) et `tests/logique.test.mjs` (bloc « Affiches : domaines et
  niveaux » : `LOTS_FORMES['plan-ms']` ⊂ `CONTRAINTES.ms.figures`).
- Effort : 1 jour.

### Étape 10 — Longueurs et masses (`comparer-longueurs-maternelle`, `comparer-masses-maternelle`)

> **En partie fait (012a2e7)** : `/maternelle/longueurs` « Plus long, plus court » (comparer, ranger 3/4/5 crayons alignés). Reste : crayons non alignés, bande témoin (GS), masses.


- Vue `src/views/maternelle/GrandeursView.vue`, route `/maternelle/grandeurs`, `matiere: 'maths'`,
  `domaine: 'grandeurs-mesures'`, niveaux `['ms', 'gs']`.
- Longueurs : **« Le plus long »** (2 ou 3 serpents / crayons / rubans dessinés, pas toujours alignés au même bout
  — le BO demande de « déplacer des objets pour les mettre à la même origine », p. 70 ; un bouton « aligner »
  montre la comparaison) ; **« Le plus court »** ; **« Range »** (3 objets en MS, jusqu'à 5 en GS, en touchant du
  plus court au plus long).
- Masses (décision 2) : à l'écran, seulement des paires d'objets connus de masses très différentes et **de taille
  trompeuse** (balle de tennis / boule de pétanque, coussin / brique : exemple du BO p. 70) — c'est une
  connaissance, pas une comparaison ; la balance de Roberval est à 5 ans. Option : ne rien faire à l'écran et
  marquer la compétence « manipulation ».
- Fiche : entoure le plus long, colorie le plus court, numérote du plus court (1) au plus long (3).
- `exercices.js` : `fiches: [F('longueurs', 'les longueurs', 'comparer-longueurs-maternelle', ['Le plus long',
  'Le plus court', 'Range'])]` (+ masses si gardées).
- Effort : 1,5 jour.

### Étape 11 — Assemblages (`assemblages-maternelle`)

- `FormesView.vue`, mode **« Le puzzle »** (MS et GS) : un modèle de 3 à 5 formes de couleur sur une grille 3 × 3 ;
  l'enfant pose les mêmes formes aux mêmes places (toucher une case, puis une forme de la réserve). GS : jusqu'à 8
  pièces (BO 41 p. 69), formes accolées (pavage).
- Fiche : le modèle et, en bas, les pièces à découper et à coller sur un cadre vide ; corrigé = le modèle.
- `exercices.js` : `choix` des modes de `FormesView`, `fiches: [F('formes', …, 'formes-maternelle', […]),
  F('puzzle', 'reproduire un assemblage', 'assemblages-maternelle', ['Le puzzle'])]`.
- Effort : 1,5 à 2 jours.

### Couverture attendue après le plan

| Compétence | 🎯 | 📄 | 📘 |
|---|---|---|---|
| denombrer-6 | Compter (+ « Donne-moi », comptine) | bilan, chiffres 1 à 6 | bande numérique |
| comparer-quantites | Comparer | bilan | — |
| composer-decomposer | Petits problèmes | fiche « composer » | — |
| bande-numerique | Ranger (bande, jeton) | fiche « bande » | bande numérique |
| problemes-maternelle | Petits problèmes | fiche « problèmes » | — |
| comparer-longueurs-maternelle | Grandeurs | fiche « longueurs » | — |
| comparer-masses-maternelle | (décision 2) | (décision 2) | — |
| formes-maternelle | Formes MS | bilan MS | Formes MS |
| solides-maternelle | (décision 2 : manipulation) | — | — |
| assemblages-maternelle | Formes « Le puzzle » | fiche « puzzle » | — |
| motifs-maternelle | Motifs | bilan | — |
| jours-mois | Semaine | bilan (étiquettes) | La semaine |
| syllabes-orales | Syllabes | bilan | — |
| nom-lettres | Lettres MS | bilan MS | alphabet |
| geste-ecriture-maternelle | — (fiches seulement) | écriture MS, graphisme | — |

## 3. Ordre conseillé et effort

Chaque étape est livrable seule (un commit, tests ciblés sur le serveur de dev :
`TEST_URL=http://localhost:5173/ecole-primaire/ node tests/<x>.test.mjs`).

| # | Étape | Effort | Pourquoi à ce rang |
|---|---|---|---|
| 1 | 0.1 corrections (formes MS, symboles < >, plafonds 6) + 0.2 bilans comptés | 0,5 à 1 j | bugs au sens d'`AGENTS.md`, rapport juste |
| 2 | 0.3 socle (`useConsigneOrale`, `maternelle.js`, styles) + voix dans les 4 vues existantes | 1 j | tout le reste s'appuie dessus |
| 3 | Motifs | 1 à 1,5 j | compétence entière, sans lecture, peu de risques |
| 4 | Bande numérique (Ordonner) | 1 j | aligne un exercice existant sur le texte |
| 5 | Compter « Donne-moi » + comptine | 1 j | objectif central à 4 ans |
| 6 | Petits problèmes (composer, problèmes) | 2 à 3 j | deux compétences d'un coup |
| 7 | Lettres MS + prénom | 1,5 j | après décision 4 |
| 8 | Écriture MS (bandes, capitales, chiffres, graphisme) | 1,5 à 2 j | dernière compétence sans rien côté fiches |
| 9 | Semaine (exercice) | 1,5 j | |
| 10 | Affiches MS (formes, bande, semaine) | 1 j | après 4 et 9 pour réutiliser les dessins |
| 11 | Syllabes à l'oral | 1,5 j | après décision 3 ; liste de mots à faire relire |
| 12 | Grandeurs (longueurs, masses) | 1,5 j | après décision 2 |
| 13 | Assemblages (puzzle) | 1,5 à 2 j | le plus coûteux en interaction |

Total : 16 à 20 jours. Les étapes 3 à 13 sont indépendantes une fois l'étape 2 faite (agents en parallèle possibles,
fichiers disjoints sauf `activites.js`, `exercices.js`, `MaternelleView.vue`, `tests/outils.mjs` : à fusionner).

## Décisions à prendre (utilisateur)

1. **Slug `exercices-formes-ms-gs`** (publié, ne doit pas changer) : *recommandé* — le garder avec le contenu MS
   (3 formes, valable en MS comme en GS) et ajouter `exercices-formes-gs` (avec le rectangle). Autre choix : le
   garder tel quel et ajouter `exercices-formes-ms` (mais la page « MS · GS » resterait hors programme en MS).
2. **Solides et masses en MS** : le BO exclut la perspective en maternelle et la masse se compare en soupesant.
   *Recommandé* — ajouter à ces compétences un champ `support: 'manipulation'` dans `programme.js` (avec la source
   p. 68 / p. 70), que le rapport et `/programme` affichent en gris « activité de classe » plutôt qu'en rouge ; pas
   d'exercice de solides ; pour les masses, une option « le plus lourd » limitée aux paires du BO (à valider).
3. **Site breton sans voix** : *recommandé* — les exercices MS restent proposés en breton avec consigne écrite et
   pictogramme (l'adulte lit) ; **syllabes** et **comptine** : cachées sur skoolik.app tant qu'il n'y a pas
   d'enregistrements (le contenu serait en français, voix française). Autre choix : enregistrer des fichiers audio
   bretons (TODO « Synthèse vocale »), à budgéter à part.
4. **Prénom de l'enfant** : *recommandé* — saisie locale (navigateur seulement), hors de `config`, jamais envoyé
   (ni journal, ni signalement), bouton « Oublier ». Autre choix : pas de prénom, seulement des lettres choisies.
5. **Couleurs des jours** : *recommandé* — pas de couleur conventionnelle par jour (elles varient d'une classe à
   l'autre) : un fond neutre, l'adulte colorie.
6. **Compléter `programme.js`** (partie 4) avant de coder : *recommandé* — ajouter seulement `rang-maternelle`
   (sert à l'étape 2) ; garder le temps de la journée, l'espace et le vocabulaire pour un plan suivant après avis
   d'un enseignant (plan 07).

## 4. `programme.js` pour la MS : manques et points douteux

Manques (au programme « à partir de 4 ans », absents de `COMPETENCES`) :
- **Rang / ordinal ≤ 6** — BO 41 (PDF complet), vers p. 64 : « Comprendre la notion de rang » ; « montrer le
  premier, […] le sixième élément » d'une suite ordonnée de cardinal ≤ 6. Proposition :
  `c('rang-maternelle', 'nombres-calcul', 'Repérer un rang dans une file (jusqu'à 6, puis 10)', ['ms', 'gs'], src('bo41', 64, …))`
  et sa phrase dans `savoirs.js`.
- **Moments de la journée, hier / aujourd'hui / demain** — BO 19 p. 24 : « Reconnaitre le matin, le midi,
  l'après-midi, le soir, la nuit et le jour » ; « hier, aujourd'hui, demain » (la phrase est dans l'extrait, mais
  `jours-mois` ne cite que les jours).
- **Ordonner les moments d'une histoire simple** — BO 19 p. 25 (à vérifier) : « au début, ensuite et pour finir ».
- **Se repérer dans l'espace** — BO 19 p. 27 (à vérifier) : « situer des objets entre eux », « par rapport à soi »,
  « orienter et utiliser correctement une feuille de papier » ; marqueurs spatiaux (dessus, dessous, devant,
  derrière, à côté, dans) — p. 26-27. Le domaine `temps-espace` s'appelle « Se repérer dans le temps » (`court`)
  alors que le texte officiel inclut l'espace.
- **Oral (domaine `oral`, cycle 1)** : aucune compétence au niveau MS. Candidats : vocabulaire — « organiser les
  mots en catégorie », « trouver un intrus dans une catégorie » (BO 41 vers p. 47) ; comprendre une histoire lue
  (p. 54). Un imagier « l'intrus » avec voix serait facile à faire, mais c'est d'abord une activité orale de
  classe.
- **Phonologie** : « discriminer et identifier des sons, les localiser dans une suite » (BO 41 vers p. 51) ;
  `syllabes-orales` ne couvre que les syllabes.
- **Graphisme** : « tracer quelques formes de base : traits verticaux, horizontaux, points, boucles, cercles »
  (BO 41 p. 56, avant 4 ans) ; rattaché de fait à `geste-ecriture-maternelle` (son libellé MS ne parle que des
  capitales).

Points douteux :
- `comparer-quantites` (MS) : le libellé dit « plus, moins, autant » ; le BO à 4 ans cite les locutions « plus que »
  et « moins que », « autant que » apparaît à 5 ans (BO 41 p. 62-63). Libellé MS à préciser, ou MS = plus / moins.
- `CONTRAINTES.ms.nombreMax = 6` et la comparaison globale : le BO dit « comparer globalement (sans dénombrer)
  […] ne pas se limiter aux petites collections » (p. 62). Un exercice « d'un coup d'œil » (3 contre 12) serait au
  programme mais casserait le test `champ('nombreMax')`. Ajouter une clé (`comparaisonGlobaleMax`, par exemple 20)
  si on le veut.
- `formes-maternelle` : en MS « reconnaître et classer », pas « nommer » (p. 68 : éviter de faire nommer de manière
  prématurée ; « rond » accepté). Notre exercice demande aujourd'hui le nom.
- `solides-maternelle` : au programme, mais seulement en manipulation (p. 68, perspective exclue en maternelle). Et
  `competencesAffiche()` attribue `solides-maternelle` aux affiches de solides en perspective : à retirer (sans effet
  sur le rapport aujourd'hui, ces affiches étant notées CE1 et plus).
- `nom-lettres` (MS) : `CONTRAINTES.ms.lettres = 'prenom'` ; l'extrait parle aussi de « quelques lettres » et de la
  correspondance capitale / script / cursive minuscule : préciser dans `interpretation` ce que « quelques lettres »
  autorise (les voyelles ? les lettres des prénoms de la classe ?) pour qu'un test puisse le vérifier.
- `bande-numerique` : `OrdonnerView` est rattaché à cette compétence alors qu'il range des nombres sans bande ; ce
  rattachement (plan 09 : « interprétation ») ne sera juste qu'avec l'étape 2.
- Correspondance âge → classe (« à partir de 4 ans » = MS) : déjà signalée comme interprétation dans `programme.js`.
- La PS n'existe pas dans `NIVEAUX` (TODO) : plusieurs objectifs « avant 4 ans » (comptine jusqu'à 6, formes de
  base en graphisme) sont des prérequis de la MS que le site ne couvre pas.
