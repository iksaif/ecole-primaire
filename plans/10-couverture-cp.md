# Plan 10 — Couvrir tout le programme du CP

**But** : chaque compétence de `src/data/programme.js` travaillée au CP a au moins un exercice de l'app (qui
s'imprime aussi) ou, quand un exercice n'a pas de sens, une fiche ou une affiche ; aucune option proposée au CP ne
sort des `CONTRAINTES` du CP. On ajoute d'abord un niveau CP aux exercices existants ; une seule vue nouvelle est
proposée (Données).

Point de départ : `couverture.html` (généré le 2026-10-04), puis vérification dans le code : niveaux et options
réellement proposés au CP dans chaque vue, presets de `src/impression/calcul.js`, `fiches` de
`src/impression/exercices.js`. Textes officiels relus pour ce plan (texte extrait des PDF) : annexe 4 (maths
cycle 2), p. 3-10, 25-26, 32-33, 37 ; BO n° 41, p. 75-92 (français cycle 2).

Ce plan découle du TODO « Couverture complète PS, MS, GS, CP, CE1 » (`docs/TODO.md`, « Manques au programme »).

---

## 1. État actuel au CP

**42 compétences** ont `'cp'` dans `niveaux`. Selon le rapport, 22 sont couvertes et 20 n'ont rien. Une fois le code
vérifié, il en reste **19 vraiment couvertes**, dont **6 par une affiche seulement**, et **23 sans rien**. Trois cases
du rapport sont à tort vertes (voir 1.3).

Légende : 🎯 exercice de l'app au niveau CP · 📄 fiche toute prête ou générateur · 📘 affiche · ✗ rien.

### 1.1 Mathématiques (24 compétences)

