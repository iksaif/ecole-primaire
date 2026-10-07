# Plan 10 — Couvrir tout le programme de la GS

**But** : chaque compétence de `src/data/programme.ts` travaillée en GS a au moins un exercice de l'app (🎯) et, quand
c'est utile, une fiche (📄) ou une affiche (📘), adaptés à des enfants de 5 ans qui ne lisent pas encore : consigne
dite par la synthèse vocale, images, gros boutons, pas de symbole mathématique (`+`, `=`, `<`, `>` arrivent au CP).

**Couvre le point du TODO** « Couverture complète PS, MS, GS, CP, CE1 » (volet GS).

## Reste à couvrir en GS (relevé du 2026-10-07, `npm run couverture`)

11 compétences du programme de GS n'ont aucune ressource (exercice, fiche ou affiche) :

- `composer-decomposer` (nombres-calcul) : Composer et décomposer les petits nombres (« trois, c’est deux et un »)
- `problemes-maternelle` (nombres-calcul) : Résoudre de petits problèmes : réunir, ajouter, retirer, partager
- `comparer-masses-maternelle` (grandeurs-mesures) : Comparer la masse de deux objets (plus lourd, plus léger)
- `solides-maternelle` (espace-geometrie) : Reconnaître puis décrire cube, pavé, boule, pyramide, cylindre, cône
- `assemblages-maternelle` (espace-geometrie) : Reproduire un assemblage (puzzle, pavage, tour de cubes)
- `chronologie-maternelle` (temps-espace) : Remettre dans l’ordre des moments vécus, puis les étapes d’une histoire
- `reperes-espace` (temps-espace) : Dans, sur, sous, devant, derrière, à côté : situer un objet
- `categories-mots` (oral) : Ranger des mots-images par catégorie, trouver l’intrus
- `syllabes-orales` (lecture) : Scander, compter et manipuler les syllabes d’un mot à l’oral
- `son-lettres` (lecture) : Connaître le son des lettres
- `environnement-proche` (temps-espace) : Reconnaître l’école, le quartier ou le village et ses lieux (mairie, commerces, jardin)

Les sections ci-dessous ne gardent que les propositions qui répondent à ces manques ; les autres sont faites (historique : `git log -- plans/10-couverture-gs.md`). Les noms de fichiers cités (vues `.vue`, `activites.js`, `exercices.js`, `programme.ts`…) sont ceux de l'ancien monde, supprimé : le code d'un nouvel exercice est un module `src/exercices/<id>/` (`npm run nouveau`, voir `src/exercices/README.md`), le programme est `src/data/programme.ts`.
## Socle encore utile

**T5 — Un imagier commun.** `src/data/imagier.js` (données pures, lu par node) : mots simples et imageables avec
`{ mot, emoji, syllabes: n (oral, prononciation standard, e muet final non compté), initiale: 'f' (phonème), rime:
'oul' }`. Choisir des mots sans ambiguïté de découpage oral (éviter « tomate », « fenêtre », dont le nombre de
syllabes varie selon les régions). Réutilise `MOTS` de `src/impression/alphabet.js` quand c'est possible (« abeille »,
« ballon »…). Contenu en français seulement (`enLangue('fr', …)` comme les exercices de français). Sert aux
exercices E1, E2, E3 et aux fiches correspondantes.

## Propositions encore à réaliser

### 2.1 Nombres et calcul

**A1 — Compter : constituer et associer** (`denombrer-10`). Deux modes ajoutés à `CompterView.vue` (cartes
`mode-card` comme Formes et Lettres), le mode actuel devient « Combien ? » :
- « Mets-en N » : une boîte vide et une réserve d'objets ; l'enfant touche les objets pour les mettre dans la boîte
  (toucher un objet de la boîte le retire), puis « J'ai fini ». N est donné, selon une option, par la voix (« Mets
  sept pommes »), un chiffre, une constellation de dé ou des doigts (SVG, réutiliser les points rangés par 5 de
  `representationBrute('unites')`, `src/impression/nombres.js`).
