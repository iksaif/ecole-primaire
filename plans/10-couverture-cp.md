# Plan 10 — Couvrir tout le programme du CP

**But** : chaque compétence de `src/data/programme.ts` travaillée au CP a au moins un exercice de l'app (qui
s'imprime aussi) ou, quand un exercice n'a pas de sens, une fiche ou une affiche ; aucune option proposée au CP ne
sort des `CONTRAINTES` du CP. On ajoute d'abord un niveau CP aux exercices existants ; une seule vue nouvelle est
proposée (Données).

## Reste à couvrir en CP (relevé du 2026-10-07, `npm run couverture`)

20 compétences du programme de CP n'ont aucune ressource (exercice, fiche ou affiche) :

- `ordinaux` (nombres-calcul) : Les nombres ordinaux (premier, deuxième…) et le rang dans une file
- `sens-multiplication` (nombres-calcul) : Comprendre le sens de la multiplication (puis le signe ×)
- `problemes-additifs` (nombres-calcul) : Résoudre des problèmes d’addition et de soustraction (parties-tout, comparaison)
- `problemes-multiplicatifs` (nombres-calcul) : Résoudre des problèmes de multiplication et de partage
- `problemes-etapes` (nombres-calcul) : Résoudre des problèmes en deux ou trois étapes
- `longueurs` (grandeurs-mesures) : Mesurer avec la règle ; m et cm (CP), km (CE1), dm et mm (CE2), du mm au km (CM1)
- `masses` (grandeurs-mesures) : Peser et comparer des masses ; g et kg (CE1), tonne (CE2), mg (CM1)
- `tracer-figures` (espace-geometrie) : Reproduire ou tracer des figures sur quadrillage, à la règle puis à l’équerre et au compas
- `solides` (espace-geometrie) : Reconnaître, nommer et décrire les solides (faces, sommets, arêtes)
- `reperage-deplacements` (espace-geometrie) : Se repérer et coder un déplacement sur un quadrillage
- `tableaux-diagrammes` (donnees) : Lire et remplir un tableau, un diagramme en barres
- `son-lettres` (lecture) : Connaître le son des lettres
- `comprendre-texte` (lecture) : Comprendre un texte lu (personnages, informations, ordre des événements)
- `ordre-alphabetique` (vocabulaire) : Ranger des mots dans l’ordre alphabétique, chercher dans le dictionnaire
- `synonymes-antonymes` (vocabulaire) : Trouver des synonymes et des contraires
- `familles-mots` (vocabulaire) : Familles de mots, préfixes et suffixes
- `phrase` (grammaire) : La phrase : majuscule, point ; phrases déclarative, interrogative, impérative ; forme négative
- `classes-mots` (grammaire) : Nature des mots : nom, verbe, déterminant, adjectif, pronom (liste par année)
- `sujet-verbe` (grammaire) : Trouver le verbe et son sujet ; accorder le verbe avec le sujet
- `date-langue-regionale` (regionale-mots) : Dire la date du jour dans la langue régionale (« Peseurt deiz eo hiziv ? » en breton)

Les sections ci-dessous ne gardent que les propositions qui répondent à ces manques ; les autres sont faites (historique : `git log -- plans/10-couverture-cp.md`). Les noms de fichiers cités (vues `.vue`, `activites.js`, `exercices.js`, `programme.ts`…) sont ceux de l'ancien monde, supprimé : le code d'un nouvel exercice est un module `src/exercices/<id>/` (`npm run nouveau`, voir `src/exercices/README.md`), le programme est `src/data/programme.ts`.
## Propositions encore à réaliser

Principes communs (comme pour les niveaux CE1/CE2 existants) :

- **Vue** : une entrée `cp` dans `NIVEAUX` de la vue, avec ses données. Le bouton de niveau vient de
  `Object.keys(NIVEAUX)` : mettre `cp` en premier. Les réglages mémorisés restent sur `'ce1'` par défaut
  (`chargerReglages`, garde `if (!NIVEAUX[…])` déjà là).
- **Fiche** : rien à changer dans `htmlFiche()` sauf mention ; le cadre (`ConfigExercice`, `useOptionsFiche`, ligne
  nom/date, `section.corrige`) s'applique tel quel.