| Compétence (`id`) | Ce qui la couvre au CP (vérifié) | Manque |
|---|---|---|
| `numeration-100` | 📘 `/imprimer/nombres` (tableau 0–100, dizaines) | **Aucun exercice** : `NumerationView` n'a que `ce1` et `ce2` dans `NIVEAUX` |
| `nombres-en-lettres` | 📘 nombres en lettres 10–50 (`nombres-francais-breton-10-20`… `-40-50`), droites 0–20 et 0–100 | Exercice ≤ 50 |
| `comparer-ranger` | ✗ | Exercice (comparer `<` `>` `=`, ranger 5 nombres ≤ 100) |
| `droite-graduee` | 📘 `affiche-droite-numerique-de-0-a-20`, `-0-a-100` | Exercice (graduée de 1 en 1) |
| `ordinaux` | ✗ (nulle part, ni au CE1) | Exercice : jusqu'à « vingtième », rang dans une file, suites répétitives (annexe 4 p. 4-5) |
| `tables-addition` | 🎯 Calcul mental CP (`+`, `−` sur `[1,10]`) · 📄 `fiche-tables-d-addition-cp`, `fiche-additions-jusqu-a-20` · 📘 tables d'addition | — |
| `doubles-moities` | 🎯 Calcul mental CP : doubles de `plage(1, 10)` seulement · 📄 `fiche-doubles-et-moities-cp` (plage `'10'`) | Doubles de 20, 30, 40, 50 et moitiés de 40, 60, 80, 100 (`CONTRAINTES.cp.doubles`, `moities`) : ni dans l'exercice, ni dans la fiche |
| `complement-dizaine` | 🎯 Calcul mental CP : « Compléments à 10 » seulement · 📄 `fiche-complements-dizaine-superieure` (CP · CE1) | Le complément à la dizaine supérieure (74 + … = 80) dans l'exercice : `strat: null` au CP désactive `OP_VERS_DIZ` |
| `ajouter-dizaines` | 📄 `fiche-ajouter-retirer-10` (CP · CE1, `dixCent` ±10) | Exercice : ± 1, ± 2, ± 10, ± 20…90 (`OP_DIZ` désactivé au CP) |
| `ajouter-9` | ✗ (le rapport compte le générateur, mais `neufOnze` a `niveaux: ['ce1', …]` et Calcul mental CP a `strat: null`) | + 9 au CP (pas − 9 ni ± 11 : CE1, annexe 4 p. 7 et p. 15) |
| `addition-posee` | 🎯 Calcul posé « 1 chiffre (CP) », « 2 chiffres (CP / CE1) » · 📄 fiche par compétence | (mineur) pas d'addition « 2 chiffres + 1 chiffre » (28 + 8) ni à trois termes (28 + 8 + 56, annexe 4 p. 5) |
| `sens-multiplication` | ✗ | « 3 fois 20, c'est 20 + 20 + 20 » (annexe 4 p. 5) ; problèmes multiplicatifs CP |
| `problemes-additifs` | ✗ (`ProblemesView` : CE1, CE2) | Une étape, parties-tout et transformations, nombres ≤ 100 ; **pas de comparaison** au CP (CE1) |
| `problemes-multiplicatifs` | ✗ | Recherche du tout, nombre de parts, valeur d'une part, champ ≤ 30, additions itérées (pas de `×`) |
| `problemes-etapes` | ✗ | Additifs en deux étapes, champ ≤ 30 (pas de « mixtes » : CE1) |
| `longueurs` | ✗ (`MesuresView` : CE1, CE2) | Mesurer à la règle (cm), « 2 cm, 20 cm ou 1 m ? », comparer, 1 m = 100 cm |
| `masses` | ✗ | Comparer deux ou trois objets (balance Roberval), sans unité |
| `monnaie-euros` | 📘 `affiche-monnaie-euros` | Exercice : euros entiers ≤ 100 € (compter, faire une somme, le moins de pièces, comparer, rendre) |
| `heure-entiere` | 📘 `affiche-horloge-heures-entieres` | Exercice : lire et placer les heures entières ≤ 12, associer une heure à un moment de la journée |
| `figures-planes` | 📘 `affiche-formes-planes-cycle-1-2` (GS · CP · CE1) | Exercice : disque, carré, rectangle, triangle ; côtés et sommets ; **pas** d'angle droit ni de cercle (CE1) |
| `tracer-figures` | ✗ | Reproduire sur quadrillage (existe au CE1 : `genReproduction`) |
| `solides` | ✗ (`affiche-solides-ce2` est CE1 · CE2 : pyramide, arêtes) | Exercice et affiche : cube, pavé, boule, cylindre, cône ; nommer cube, pavé, boule ; faces du cube et du pavé |
| `reperage-deplacements` | ✗ (le repérage CE1 nomme des cases « B3 », ce qui n'est pas l'attendu du CP) | Coder et suivre un déplacement (≤ 10 instructions dont 2 virages, annexe 4 p. 33) ; gauche/droite, sur/sous… |
| `tableaux-diagrammes` | ✗ (aucune activité, à aucun niveau) | Tableau d'effectifs, diagramme en barres (2 à 5 valeurs, < 40 individus), tableau à double entrée (annexe 4 p. 37) |

### 1.2 Français (18 compétences)