- « Pareil » : un nombre sous une forme (chiffre, constellation, doigts, collection), retrouver la même quantité
  parmi 3 autres formes.
- Champ : 1–`contraintesDe(niveau).nombreMax` (6 / 10).
- Fiche : « Dessine N ronds » (case vide + chiffre ou constellation) et « Relie » (chiffre ↔ constellation), corrigé.
  `exercices.js` : `F('constituer', 'constituer une collection', 'denombrer-10', ['Mets-en'], { classes: ['gs'] })`
  (et `denombrer-6` pour MS).
- Données : rattacher aussi `fiche-ecriture-chiffres` à `denombrer-10` (`competences` de l'entrée dans
  `src/impression/catalogue.js`, `mots[0]` : ajouter `'denombrer-10'` à celles d'`ECRITURE`).
- Tests : `tests/programme-maths.test.mjs`, cas `['/maternelle/compter', 'GS', 'gs', [champ('nombreMax'),
  sansSymboles]]` avec `sansSymboles = sans(/[<>=+]/, 'symbole du CP')`, pour chaque mode.

**A2 — Comparer** : voir T3 ; fiche « entoure celui qui en a le moins » une ligne sur deux. `exercices.js` :
`F('comparer', 'plus, moins, autant', 'comparer-quantites', …, { classes: ['gs'] })`.

**A3 — Nouvelle vue « La bande numérique »** (`bande-numerique`, `denombrer-10`, `problemes-maternelle`).
`src/views/maternelle/BandeView.vue`, route `/maternelle/bande` (garder `/maternelle/ordonner`, slug publié).
Modes :
- « Le nombre caché » : bande 1–10 (MS : 1–6), 1 à 3 cases vides ; l'enfant fait glisser (ou touche puis pose) les
  étiquettes manquantes. C'est l'exemple « compléter une bande numérique lacunaire » (p. 44).
- « Range-le » : une constellation, des doigts ou un chiffre à poser dans la bonne case (p. 44 : « positionner des
  représentations… dans les premières cases de la bande »).
- « Le jeu de l'oie » : un pion sur la case 3, un dé montre 4 → « où arrive le pion ? » (avancer et reculer,
  arrivée ≤ 10). Relie ajout ↔ avancée (p. 44, p. 46 : « déterminer la position finale… sur la bande numérique »).
- Option GS « Compter à rebours » : la voix dit « dix, neuf, huit… », l'enfant touche la case suivante.
- Fiche : bandes lacunaires à compléter (cases, pas de signes), corrigé. `exercices.js` : nouvelle entrée `bande`
  (`classes: [C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')]`, `fiches` : `F('bande', 'la bande numérique',
  'bande-numerique', ['Le nombre caché', 'Range-le'])`).
- **Affiche « La bande numérique de 1 à 10 »** : nouvelle famille `bande` dans `src/impression/affiches/` (`bande.js`
  : `titre`, `dessin`, `css`, comme `droite.js`), une case par nombre avec le chiffre, la constellation et les doigts
  (et le nom en option, décision D6) ; `AFFICHES_PROGRAMME` (`variantes: [{ id: '10', label: 'De 1 à 10', niveaux:
  'GS' }, { id: '6', label: 'De 1 à 6', niveaux: 'MS' }]`), `DOMAINES_AFFICHES.bande = 'nombres-calcul'`,
  `competencesAffiche` → `['bande-numerique', 'denombrer-10']`, entrées `TELECHARGEMENTS_AFFICHES`
  (`affiche-bande-numerique-1-10`, `affiche-bande-numerique-1-6`). Commencer à 0 ou à 1 : décision D1.
- Tests : `tests/logique.test.mjs`, `respecte()` : `if (affiche === 'bande') return +v <= c.nombreMax` ;
  `tests/affiches.test.mjs` passe sur la nouvelle famille ; `tests/outils.mjs` : `/maternelle/bande` dans `ROUTES`
  et `EXERCICES` ; `programme-maths` : `champ('nombreMax')`, `sansSymboles`.