- **Catalogue** : dans `src/data/activites.js`, ajouter `'cp'` à `niveaux` et mettre à jour `desc` et la traduction
  bretonne `BR[...]` quand elle cite les niveaux (« Jusqu'à 1 000 (CE1)… »), avec `// br: à relire`.
- **Fiches prégénérées** : dans `src/impression/exercices.js`, ajouter `C('cp', '^CP$')` aux `classes` de l'exercice
  et `classes: [...]` aux `fiches` concernées. Cela ne fait qu'**ajouter** des slugs
  (`exercices-<id>-cp-…`) ; les slugs publiés ne changent pas. Une option ajoutée à `choix` modifie les fiches
  « par compétence » des autres classes seulement si elle y est cochée par défaut : les nouvelles options n'y sont
  cochées qu'au CP.
- **Couverture** : `COMPETENCES_ROUTES` doit dire la vérité **par niveau** (étape 0).
- **Breton** : tout texte nouveau (libellés d'interface `src/i18n/br/views/…`, contenus `src/i18n/br/contenu/…`)
  est marqué `// br: à relire`. Les ordinaux bretons (*kentañ, eil, trede…*) ne sont pas dans la liste des données
  vérifiées : à marquer aussi. `npm run i18n` doit rester à 0 problème.
- **Tests** : une ligne par niveau CP dans `CAS` de `tests/programme-maths.test.mjs` (réglages par défaut, plus
  `tout:Exercices`) ; pour le français, un bloc dans `tests/programme-francais.test.mjs`. Le test de
  `tests/logique.test.mjs` (« chaque option d'exercice correspond à une compétence au programme de la classe »)
  couvre automatiquement les nouvelles `fiches`.
- **Phrases « Je sais… »** : `src/data/savoirs.js` a déjà une phrase CP pour chaque compétence CP. Il n'y a rien à
  ajouter, sauf si on crée une compétence (section 4).

### Étape 2 — Numération CP (+ ordinaux) (moyen)

`src/views/maths/NumerationView.vue` :

- `NIVEAUX.cp = { plages: [59, 100], lettresMax: 50, pasDroite: { 59: [1], 100: [1, 10] },
  pasSuites: { 59: [1, 2, 10], 100: [1, 2, 10] }, pasPlusMoins: { 59: [10], 100: [10] }, nbRanger: 5 }`. Le palier 59
  vient de « au plus tard en période 2 » (annexe 4 p. 4). `ce1` et `ce2` reçoivent
  `lettresMax: Infinity` (ou la constante de `CONTRAINTES`).
- `tirerNombre(max)` suppose aujourd'hui une puissance de 10 (`nbChiffres`). Il faut borner le tirage à `max`
  (`while (n > max)` ou tirage direct `aleatoire(10, max)` pour 2 chiffres), et faire de même pour
  `genRanger`/`genComparer` (`b > max`) et pour `genDroite` (`max / etendue` entier : 59 devient 50 pour la
  droite). Les CE1 et CE2 restent identiques à graine fixe si l'on ne touche qu'aux chemins `max` non puissance de
  10 : à vérifier par comparaison du HTML avant/après (règle d'AGENTS.md).
- `genLettresChiffres` et `genChiffresLettres` : `max = Math.min(max, niv.lettresMax)`. Les distracteurs restent
  ≤ `lettresMax`.
- `genDecomposer` au CP : « 3 dizaines et 5 unités », « 30 + 5 » ; aussi « 35 unités » (écriture en unités de
  numération, annexe 4 p. 4), en option.
- `genRepresentation` : barres et cubes, déjà en place (pas de plaque si `max ≤ 100`).
- Nouveau type `ordinaux` (CP, CE1), libellé `type_ordinaux` :
  1. une file d'emojis (🚗🚙🚕…) avec la question « Quelle est la quatrième voiture ? » (choix) ;
  2. « Je suis le troisième dans la file. Combien de personnes devant moi ? » (nombre) ;
  3. « Dans la suite ABABAB…, quelle est la dix-neuvième lettre ? » (choix ; motifs de lettres ou de formes, annexe
     4 p. 5).

  Rangs ≤ 20 (« vingtième »). Ordinaux en lettres : fonction dans `src/i18n/fr/nombres…` (à côté de `enLettres`), et
  version bretonne marquée `// br: à relire`. Le type n'est **coché par défaut qu'au CP** : la liste des types par
  défaut dépend du niveau, sinon le bilan CE1 change.
- `exercices.js`, exercice `nombres` :
  - `classes` : `C('cp', '^CP$')` ;
  - `choix` : ajouter `'Ordinaux'` ;
  - la fiche `numeration` prend la compétence `{ cp: 'numeration-100', ce1: …, ce2: … }` ;
  - nouvelle fiche `F('ordinaux', 'les nombres ordinaux', 'ordinaux', ['Ordinaux'], { classes: ['cp', 'ce1'] })` ;
  - la fiche `suites` est à limiter à `classes: ['ce1', 'ce2']` (`suites-nombres` commence au CE1). Au CP, « compter
    de 2 en 2, de 10 en 10 » entre dans la fiche `numeration` (option « Suivant »).
- `activites.js` :
  - `niveaux: ['cp', 'ce1', 'ce2']` ;
  - `desc` : « Jusqu'à 100 (CP), 1 000 (CE1) et 10 000 (CE2) » (et `BR`, `// br: à relire`) ;
  - `COMPETENCES_ROUTES['/maths/numeration']` par niveau : CP `numeration-100`, `nombres-en-lettres`,
    `comparer-ranger`, `droite-graduee`, `ordinaux`, `ajouter-dizaines`.
- Tests (`programme-maths`) :
  - `['/maths/numeration', '^CP$', 'cp', [champ()]]` ;
  - une ligne avec seulement « Écrire en lettres », qui vérifie que le nombre en chiffres de chaque question est
    ≤ 50 (`champ('nombresEnLettresMax')`) ;
  - une ligne `Ordinaux` qui vérifie les rangs ≤ 20.

### Étape 5 — Problèmes CP (moyen)

`src/views/maths/ProblemesView.vue` :

- `NIVEAUX.cp = { plages: { petits: { max: 20 }, moyens: { max: 100 } }, tables: [2, 3, 4, 5, 10],
  categories: ['ajoutRetrait', 'partiesTout', 'multiplication', 'partage', 'deuxEtapes'],
  capCategories: { multiplication: 30, partage: 30, deuxEtapes: 30 } }`. Dans `genererProbleme`,
  `max = Math.min(plage.max, m.cap, niv.capCategories?.[cat] ?? Infinity)`. Ainsi, une étape va jusqu'à 100 ; deux
  étapes et le multiplicatif restent ≤ 30 (`CONTRAINTES.cp.problemesMax`).
- Modèles exclus au CP, par le champ `niveaux` des `MODELES` :
  - comparaison (catégorie absente au CP) ;
  - `total2` (« de plus » : comparaison) ;
  - `imagesDon` (mixte × puis − : CE1, annexe 4 p. 19).

  Les modèles `cap: 1000` sans contexte réaliste ≤ 30 sont gardés : `max` est borné.
- `multiplicationDetail(n, k)` au CP : addition itérée seulement (« 7 + 7 + 7 = 21 »), sans « donc 3 × 7 ». Le
  symbole `×` arrive au CE1 (annexe 4 p. 13). On passe `nivId` au `gen` ou on post-traite `calcul`. Même règle pour
  les corrigés de `partage` : pas de `÷` (déjà le cas).
- `tirerProduit` au CP : `n ≤ 6` pour garder des additions itérées courtes.
- Énoncés : on réutilise ceux du CE1 (catalogue `src/i18n/fr|br/contenu/problemes.js`). On peut ajouter deux ou
  trois énoncés du programme : les wagons (trois termes), « il en reste 21, j'en ai mangé 6 ». Ils sont marqués
  `// br: à relire` en breton.
- `exercices.js` : `C('cp', '^CP$')` ; les trois fiches existantes valent au CP (les compétences sont CP). Le libellé
  de la fiche `additifs` au CP est « problèmes d'ajout, de retrait et de parties-tout » (pas « Comparaison » : son
  bouton n'existe pas au CP, la regex ne trouve rien et c'est sans effet).
- `activites.js` :
  - `niveaux: ['cp', 'ce1', 'ce2']` ;
  - `COMPETENCES_ROUTES['/maths/problemes']` : ajouter `sens-multiplication` au CP.
- Tests :
  - `['/maths/problemes', '^CP$', 'cp', [champ(), sans(/×|÷/, 'signe × ou ÷ au CP')], ["^Jusqu'à 100$"]]` ;
  - avec seulement « Multiplication », « Partage » et « Plusieurs étapes » : `champ('problemesMax')`.

### Étape 6 — Mesures CP (petit à moyen)

`src/views/maths/MesuresView.vue` :

- `NIVEAUX.cp` :
  - `exercices: ['regle', 'unite', 'comparer', 'masse']` (pas de conversion ni de calendrier : le calendrier relève de
    « Questionner le monde ») ;
  - `regle: { max: 15, segMin: 2, segMax: 12, px: 32, mm: false }`, `fiche: { segMin: 3, segMax: 12, mm: false }` ;
  - `unites: ['cm', 'm']`, `objetsUnite: OBJETS_UNITE_CE1.filter(o => ['cm', 'm'].includes(o.unite))` (crayon 15 cm,
    porte 2 m…) ;
  - `comparaisons: ['m-cm-cp']` : un nouveau cas « 1 m … 85 cm », toujours avec 1 m et des centimètres ≤ 100, car
    `m-cm` actuel tire 1 à 5 m, soit 500 cm, hors champ ;
  - `masses: ['boites', 'ranger3']`.
- Nouveau sous-cas de masse `ranger3` : trois boîtes et deux pesées dessinées (`svgBalance`), ranger de la plus
  légère à la plus lourde (annexe 4 p. 26 : « ordonner… deux ou trois objets… balance du type Roberval »). Pas
  d'unité. Le cas `boites` existe déjà et convient tel quel.
- `exercices.js` : `C('cp', '^CP$')` ; fiche `longueurs` (au CP, seuls « Mesurer à la règle », « Unité adaptée » et
  « Comparer » existent) ; fiche `masses` ; `contenances` reste au CE2.
- `activites.js` : `niveaux: ['cp', 'ce1', 'ce2']`, `desc` à adapter.
- Test : `['/maths/mesures', '^CP$', 'cp', [contenances, champ(), sans(/\b\d+ ?(km|mm|dm|kg|g)\b/, 'unité hors CP')], ['tout:Exercices']]`.

### Étape 7 — Géométrie CP (moyen à grand)

`src/views/maths/GeometrieView.vue` :

- `NIVEAUX.cp` :
  - `exercices: ['reproduction', 'parcours', 'figures', 'solides']` ;
  - `reproduction: { cols: 6, rows: 6, nbCases: [4, 7] }` ;
  - `figures: ['carre', 'rectangle', 'triangle', 'disque']` et `sousFigures: ['nom', 'cotes', 'sommets']` (pas
    d'`angle` : l'angle droit est au CE1) ;
  - `solides: ['cube', 'pave', 'boule', 'cylindre', 'cone']` et `solidesNommes: ['cube', 'pave', 'boule']` : la
    question « nom » n'a pour bonne réponse qu'un de ces trois ; les autres apparaissent comme distracteurs ou dans
    « roule / ne roule pas » ;
  - `solidesComptage: ['cube', 'pave']` et `sousSolides: ['nom', 'rouler', 'faces', 'natureFaces']` (pas de
    `sommets` : CE1).
- `FIGURES.disque` (`cotes: 0`) et son dessin : `construireFigure('disque')`, un cercle rempli. Nom : clé
  `figures.disque` dans `src/i18n/fr|br/contenu/geometrie.js`. En breton, reprendre « pladenn » des Formes
  maternelles, déjà `// br: à relire` dans le TODO.
- `natureFaces` : « Les faces d'un pavé sont des… carrés / rectangles / triangles ».
- Nouveau sous-exercice `parcours` (`reperage-deplacements`, annexe 4 p. 33) :
  - un quadrillage 6 × 6, un départ (🐞) et une suite de flèches (au plus 10, dont au plus 2 changements de
    direction) ; deux formes : suivre le code et colorier la case d'arrivée, ou écrire le code d'un chemin
    dessiné ;
  - réutilise la grille de `genReperage` / `genReproduction` (`k`, `dek`, SVG de quadrillage) ;
  - **Décision D4** : flèches absolues (↑ → ↓ ←) ou instructions relatives (« avance, tourne à droite »). Le repérage
    CE1 « B3 » n'est pas proposé au CP ;
  - le sous-exercice sert aussi au CE1 (« coder un déplacement », p. 35), en plus du repérage par cases.
- `exercices.js` :
  - `C('cp', '^CP$')` ;
  - `choix` : ajouter `'Parcours'` ;
  - fiches CP : `reproduction` (`tracer-figures`), `figures` CP (`['Figures']`, `classes: ['cp', 'ce1']`), `solides`,
    et `F('parcours', 'coder un déplacement', 'reperage-deplacements', ['Parcours'], { classes: ['cp', 'ce1'] })` ;
  - la fiche `reperage` passe en `classes: ['ce1', 'ce2']`.
- Fiche imprimée : quadrillage à l'échelle (l'avertissement « Imprimer à 100 % » existe déjà ; voir le TODO
  géométrie).
- Test : `['/maths/geometrie', '^CP$', 'cp', [figures, sans(/pyramide|sommets? d'un|arête|angle droit|cercle|symétri/i, 'hors CP')], ['tout:Exercices']]`.
  Attention : `NOMS_FIGURES` connaît déjà `disque` et `cercle`.

### Étape 8 — Grammaire CP (moyen : surtout des données)

`src/views/francais/GrammaireView.vue` :

- Ajouter `'cp'` au `niv` de : `ordre`, `phrase`, `majuscule`, `ponctuation`, `negation`, `negReconnaitre`, `genre`,
  `nombre`, `pluriel`, `accordGN`, `accordSV` (initiation, « le chat miaule / les chats miaulent »), `sujet`
  (initiation à partir du sens : « Qui est-ce qui… ? »), `verbe` (« le mot qui dit ce que fait… »).
- Classes de mots au CP (**décision D3**) : `CONTRAINTES.cp.classesMots` vaut `[]`, alors que le programme demande de
  « constituer des corpus par classe de mots » sans les nommer comme objectif (BO n° 41 p. 92). Proposition : un type
  `trier`, CP seulement, « Range les mots dans la boîte des noms ou la boîte des verbes ». Les boîtes sont
  présentées comme dans l'exemple du BO (noms d'animaux, de personnes, d'objets ; verbes = souvent des actions). Les
  types `nature`, `det` et `adj` ne sont pas ouverts au CP.
- `DONNEES.cp` : 40 à 50 phrases courtes et déchiffrables (≤ 6 mots, sujet + verbe + complément, pas d'imparfait),
  annotées dans la même syntaxe. On peut partir des phrases CE1 de ≤ 6 mots, filtrées à la main. Contenu en français
  seulement (`enLangue('fr', …)`), consignes traduites.
- `exercices.js` :
  - `classes` : `C('cp', '^CP$')` ;
  - fiches `phrase`, `sujet-verbe` et `accords` avec `classes` incluant `'cp'` ;
  - `nature` : `classes: ['ce1', 'ce2', 'cm1', 'cm2']`, plus une fiche CP `trier` (`classes-mots`) si D3 = oui.
- `activites.js` : `niveaux: de('cp', 'cm2')`.
- Test (`programme-francais`) :
  - le bloc « Grammaire » boucle déjà sur les niveaux de la vue : ajouter `cp` ;
  - vérifier qu'aucun terme « déterminant », « adjectif », « pronom » ou « nature » n'apparaît dans la fiche CP ;
  - pluriels en `-s` seulement (`CONTRAINTES.cp.pluriels`).

### Étape 9 — Vocabulaire CP (moyen : surtout des données)

`src/views/francais/VocabulaireView.vue` :

- Ajouter `'cp'` au `niv` de :
  - `alpha` : au CP, ranger par la **première lettre** seulement ;
  - `lettre` ;
  - `contraires`, `synonymes` ;
  - `familles` (nom/verbe : chant/chanter, chat/chaton) ;
  - `prefixes` (dé-, re-, in- : « commence à comprendre », BO n° 41 p. 88) ;
  - `categorie`, `intrus` (champ lexical de l'école, véhicules, meubles…).
- `DONNEES.cp` : mots courts et déchiffrables, alphabet avec premières lettres toutes différentes, une douzaine
  d'entrées par type. Les définitions ne sont pas proposées au CP : elles demandent de lire une phrase de
  dictionnaire (au plus un QCM image/mot, plus tard).
- `exercices.js` :
  - `C('cp', '^CP$')` ;
  - fiches `ordre-alphabetique` (CP : sans « Mots-repères », « Définitions », « Le sens dans la phrase »), `sens`
    (sans « Sens propre »), `familles` ;
  - `categories` : `classes: ['cp', 'ce1']`.
- `activites.js` : `niveaux: ['cp', 'ce1', 'ce2']`.
- Test : ajouter un bloc « Vocabulaire » à `programme-francais.test.mjs` (pas de « homonyme » ni de « sens figuré »
  au CP).

### Étape 10 — Lecture : fluence, compréhension, fiches (grand)

`src/views/LectureView.vue` :

- `MOTS_CP` : passer de 15 à environ 60 mots, rangés par étapes de la progression des CGP (voyelles + l, m, r, s ;
  puis ch, ou, on, an…). Option « mots inventés » (pseudo-mots, BO n° 41 p. 77). Corriger les découpages signalés
  dans le TODO (« é-cole » donne « é-co-le » selon l'usage scolaire retenu).
- Nouveau mode `fluence` (CP → CE2) :
  - un texte déchiffrable avec le nombre cumulé de mots en fin de ligne ;
  - dans l'app, un chrono d'une minute ; l'adulte touche le dernier mot lu, et l'app affiche « mots lus » et
    l'objectif du niveau (`CONTRAINTES[niveau].lectureMotsParMinute` : 30, 70, 90) ;
  - sur la fiche : le même texte, compteurs en marge, cases « 1re lecture / 2e lecture : … mots ».

  Données : 10 à 15 textes par niveau (CP : 40 à 80 mots), en français.
- Nouveau mode `comprendre` (CP → CE2) : texte court (CP : 3 à 6 phrases), trois questions à choix
  (personnage, lieu, ordre des événements, reprise « il = … », une inférence simple), un retour au texte. La fiche
  numérote les questions ; corrigé dans `section.corrige`.
- Contenu à écrire (≈ 30 textes CP-CE1) : à faire relire par un·e enseignant·e (plan 07).
- `exercices.js` : nouvel exercice `lecture` (aujourd'hui absent), `classes: [C('cp', '^CP$'), C('ce1', '^CE1$'),
  C('ce2', '^CE2')]`, avec trois fiches :
  - `syllabes` → `decodage` ;
  - `fluence` → `fluence` ;
  - `comprendre` → `comprendre-texte`.
- `activites.js` : `COMPETENCES_ROUTES['/lecture']` gagne `fluence`.
- Test : un bloc « Lecture » qui vérifie, au CP, qu'aucun texte de fluence ne dépasse 80 mots et que chaque question
  a sa réponse dans le corrigé.

### Étape 11 — Les lettres : sons, cursive, b/d p/q (moyen)

`src/views/maternelle/LettresView.vue` (GS, CP) :

- Mode `son` (`son-lettres`) : un mot illustré (emoji), « Par quelle lettre commence… ? », 4 lettres au choix. Pas
  d'occlusives en GS (BO n° 41 p. 53) ; au CP, toutes les lettres. Synthèse vocale facultative (`useTTS`, déjà
  utilisé ailleurs). Contenu : mots français (**décision D5**).
- Mode `cursive` : associer capitale, script et cursive. La police attachée livrée est Playwrite FR Trad (OFL),
  déjà chargée par `/imprimer/ecriture`.
- Option « lettres qui se ressemblent » (b/d, p/q, m/n, u/n) dans `reconnaitre`.
- Aujourd'hui, la vue n'a pas de bouton de niveau (`C('gs-cp', null)` dans `exercices.js`). On ajoute GS et CP
  (sans occlusives en GS) et on garde la classe publiée `gs-cp` (slug inchangé). Fiches par compétence :
  `nom-lettres`, `son-lettres`.

### Étape 13 — Données : tableaux et diagrammes (grand, nouvelle vue)

Rien ne couvre `tableaux-diagrammes`, à aucun niveau (CP → CM2). Proposition (**décision D6**) : une vue
`src/views/maths/DonneesView.vue`, route `/maths/donnees`, `domaine: 'donnees'`, `niveaux: de('cp', 'ce2')` pour
commencer. Elle est construite sur le modèle de `NumerationView` (`ConfigExercice`, `useModeExercice`, `htmlFiche()`,
`ligneNomDate`).

- CP :
  - « Compte les bâtons » : un relevé (fruit préféré, 2 à 5 valeurs, < 40 élèves), puis remplir le tableau ;
  - lire un diagramme en barres (« le plus », « le moins », « combien de plus que… ») ;
  - compléter un diagramme (colorier des cases) ;
  - tableau à double entrée « forme × couleur » à compléter (annexe 4 p. 37).
- CE1-CE2 : mêmes types avec des effectifs plus grands, plus des questions sur deux données.
- Fichiers :
  - la vue ;
  - `src/router` (route) ;
  - `src/i18n/fr|br/views/maths/DonneesView.js` ;
  - `src/i18n/fr|br/contenu/donnees.js` (catégories : fruits, animaux…) ;
  - `activites.js` (carte, `COMPETENCES_ROUTES`, `BR`) ;
  - `exercices.js` (exercice `donnees`, classes CP, CE1, CE2, fiche `tableaux-diagrammes`) ;
  - test `programme-maths` (`champ()` : effectifs < 40 au CP).
- Alternative légère : seulement une fiche générée (pas d'exercice à l'écran). Elle est moins utile, mais deux fois
  moins chère.

### Étape 14 — Affiches CP manquantes (petit, une par une)

Cadre : `src/impression/affiches/cadre.js`, catalogue `affiches/catalogue.js`, dessins dans `affiches/*.js`.

- **Numération CP** : variante `cp` de `NUMERATION`, avec les colonnes dizaines | unités, les exemples `['35'], ['70']`,
  le dessin des barres et des cubes, et la note « 10 unités = 1 dizaine ». À ajouter :
  - l'entrée `AFFICHES_PROGRAMME.numeration` `{ id: 'cp', label: "Jusqu'à 100", niveaux: 'CP' }` ;
  - le slug `affiche-tableau-numeration-jusqu-a-100` dans `TELECHARGEMENTS_AFFICHES` ;
  - `competencesAffiche` : `cp: ['numeration-100']` ;
  - `activites.js` (carte numération) : `niveaux: ['cp', 'ce1', 'cm1', 'cm2']`.
- **Solides CP** : lot `solides-cp` dans `LOTS_FORMES` (cube, pavé, boule, cylindre, cône ; nombre et nature des
  faces du cube et du pavé, sans sommets ni arêtes) ; slug `affiche-solides-cp`, niveaux `CP`.
- **Doubles et moitiés CP**, **compléments à 10** : déjà dans la liste « Nouvelles affiches à proposer » du TODO. Il
  faut une décision de l'utilisateur. Hors de ce plan, sauf demande.
- Test : `tests/logique.test.mjs` (« affiches du programme : contenu permis à chaque niveau indiqué ») et
  `tests/affiches.test.mjs` (rien ne dépasse).

---

## 3. Décisions

### Décisions à prendre (avec recommandation)

- **D1** — Régénérer `fiche-doubles-et-moities-cp` (même slug) avec les doubles 20 à 50 et les moitiés 40 à 100 du
  programme ? **Oui** : la fiche actuelle est incomplète au regard du programme.
- **D2** — `fiche-suites-de-nombres` (CP · CE1, nombres jusqu'à 190) : la passer en `CE1` seul, avec une fiche CP
  « compter de 2 en 2, de 10 en 10 jusqu'à 100 » rangée en `numeration-100` ? **Oui**.
- **D3** — Grammaire CP : un tri « boîte des noms / boîte des verbes » (corpus, sans nommer les natures comme
  objectif) ? **Oui**, sous ce libellé, sans les types « Nature d'un mot », déterminant ni adjectif. Sinon,
  `classes-mots` reste vide au CP.
- **D4** — Déplacements au CP : flèches absolues sur quadrillage, ou instructions relatives (« avance, tourne à
  droite », robot orienté) comme dans les exemples du programme ? **Flèches absolues** d'abord : plus lisibles sur
  une fiche, et elles codent bien un déplacement. Les instructions relatives en option au CE1.
- **D5** — « Le son des lettres » dans l'interface bretonne : contenu en français (comme les autres exercices de
  français), ou breton (phonologie différente, rien de vérifié) ? **Français**, consignes traduites.
- **D6** — Données : une vraie vue `/maths/donnees` (CP → CE2), ou seulement une fiche générée ? **La vue** : c'est le
  seul domaine sans aucune ressource, du CP au CM2.
- **D7** — Textes de lecture (fluence, compréhension) : écrits par l'agent puis relus par un·e enseignant·e
  (plan 07), sans les publier avant ? **Oui**, publiés avec la mention habituelle de relecture, comme
  `savoirs.js`.

---

## 4. Ce qui manque ou semble douteux dans `programme.ts` pour le CP

Sources : annexe 4 (maths cycle 2, `SOURCES.c2maths`) et BO n° 41 (`SOURCES.bo41`), pages du PDF.

1. **`problemes-additifs`** : le libellé dit « (parties-tout, comparaison) » pour tous les niveaux, alors que la
   comparaison commence au **CE1** (c2maths p. 17). Au CP : parties-tout, transformations comprises (« L'élève
   traite les problèmes de transformation… comme des problèmes de parties-tout », p. 9). Proposition : une contrainte
   `problemesTypes: ['parties-tout']` au CP (testable : pas de « de plus », « de moins » dans les énoncés), ou au
   moins une `interpretation`.
2. **`problemesMax: 30`** ne s'applique qu'aux problèmes en deux étapes et multiplicatifs ; les problèmes en une étape
   vont jusqu'à 100 (p. 9 : « nombres entiers jusqu'à cent »). Le commentaire des clés le dit, mais le nom de la clé
   peut tromper un test : le renommer `problemesEtapesMax`, ou ajouter `problemesUneEtapeMax: 100`.
3. **`ordinaux`** : la borne « jusqu'à vingtième » (p. 4) n'est pas dans `CONTRAINTES`. Ajouter `ordinauxMax: 20` au
   CP.
4. **Progression dans l'année** : « au plus tard en période 2 … jusqu'à cinquante-neuf ; en période 3 … jusqu'à
   cent » (p. 4) ; addition posée « en période 4 ou 5 » (p. 5) ; monnaie « en période 2 ou 3 » (p. 26). Cela n'est
   pas encodé. Utile pour des paliers (`plages: [59, 100]`), sans en faire une contrainte.
5. **Calcul mental CP sans compétence dédiée** (p. 7-8) : « ajouter deux nombres inférieurs à 100 », « soustraire un
   nombre inférieur à 10 à un nombre entier de dizaines » (50 − 6), « moitié d'un nombre pair » par décomposition
   (46 → 23), « ajouter un nombre inférieur à 9 » avec passage de la dizaine. Ce sont des stratégies distinctes de
   `ajouter-dizaines`, `ajouter-9` et `doubles-moities`. Proposition : une compétence `strategies-calcul`
   (`depuis('cp')`), ou élargir le libellé de `ajouter-dizaines`. Repère de fluence en calcul (p. 6) : 8 égalités en
   une minute, 9 résultats en trois minutes. Cela pourrait régler le minuteur par défaut du calcul mental CP
   (aujourd'hui 10 s par question).
6. **Ajouter 9** : le libellé « Ajouter ou retirer 9, 19, 29… » vaut pour tous les niveaux. Au CP, ce n'est que
   « Ajouter 9 » (p. 7) ; retirer 9 vient au CE1 (p. 15). L'extrait de la source le dit déjà, pas le libellé.
7. **Espace et géométrie CP** : deux attendus sans compétence :
   - « repérer des alignements, utiliser la règle comme instrument de tracé » (p. 32) ;
   - « vocabulaire des positions relatives : gauche, droite, sur, sous, entre… » et « plan de la classe » (p. 33).

   Le libellé de `reperage-deplacements` (« sur un quadrillage ») est plus étroit que le CP, où le repérage se fait
   d'abord dans la classe. Proposition : élargir le libellé (« Se repérer, coder et suivre un déplacement ») ; ajouter
   une compétence `alignements` (CP, CE1) si l'on veut une fiche « points alignés ».
8. **`solides` CP** : « Construire des cubes et des pavés » à partir de leurs faces (p. 32) n'est pas repris. Il
   n'est pas faisable à l'écran, mais l'est sous forme de patron à découper, ce qui contredirait `patrons: []` au CP.
   À laisser de côté, en le notant.
9. **`son-lettres` et `nom-lettres` au CP** : les deux sources sont des pages de la **maternelle** (bo41 p. 52-53). Le
   programme du CP (p. 77) parle de correspondances graphophonémiques, ce qui est `decodage`. Garder `cp` est une
   interprétation (consolidation) ; à marquer `interpretation:` dans les deux compétences.
10. **`familles-mots`** : l'extrait dit « CE1 p. 89 : préfixes et suffixes », mais le CP « commence à comprendre le sens
    des principaux affixes : dé-, re-, in- ; -eur, -ier, -ette » et « repère et opère des dérivations simples :
    coller/décoller/recoller » (bo41 p. 88). L'extrait est à compléter. Le plan 09 le notait déjà (« les affixes
    commencent au CP »).
11. **Vocabulaire CP sans compétence** : « être sensible à la polysémie et au sens figuré (sans les concepts) » et
    « percevoir la différence entre deux niveaux de langue (rire / rigoler) » (p. 88-89). Pas utile pour des
    exercices au CP. À ignorer, ou à noter dans un commentaire.
12. **`classesMots: []` au CP** : c'est juste pour « nommer », mais le BO demande de « constituer des corpus par classe
    de mots : noms, verbes, déterminants, adjectifs, pronoms personnels » (p. 92). Une clé distincte
    (`classesMotsCorpus: ['nom', 'verbe']`, par exemple) permettrait au test de distinguer « trier » de « nommer »
    (décision D3).
13. **`phrase` CP** : le libellé ne cite pas la forme **exclamative**, que le CP doit reconnaître (p. 92). Le libellé
    dit « forme négative » seulement ; l'extrait de la source la mentionne.
14. **Domaine `oral`** : présent dans `DOMAINES` pour les cycles 1 à 3, mais aucune compétence. La page `/programme`
    le montre vide. C'est normal pour un site d'exercices écrits ; une phrase dans le commentaire d'en-tête suffirait.
15. **Écriture CP** : « Produire des écrits courts, d'une à cinq lignes » (p. 82) n'a pas de compétence. Il ne s'y
    prête pas à l'écran ; à ignorer.
16. **`tracer-figures` CP** : le programme fait aussi tracer des **cercles** avec gabarits et pochoirs (p. 32), alors
    que le cercle comme figure nommée est au CE1 (`FIGURES_CE1`). Ce n'est pas une contradiction (tracer n'est pas
    nommer), mais un test sur le mot « cercle » dans une fiche CP de reproduction serait trop strict : rester sur
    « disque ».