| Compétence (`id`) | Ce qui la couvre au CP (vérifié) | Manque |
|---|---|---|
| `nom-lettres` | 🎯 Les lettres (GS, CP : reconnaître, majuscule/minuscule) · 📘 alphabet (5 affiches) | Association avec la cursive ; b/d, p/q |
| `son-lettres` | ✗ | Valeur sonore des lettres (son initial d'un mot) |
| `decodage` | 🎯 Lecture & Syllabes CP : 15 mots (`MOTS_CP`), reconstitution | Banque de mots trop petite, pas de pseudo-mots ni de phrases déchiffrables ; aucune fiche prégénérée (Lecture absente de `EXERCICES`) |
| `fluence` | ✗ | Texte avec compteur de mots, chrono d'une minute ; objectif 30 mots/min (`lectureMotsParMinute`) |
| `comprendre-texte` | Le rapport compte Lecture (mode `lecture_texte`), mais ce mode n'a qu'un bouton « J'ai lu » : **aucune question** | Questions de compréhension (qui, où, quoi, ordre, reprises « le lion / il / le fauve ») |
| `cursive` | 📄 fiches d'écriture (26 lettres, alphabets, chiffres, jours, mois) | — (pas d'exercice possible à l'écran ; suffisant) |
| `copie` | 📄 mêmes fiches d'écriture | (mineur) copie de phrases : le générateur `/imprimer/ecriture` permet un texte libre |
| `dictee` | 🎯 Dictée CP | — |
| `ordre-alphabetique` | ✗ (`VocabulaireView` : CE1, CE2) | Ranger par la première lettre, lettre avant/après |
| `synonymes-antonymes` | ✗ | Contraires (lourd/léger), mots de même sens |
| `familles-mots` | ✗ | chant/chanter, chat/chaton, coller/décoller (BO n° 41 p. 88-89) ; catégories (champ lexical) |
| `orthographe-lexicale` | 🎯 Orthographe « Lettres manquantes » (≈ 12 questions CP) et Dictée · 📄 fiche par compétence | Banque de questions mince ; bug : « Le soli___ brille. » attend `soleil` |
| `accents-lettres` | Le rapport compte Orthographe, mais aucune question ne porte sur les accents, s/c/g ou an/am, on/om… | Thème « Sons et lettres » |
| `phrase` | ✗ (`GrammaireView` : `niv` sans `'cp'`) | Majuscule, point, ordonner une phrase, types de phrases, forme négative |
| `classes-mots` | ✗ | Tri de corpus (« la boîte des noms », « la boîte des verbes ») ; `CONTRAINTES.cp.classesMots: []` : pas de nature à nommer |
| `sujet-verbe` | ✗ | S'initier : « le chat miaule / les chats miaulent » |
| `accords-gn` | 🎯 Orthographe « Accords » (féminin -e, pluriel -s, niveau CP) | Exercice de grammaire (genre, nombre, chaîne d'accords) |
| `conjugaison-present-etre-avoir` | 🎯 Conjugaison CP · 📘 être et avoir au présent | — |

### 1.3 Ce que le rapport compte à tort

Les `competences` d'une route (`COMPETENCES_ROUTES` dans `src/data/activites.js`, `COMPETENCES_CALCUL`) valent pour
tous les niveaux de l'activité. `ressourcesDe()` (`src/impression/couverture.js`) les attribue donc à chaque classe,
même quand l'option n'existe pas dans cette classe :

- `ajouter-9` au CP : rien ne le propose (voir plus haut) ;
- `accents-lettres` au CP : aucune question d'Orthographe ;
- `comprendre-texte` au CP : aucune question ;
- `ajouter-dizaines` au CP : le rapport cite Calcul mental, qui ne le propose pas au CP (seul le générateur le fait).

Erreurs de données voisines :

- `COMPETENCES_TYPES.dixCent = 'multiplier-10-100'` (`calcul.js`) : `fiche-ajouter-retirer-10` (CP · CE1, ± 10) est
  rangée en « multiplier par 10 », compétence du CE1, au lieu de `ajouter-dizaines` ;
- `fiche-suites-de-nombres` est indiquée « CP · CE1 » avec `suites-nombres`, compétence qui commence au CE1. Ses
  nombres vont jusqu'à 190 (pas 10, départs jusqu'à 140), au-delà du champ du CP ;
- Générateur de calcul (`CalculView`) au CP : les paramètres d'un type ne sont pas filtrés par niveau. Par exemple,
  `dixCent` propose × 100 et des nombres jusqu'à 10 000. C'est acceptable pour un outil libre (les types hors niveau
  sont grisés), mais il faut le savoir.

---

## 2. Propositions

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

### Étape 0 — Couverture honnête et données fausses (petit)

- `src/data/activites.js` : `COMPETENCES_ROUTES[route]` accepte un objet par niveau, en plus d'une liste
  (`{ cp: [...], ce1: [...] }`). On l'utilise pour `/maths/calcul-mental`, `/francais/orthographe` et `/lecture`.
  `src/impression/couverture.js` (`RESSOURCES`) déplie l'objet en une ressource par niveau. Une seule source,
  partagée par `/programme` et `scripts/couverture.mjs`.
- `src/impression/calcul.js` : la compétence de `dixCent` dépend des opérations. `+10`, `-10`, `+100` et `-100`
  donnent `ajouter-dizaines` ; `x10` et `x100` donnent `multiplier-10-100`. Remplacer l'entrée de
  `COMPETENCES_TYPES` par une fonction `(type, params)`. Le slug et le contenu de `fiche-ajouter-retirer-10` ne
  bougent pas.
- `fiche-suites-de-nombres` : `niveaux: 'CE1'` (décision D2). La fiche CP « compter de 2 en 2, de 10 en 10 » relève de
  `numeration-100` : elle vient avec l'étape 2.
- `OrthographeView.vue` : corriger `indice: 'soli___'` en `'sol___'`. Cela modifie la fiche CP de lettres manquantes
  si la question tombe, ce qui est une correction voulue.
- Test : `tests/logique.test.mjs`, une ressource ne déclare au niveau N que des compétences qui ont N dans
  `niveaux`. Ce test aurait attrapé `fiche-ajouter-retirer-10`.

### Étape 1 — Calcul mental CP : les stratégies du programme (petit)

`src/views/maths/CalcuMentalView.vue`, `NIVEAUX.cp` :

- `doubles: [...plage(1, 10), 20, 30, 40, 50]`. Les moitiés suivent (`n * 2`) et donnent 2…20, 40, 60, 80, 100,
  soit exactement `CONTRAINTES.cp.moities`.
- `strat: 100`, avec une liste des stratégies permises par niveau. Le CE1 propose ± 9 **et** ± 11, ce que le CP n'a
  pas. Ajouter à `NIVEAUX` une clé `strats` :
  - CP : `[OP_VERS_DIZ, OP_DIZ, OP_PASSAGE_PLUS, '+ 9']` ;
  - CE1 et au-delà : toutes.

  `opDispo()` lit `strats`. `OP_911` au CP ne tire que `+ 9`. `OP_PASSAGE` au CP : seulement l'ajout (47 + 6) et
  « soustraire un nombre < 10 à un nombre entier de dizaines » (50 − 6, annexe 4 p. 8). Pas de 53 − 7.
- Nouvelle opération CP seulement : `'Fois'`, du type « 3 fois 20 = … (20 + 20 + 20) ». Résultat ≤ 100, facteur
  2 à 5, nombre répété ≤ 20 ou dizaine entière. Elle vise `sens-multiplication`. Libellés : `op_fois` dans
  `src/i18n/fr|br/views/maths/CalcuMentalView.js` ; texte de la question dans le même catalogue (`foisQ`), en breton
  `// br: à relire`.
- `exercices.js`, exercice `calcul-mental` :
  - `choix` : ajouter `'^Fois$'` ;
  - `fiches` : ajouter `classes` `'cp'` à `dizaines` (« ± dizaines, passer la dizaine ») et à `ajouter-9`, avec un
    titre propre au CP (« ajouter 9 ») ;
  - `complements` CP : `['^Compléments à 10$', '^Vers la dizaine']` ;
  - nouvelle fiche `F('fois', '« 3 fois 20 »', 'sens-multiplication', ['^Fois$'], { classes: ['cp'] })`.
- `src/impression/calcul.js` :
  - `neufOnze.niveaux` : ajouter `'cp'` ; `PRESETS_NIVEAU.cp.params.neufOnze = { ops: ['+9'], plage: '100' }` ;
  - `doubles` : nouvelle option de plage `'cp'` (doubles 20, 30, 40, 50 ; moitiés 40, 60, 80, 100), libellé
    `doubles_cp` dans `contenu/calcul-libelles.js` fr et br ;
  - preset CP : `plages: ['10', 'cp']`.
  - **Décision D1** : régénérer `fiche-doubles-et-moities-cp` avec ces valeurs (même slug, contenu modifié
    volontairement).
- Test : la ligne CP de `CAS` existe déjà (`champ('calculMentalMax')`, `tout:Opérations`). Ajouter :
  - `sans(/− (9|11)\b|\+ 11\b/, '± 11 / − 9 au CP')` ;
  - une vérification que les doubles demandés font partie de `CONTRAINTES.cp.doubles`, ou des nombres jusqu'à 10.

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

### Étape 3 — Heure CP (petit)

`src/views/maths/HeureView.vue` :

- `NIVEAUX.cp = { exercices: ['lire', 'placer', 'moment'], exercicesDefaut: ['lire', 'placer'], precisions: ['heure'],
  precisionsDefaut: ['heure'], durees: [], dureesCinq: [], dureesMinute: [], dureeMax: 0, conversions: [] }`.
  `distracteurs()` filtre déjà sur `pool` (`[0]`) : pas de « 3 h 15 » parmi les choix. `placer` : heures 1 à 12
  (`heureMax12`).
- Nouveau sous-exercice `moment` (CP seulement) : « Associer une heure à un moment de la journée » (annexe 4 p. 26).
  Une action familière (se lever, aller à l'école, déjeuner à midi, goûter, se coucher) et trois horloges ; on
  choisit la plausible. Données : `moments` du catalogue `src/i18n/fr|br/contenu/heure.js`, à compléter (breton
  `// br: à relire`). Lire « midi » pour 12 h : vérifier `oral12`.
- Aide de configuration : `aideCp` (« Au CP : les heures entières seulement »), comme `aideCe1`.
- `exercices.js` : `classes` + `C('cp', '^CP$')` ; fiche
  `F('lire', "lire et placer les heures entières", 'heure-entiere', ["Lire l'heure", 'Placer les aiguilles'], { classes: ['cp'] })` ;
  `durees` : `classes: ['ce1', 'ce2']`.
- `activites.js` : `niveaux` + `'cp'` ; `desc` « Heures entières (CP), demies, quarts… ».
- Test : `['/maths/heure', '^CP$', 'cp', [heure, sans(/\b(1[3-9]|2[0-3]) h\b/, 'heure > 12')], ['tout:Exercices', 'tout:Précision']]`.
  `heure()` vérifie déjà la précision `entiere` (60).

### Étape 4 — Monnaie CP (petit)

`src/views/maths/MonnaieView.vue` :

- `NIVEAUX.cp` : `types: ['compter', 'composer', 'moins', 'rendre', 'comparer']`, `notation: 'ec'`,
  `saisieDecimale: false`, `centimesPermis: false` et seulement les blocs `entiers` :
  - `compter.entiers = { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [2, 6], min: 300, max: 10000 }` ;
  - `composer.entiers = { min: 300, max: 10000, pas: 100 }` ;
  - `rendre.entiers` avec `paye` 500, 1000, 2000 et 5000, `rendu` en euros entiers ;
  - `comparer.entiers` avec `max: 5000` ;
  - `palette.entiers`.
- Le choix « Euros entiers / Avec centimes » (lignes 29-30) est masqué si `!niveau.centimesPermis`, et
  `config.centimes` est forcé à `false` au CP. Les fiches lisent `niv.palette[...]` (≤ 20 € pour l'entourage :
  déjà le cas).
- Consigne du programme : « Produire 56 € sans pièce de 1 € » (contrainte). C'est une option possible de `moins`,
  plus tard.
- `exercices.js` : `C('cp', '^CP$')` ; les fiches `compter` et `rendre` valent pour le CP (`monnaie-euros`).
  `centimes` reste `classes: ['ce2']`.
- `activites.js` : `niveaux: ['cp', 'ce1', 'ce2']`.
- Test : `['/maths/monnaie', '^CP$', 'cp', [champ(), sans(/\d+ ?c\b|centime|,\d{2} ?€/, 'centimes au CP')], ['tout:Exercices']]`.

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

### Étape 12 — Orthographe : « Sons et lettres » (petit à moyen)

`src/views/francais/OrthographeView.vue` :

- Nouveau thème `sons` (`niv: 'cp'`, jusqu'au CE2), pour `accents-lettres` (BO n° 41 p. 89) :
  - c/ç/qu (« un ma**ç**on ») ;
  - g/ge/gu ;
  - s/ss entre deux voyelles ;
  - m devant m, b, p (« ja**m**be », « o**m**bre ») ;
  - é/è/ê, avec QCM « Quel accent ? ».

  Questions du même format que `lettres` (`phrase`, `bonne`, `choix`, `explication`). Les explications sont des clés
  du catalogue d'interface, en breton `// br: à relire`.
- Enrichir les `lettres` du CP (lettres muettes finales : « un chat → un chaton », CP p. 89).
- `exercices.js` : `choix` + `'Sons et lettres'` ; `F('sons', 'les sons et les lettres', 'accents-lettres',
  ['Sons et lettres'], { classes: ['cp', 'ce1', 'ce2'] })`. La classe `cp-cm2` (homophones) n'est pas touchée.
- Test : le bloc « Orthographe » de `programme-francais` vérifie déjà les pluriels et les féminins ; ajouter que le
  thème `sons` existe au CP.

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

## 3. Ordre conseillé, effort, décisions

| # | Étape | Effort | Compétences CP gagnées (exercice) |
|---|---|---|---|
| 0 | Couverture honnête, `dixCent`, `fiche-suites-de-nombres`, bug « soli___ » | ½ j | — (le rapport devient juste) |
| 1 | Calcul mental CP (stratégies, doubles, « fois ») + générateur | ½ j | `ajouter-dizaines`, `ajouter-9`, `sens-multiplication`, `doubles-moities` et `complement-dizaine` complets |
| 2 | Numération CP + ordinaux | 1 j | `numeration-100`, `nombres-en-lettres`, `comparer-ranger`, `droite-graduee`, `ordinaux` |
| 3 | Heure CP | ½ j | `heure-entiere` |
| 4 | Monnaie CP | ½ j | `monnaie-euros` |
| 5 | Problèmes CP | 1 j | `problemes-additifs`, `problemes-multiplicatifs`, `problemes-etapes` |
| 6 | Mesures CP | ½ à 1 j | `longueurs`, `masses` |
| 7 | Géométrie CP + parcours | 1 à 2 j | `figures-planes`, `tracer-figures`, `solides`, `reperage-deplacements` |
| 8 | Grammaire CP | 1 j | `phrase`, `sujet-verbe`, `accords-gn`, (`classes-mots`) |
| 9 | Vocabulaire CP | 1 j | `ordre-alphabetique`, `synonymes-antonymes`, `familles-mots` |
| 12 | Orthographe « Sons et lettres » | ½ j | `accents-lettres` |
| 11 | Les lettres : sons, cursive | 1 j | `son-lettres` (+ `nom-lettres` complet) |
| 10 | Lecture : fluence, compréhension, fiches | 2 à 3 j (dont les textes) | `fluence`, `comprendre-texte`, `decodage` complet |
| 13 | Données (nouvelle vue) | 2 j | `tableaux-diagrammes` (+ CE1, CE2) |
| 14 | Affiches numération CP et solides CP | ½ j | (affiches) |

Chaque étape est livrable seule : vue + `activites.js` + `exercices.js` + i18n fr/br + test, un commit par étape.
Après les étapes 0 à 9 et 12 (≈ 8 jours), 36 compétences CP sur 42 ont un exercice (35 si D3 = non). Il reste
`fluence`, `comprendre-texte`, `son-lettres` et `tableaux-diagrammes` (étapes 10, 11 et 13). `cursive` et `copie`
restent couvertes par des fiches, ce qui suffit.

Coût du build : chaque classe CP ajoutée produit `NB_VARIANTES` (4) fiches, plus 2 par compétence et par langue,
soit environ 15 exercices × (4 + 2 × 3) × 2 langues ≈ 300 PDF de plus. Le build parallélisé l'absorbe, mais c'est à
surveiller (TODO « ne pas générer deux fois les mêmes PDF »).

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

## 4. Ce qui manque ou semble douteux dans `programme.js` pour le CP

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