**A4 — Nouvelle vue « Les maisons des nombres »** (`composer-decomposer`). `DecomposerView.vue`, route
`/maternelle/decomposer`. Sans `+` ni `=` (p. 46 : « même s'il n'est pas fait appel aux symboles »).
- « La boîte » : 7 jetons en tout (montrés puis dits), on en cache une partie sous une boîte, 4 restent visibles →
  « combien dans la boîte ? » (réponse : chiffre ou constellation).
- « Les deux mains » : N (≤ 10) montré en chiffre ; une main affiche 5 doigts, combien de doigts sur l'autre ?
- « Les maisons » : maison du 7, étages « 5 et … », « 4 et … » à compléter, avec dominos.
- La voix verbalise la réponse : « sept, c'est cinq et deux » (exemple du programme, p. 42).
- Champ : MS ≤ 6, GS ≤ 10.
- Fiche : maisons des nombres en dominos (« ● ● ● ● ● et ? font 7 »), corrigé. `exercices.js` : entrée
  `decomposer`, `F('decomposer', 'composer et décomposer', 'composer-decomposer', …)`.
- Tests : `champ('nombreMax')`, `sansSymboles`.

**A5 — Nouvelle vue « Petits problèmes »** (`problemes-maternelle`). `ProblemesMaternelleView.vue`, route
`/maternelle/problemes`. Une scène d'emojis animée, l'énoncé dit par la voix (et écrit en petit pour l'adulte),
réponse parmi 4 nombres (chiffre + constellation). Types du programme (p. 44–46), dans cet ordre de difficulté :
réunion (« 3 poissons rouges et 4 poissons jaunes : combien de poissons ? »), ajout, retrait, comparaison avec
« de plus » (« Léa a 6 billes, c'est 2 de plus que Tom : combien en a Tom ? »), déplacement (avec la bande, A3),
partage équitable (avec reste éventuel), groupement. Résultats et données ≤ 10.
- Réutiliser la logique d'énoncés de `ProblemesView.vue` (`useTTS`, `lire(…)` l. 528), mais des gabarits propres dans
  `src/i18n/fr/contenu/problemes-maternelle.js` et `br/…` (`// br: à relire`, prénoms neutres, nombres via
  `regles()` — pas de `if (langue === 'br')`).
- Fiche : la scène dessinée, une case pour dessiner ou écrire le nombre, corrigé. `exercices.js` : entrée
  `problemes-maternelle`, `F('problemes', 'réunir, ajouter, retirer, partager', 'problemes-maternelle', …)`.
- Tests : `champ('nombreMax')`, `sansSymboles`.

### 2.2 Grandeurs et mesures

**B1 — Nouvelle vue « Plus long, plus lourd »** (`comparer-longueurs-maternelle`, `comparer-masses-maternelle`).

> **En partie fait (012a2e7)** : `/maternelle/longueurs` « Plus long, plus court » (comparer, ranger 3/4/5 crayons alignés). Reste : crayons non alignés, bande témoin (GS), masses.

`GrandeursView.vue`, route `/maternelle/grandeurs`.
- « Le plus long » : 2 rubans, crayons ou serpents SVG, pas alignés à gauche (sinon la comparaison est
  immédiate) ; « montre le plus long / le plus court ».
- « Range-les » (GS) : 3 à 5 objets à toucher du plus court au plus long (p. 49 : « au maximum cinq »).
- « La bande témoin » (GS) : deux objets éloignés, une bande à faire glisser sur chacun (comparaison indirecte,
  p. 49).
- « La balance » : une balance de type Roberval penchée (SVG) → « lequel est le plus lourd ? » ; « même masse »
  quand elle est droite ; GS : deux balances (A plus lourd que B, B plus lourd que C) → « le plus lourd des trois »
  (transitivité, p. 49).
- Fiche : colorier le plus long, numéroter du plus court au plus long, entourer le plus lourd sur chaque balance.
  `exercices.js` : entrée `grandeurs`, `F('longueurs', …, 'comparer-longueurs-maternelle', …)`,
  `F('masses', …, 'comparer-masses-maternelle', …)`.
- Tests : aucune unité (`sans(/\b(cm|m|kg|g)\b/, 'unité')`), au plus 5 objets à ranger.

### 2.3 Espace et géométrie

**C1 — Formes** (`formes-maternelle`) : T2 + en GS, formes dessinées avec rotation et proportions aléatoires
(carré et rectangle penchés, triangles quelconques, rectangles très allongés, tailles et couleurs variées : p. 48,
« dans toutes les orientations et dans les configurations les plus générales »). Nouveau mode « Trier » : 8 formes
mélangées, toucher tous les triangles. Le mode « Compter les côtés » propose 0, 3, 4, 5 (pas jusqu'à 8). Fiche
(déjà là : colorier selon une légende) : formes tournées (déjà le cas, `contour(nom, taille, angle)`).
`exercices.js` : `formes` passe de `C('ms-gs', null)` à `C('ms', '\\bMS\\b')`, `C('gs', '\\bGS\\b')` et
`F('formes', 'les formes planes', 'formes-maternelle', …)`. Attention : changer `C('ms-gs')` change les slugs
`/telechargements/exercices-formes-ms-gs/` (slug publié) → garder `ms-gs` pour la fiche existante et ajouter les classes, ou décision.
Affiche : variante GS `plan-gs` de `LOTS_FORMES` (mêmes 4 formes, sans les marques d'angles droits ni « angles
droits » dans `info`) ; `affiche-formes-planes-cycle-1-2` passe à `CP · CE1`… ce qui change ses niveaux, pas son
slug. Test : `programme-maths`, cas MS `sans(/rectangle/i, 'rectangle en MS')`.

**C2 — Nouvelle vue « Les solides »** (`solides-maternelle`). `SolidesView.vue`, route `/maternelle/solides`.
- « Comment s'appelle-t-il ? » : un solide dessiné (réutiliser les dessins `SOLIDES` de
  `src/impression/affiches/formes.js`, à exporter), 4 noms lus par la voix.
- « Trouve les objets » : des objets du quotidien en emoji (🎲 cube, 📦 pavé, ⚽ boule, 🥫 cylindre, 🍦 cône,
  à compléter) → « touche ceux qui ont la forme d'une boule ».
- « Ça roule ? » et « Quelles faces ? » (GS : « le cube a 6 faces carrées » — p. 48 : « préciser oralement la nature
  et le nombre de faces nécessaires à la réalisation d'un cube, d'une pyramide »). Pas de « sommet » ni d'« arête »
  (CE1).
- Liste : `contraintesDe('gs').solides` (cube, pavé, boule, cylindre, cône, pyramide) ; dessin à ajouter :
  pyramide à base triangulaire (p. 48 : « pyramides à base carrée ou triangulaire »). MS : cube, boule, pyramide,
  cylindre.
- Affiche : variante `solides-gs` de `LOTS_FORMES` (`type: 'solides'`), avec un texte par solide adapté à 5 ans
  (« 6 faces carrées », « roule ») : prévoir un champ `infos` par lot pour remplacer `info` ;
  `AFFICHES_PROGRAMME` (`niveaux: 'GS'`), entrée `affiche-solides-gs`. Le test `respecte()` (cas `formes`) vérifie
  déjà la liste contre `c.solides` (ajouter `pyramide-triangle` à `ID_PROGRAMME` → `pyramide`).
- Fiche : relier chaque objet à son solide, corrigé.

**C3 — Assemblages** (`assemblages-maternelle`). Sur écran, reproduire un pavage demande un glisser-déposer avec
rotation, difficile à 5 ans. Proposition en deux temps (décision D5) :
- d'abord une **fiche** « Reproduis le modèle » : un modèle de 4 à 8 formes planes (p. 48 : « au maximum huit »)
  et les pièces à découper sur une seconde page ; générateur dans `FormesView` (mode imprimer, nouvelle option) ou
  fiche toute prête dans le catalogue (`competences: ['assemblages-maternelle']`) ;
- puis, si utile, un mode « Quelle pièce manque ? » dans `FormesView` : une silhouette avec un trou, trois pièces
  candidates (dont une mal tournée).

**C4 — Nouvelle vue « Les motifs »** (`motifs-maternelle`). `MotifsView.vue`, route `/maternelle/motifs`.

> **Fait (012a2e7, avec la PS)** : « Et après ? » et « Il en manque un », motifs par niveau dans `src/utils/motifs.js`. Reste : « reproduire » / « l'erreur » / « même motif » (GS).

- « Et après ? » : une frise (formes et couleurs, réutiliser les SVG de `FormesView` ; emojis) ABAB, AAB, ABC ;
  l'enfant choisit l'élément suivant parmi 3, puis les 3 suivants.
- « L'erreur » : une frise avec un intrus à toucher.
- GS seulement : motifs évolutifs (A B AA BB AAA BBB, p. 51), et « Même motif » : retrouver, parmi 3 frises faites
  d'autres symboles, celle qui a la même structure (p. 51 : « transcrire un motif… en utilisant des symboles
  différents »).
- Fiche : frises à continuer (formes au trait à colorier, légende), corrigé. `exercices.js` : entrée `motifs`,
  `F('motifs', 'continuer un motif', 'motifs-maternelle', …)`.
- Tests : nouvelle vérification simple (le motif évolutif n'apparaît pas en MS : attribut `data-type` sur la frise
  de la fiche).

### 2.4 Se repérer dans le temps

**D1 — Nouvelle vue « Les jours et les mois »** (`jours-mois`). `CalendrierView.vue`, route
`/maternelle/calendrier`.
- « La semaine » (MS, GS) : 7 cases, un ou deux jours manquants à replacer ; « Aujourd'hui, c'est mardi : et
  demain ? hier ? » (dit par la voix ; p. 54).
- « Les mois » (GS) : frise des 12 mois, un mois manquant ; « Quel mois vient après mars ? ».
- « Les saisons » (GS) : image → saison (🌸 ☀️ 🍂 ❄️ + scènes) ; mois repère → saison.
- Réutiliser les noms de `src/i18n/{fr,br}/contenu/mesures.js` (`jours`, `mois`, vérifiés) et la logique `demain`,
  `hier`, `moisApres`, `moisAvant` de `MesuresView.vue`. En breton, les jours et les mois sont sûrs ; les **saisons
  ne sont pas vérifiées** → `// br: à relire`.
- Affiches : nouvelle famille `calendrier` (`src/impression/affiches/calendrier.js`) : « Les jours de la semaine »
  (`MS · GS`) et « Les mois et les saisons » (roue de l'année, `GS`) ; `DOMAINES_AFFICHES.calendrier =
  'temps-espace'`, `competencesAffiche` → `['jours-mois']` ; versions bretonnes possibles pour la semaine et les
  mois (données vérifiées), pas pour les saisons tant qu'elles ne sont pas relues.
- Fiche : compléter la semaine, colorier la saison, corrigé.
- Tests : `respecte()` (`calendrier` : `GS` pour les mois et saisons, `MS` permis pour la semaine seulement) ;
  `affiches.test.mjs`.

### 2.5 Lecture (habiletés phonologiques, lettres)

**E1 — Nouvelle vue « Les syllabes »** (`syllabes-orales`). `SyllabesView.vue`, route `/maternelle/syllabes`,
contenu de l'imagier (T5), voix française.
- « Combien ? » : une image, la voix dit le mot ; l'enfant tape sur un tambour à chaque syllabe (un rond se remplit
  par tape) puis valide ; ou choisit 1, 2, 3, 4 ronds.
- « Pareil au début » (GS) : quelle image commence par la même syllabe que « lapin » ? (lavabo, mouton, vélo).
- « Sans la syllabe » (GS) : « dis "lapin" sans "la" » → choisir l'image qui correspond (pin 🌲) ; ne garder que
  les cas qui donnent un vrai mot imageable.
- Fiche : images + ronds à colorier (un par syllabe), « relie les images qui commencent pareil », corrigé.
  `exercices.js` : entrée `syllabes` (groupe `francais`), contenu toujours en `fr`.
- Tests : données de `imagier.js` (test node dans `logique.test.mjs` : chaque mot a un emoji, `syllabes` entre 1 et
  4, pas de doublon, `initiale` dans la liste des phonèmes permis) ; route dans `tests/outils.mjs`.

**E2 — Nouvelle vue « J'entends »** (`son-lettres` ; rimes et phonèmes, voir § 4). `SonsView.vue`, route
`/maternelle/sons`.
- « Ça rime » : « quelle image rime avec poule ? » (boule, roule, moule… — p. 9 et p. 15).
- « Le son du début » : « touche l'image qui commence par [f] » ; la voix dit les mots, pas le phonème isolé (la
  synthèse vocale prononce mal un son seul). Seulement les voyelles et les consonnes continues citées p. 15
  (s, r, f, v, j, ch, l ; m et n à décider) : **pas d'occlusives** (p, b, t, d, k, g).
- « L'intrus » : trois mots, un ne commence pas pareil (sac / Sacha / cartable, p. 14).
- « La lettre et son son » (`son-lettres`) : une lettre (script et cursive) et trois images → celle qui commence par
  le son de la lettre.
- Discriminer on/an/un et les paires ch/s, ch/j (p. 11 et 14) : à tester avec la synthèse vocale avant de
  l'annoncer (décision D2).
- Fiche : entourer les images qui commencent par le son de la lettre ; relier les rimes ; corrigé.

**E3 — Les lettres en GS** (`nom-lettres`). Dans `LettresView.vue` (après T3) :
- « Écoute et trouve » : la voix dit le nom de la lettre (table `NOMS_LETTRES` dans le contenu fr : « a », « bé »,
  « cé »… « double vé » ; ne pas laisser la synthèse lire un caractère seul), l'enfant la touche parmi 4.
- « Script et attaché » : une lettre en script, retrouver la même en cursive (police `POLICE_ATTACHE`, via
  `usePolices` / `cssPolices`) et l'inverse (p. 15 : « différentes graphies d'une même lettre »).
- « Lettres jumelles » : b/d, p/q, c/e/o (p. 15), présentées en script puis en cursive.
- `exercices.js` : `lettres` passe à des classes séparées (même remarque de slug que C1 :
  `exercices-lettres-gs-cp` est publié), fiches `F('graphies', 'capitale, script, attaché', 'nom-lettres', …)`.
- Fiche : relier script ↔ attaché, entourer les b (pas les d), corrigé.
- Breton : l'alphabet breton est déjà géré (`alphabetDe`) ; noms des lettres bretons **non vérifiés** → le mode
  « Écoute » est caché en breton (pas de voix de toute façon).

## 3. Ordre conseillé, effort, décisions

### 3.1 Étapes restantes (chacune livrable seule)

| # | Étape | Compétences gagnées | Effort |
|---|---|---|---|
| 1 | A4 Décomposer | `composer-decomposer` | 1 j |
| 2 | T5 imagier + E1 Syllabes | `syllabes-orales` | 2 j (dont la constitution et la relecture des données) |
| 3 | E2 Sons + E3 Lettres GS | `son-lettres` | 2 j |
| 4 | A5 Petits problèmes | `problemes-maternelle` | 2 j |
| 5 | B1 Grandeurs (masses) | `comparer-masses-maternelle` | ½ j |
| 6 | C2 Solides (exercice), C1 orientations et « Trier » | `solides-maternelle` | 1 j ½ |
| 7 | C3 Assemblages (fiche) | `assemblages-maternelle` | 1 j |
| 8 | D1 repères dans le temps et l'espace | `chronologie-maternelle`, `reperes-espace`, `environnement-proche` | à chiffrer |

`categories-mots` (oral) : voir le plan PS, 3.2 (« Range les images »).

### 3.2 Décisions à prendre

1. **D1 — Bande numérique : de 0 ou de 1 ?** Le programme parle des « premières cases » et des nombres « inférieurs ou
   égaux à dix » (p. 44) ; en maternelle, la bande commence d'habitude à 1 (la case 1 = le premier). *Reco : 1 à 10
   (et 1 à 6 en MS), la droite graduée de 0 restant au CP.*
2. **D2 — Exercices oraux sur skoolik.app (breton).** Pas de voix bretonne. *Reco : contenu phonologique en français
   (comme les exercices de français), bouton 🔊 caché en breton (modèle `HeureView`) ; les exercices de nombres,
   formes, motifs, calendrier restent entièrement traduits. Un imagier breton enregistré viendra avec le point TODO
   « enregistrements audio ». Et ne pas annoncer les paires minimales (on/an, ch/s) avant un essai de la synthèse
   vocale.*
3. **D3 — Fiches d'écriture « Lettre A… Z » et « Alphabet attaché majuscule » étiquetées GS.** *Reco : retirer GS de
   leurs niveaux (les fiches « Lettre X » deviennent CP · CE1 ; l'attaché majuscule seulement CE1, ce qui règle aussi
   le CP, `cursive: 'minuscules'`), et publier des fiches GS en attaché minuscule (F1). Slugs inchangés.*
4. **D4 — Lignage en GS** : Seyès 4 mm, plus grand (5 mm), ou une simple ligne ? *Reco : ajouter 5 mm « GS » et
   l'utiliser pour les fiches GS ; à faire valider par un·e enseignant·e (plan 07).*
5. **D5 — Assemblages** : fiche seule ou aussi un exercice à l'écran ? *Reco : fiche d'abord, mode « Quelle pièce
   manque ? » plus tard.*
6. **D6 — Nombres écrits en lettres en GS** (activité « Nombres en lettres », nom du nombre sur la bande) : *Reco :
   pas de nombres en lettres en GS (CP : `nombresEnLettresMax` 50) ; sur l'affiche de la bande, le nom seulement en
   option, désactivé par défaut.*
7. **D7 — Compléter `programme.ts`** (§ 4). *Reco : oui pour le rang (MS, GS) et les habiletés phonologiques (GS), qui
   ont un exercice prévu ; préciser `son-lettres` (sans occlusives) ; noter les autres sans exercice pour l'instant.*

---

## 4. Ce qui manque ou paraît douteux dans `programme.ts` pour la GS

Pages du PDF consolidé Éduscol (`SOURCES.c1consolide`), lu le 2026-10-04 (texte extrait du PDF).

1. **Le rang d'un objet** (« Exprimer un rang ou une position par un nombre », p. 42–44) : à 4 et 5 ans,
   « repérer… le premier, le dernier, le deuxième et l'avant-dernier », « le rang d'un élément d'une suite ordonnée
   comportant au plus dix éléments ». `ordinaux` est `['cp', 'ce1']` seulement. Proposer
   `c('rang-maternelle', 'nombres-calcul', 'Trouver le rang d'un objet dans une file (premier, deuxième… dernier)',
   ['ms', 'gs'], src('c1consolide', 43, …))` — à rattacher à la Bande (A3, mode « Le rang » à ajouter).
2. **Habiletés phonologiques** : `syllabes-orales` a pour libellé les seules syllabes, alors que sa source dit
   « 5 ans : rimes, phonèmes ». Le programme de 5 ans (p. 14–15) : rimes et assonances, trouver un phonème, intrus
   à l'initiale, localiser un phonème, on/en/un. Proposer `c('rimes-phonemes', 'lecture', 'Entendre les rimes et
   les sons d'un mot', ['gs'], src('c1consolide', 15, …))` (exercice E2).
3. **`son-lettres`** : le texte dit « leur valeur sonore hormis les occlusives » (p. 15) ; le libellé « Connaître le
   son des lettres » ne le dit pas. Le préciser, et une contrainte GS testable (par exemple
   `sonsLettres: ['a', 'e', 'i', 'o', 'u', 'f', 's', 'ch', 'j', 'v', 'z', 'l', 'r']`, liste à valider).
4. **Écriture en GS** (p. 19–21) : « écrire son prénom sans modèle » en cursive, « écrire un mot orthographiquement
   transparent en cursive avec ou sans modèle », encoder des mots transparents. `geste-ecriture-maternelle` ne cite
   que le tracé ; l'encodage n'a pas de compétence (`dictee` commence au CP). À ajouter si une activité d'encodage
   est prévue (mot transparent à reconstituer avec des étiquettes-lettres : bon candidat pour plus tard).
5. **Oral et vocabulaire au cycle 1** : le domaine `oral` a `cycles: [1, 2, 3]` mais aucune compétence de cycle 1 ;
   `vocabulaire` n'existe qu'aux cycles 2 et 3. Le programme de 5 ans (p. 8–9) demande d'« organiser les mots en
   catégorie et en réseau », de chercher des hyperonymes (« véhicule », « animal »), de trouver un intrus : un
   exercice d'images s'y prête bien (`categories-mots-maternelle`, MS · GS) ; à décider avec le domaine (oral ?).
6. **Se repérer dans l'espace** (BO n° 19, p. 57–58 du PDF consolidé) : le domaine `temps-espace` s'appelle
   officiellement « Se repérer dans le temps et l'espace » mais n'a que `jours-mois` (et `court: 'Se repérer dans le
   temps'`). À 5 ans : gauche / droite, situer un objet dans un rang, « coder à l'aide de flèches le déplacement…
   sur un tableau à cases ». `reperage-deplacements` commence au CP. Candidat : `reperage-espace-maternelle` (GS).
7. **Chronologie et durées** (p. 54–55) : ordonner les étapes d'un processus, « d'abord, ensuite, enfin » ; comparer
   des durées. Pas de compétence ; une activité « images séquentielles à remettre dans l'ordre » serait simple.
8. **Comptine** : `comptineMax: 30` existe mais rien ne dit qu'à 5 ans on récite aussi « à rebours de dix à un » et
   « de deux en deux jusqu'à vingt » (p. 42). Rien à tester côté fiches (les nombres écrits restent ≤ 10,
   `ecritureChiffresMax`), mais un exercice de comptine au-delà de 10 devra être purement oral.
9. **Formes en GS** : la condition « dans toutes les orientations » (p. 48) et « s'approprier la règle comme outil de
   tracé » ne sont pas dans `CONTRAINTES` ; la première justifierait une vérification (C1).
10. **`CONTRAINTES` dit que les listes sont cumulatives**, ce qui est faux pour les solides : MS et GS ont
    `pyramide`, le CP non (`SOLIDES_CP`, conforme au texte du CP). Corriger le commentaire. La GS dit « pyramides à
    base carrée ou triangulaire » : une seule valeur `pyramide` suffit pour les tests, mais l'affiche et l'exercice
    doivent montrer les deux.
11. **`cursive: 'minuscules'` est la même valeur en GS et au CP** alors que la GS « trace et enchaîne » et que le CP
    « écrit en cursive » : un test ne peut pas distinguer les deux. Peut-être `'trace'` en GS. À trancher avec D3.
12. **Pages des sources** : `programme.ts` cite le PDF du BO n° 41 (`bo41`, p. 61–70) et du BO n° 19 ; ce plan cite
    le PDF consolidé (pagination différente). Si des compétences sont ajoutées, garder `bo41`/`bo19` pour la
    cohérence et ne citer `c1consolide` qu'en complément.
