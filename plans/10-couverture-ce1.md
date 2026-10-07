# Plan 10 — Couvrir tout le programme du CE1

Relevé du 2026-10-04. Sources : `src/data/programme.js` (fait foi), `couverture.html` (généré le même jour), le code
des vues et, pour vérifier ce que le CE1 attend vraiment, les textes officiels relus pour ce plan :
annexe 4 du BO n° 41 (mathématiques cycle 2, PDF de l'annexe, p. 10-19, 27-29, 33-35, 38) et PDF complet du BO
n° 41 (français cycle 2, p. 78-93). Les pages citées ici sont celles du PDF, comme dans `programme.js`.

Rien n'est modifié dans le dépôt par ce plan.

## 1. État actuel

### Chiffres

- **55 compétences** de `programme.js` ont `ce1` dans leurs `niveaux`.
- Rapport `couverture.html`, colonne CE1 : **38 vertes** (au moins deux sortes de ressources), **10 jaunes** (une
  seule sorte), **7 rouges** (rien) : `ordinaux`, `parite-multiples`, `fractions-comparer`,
  `fractions-additionner`, `sens-multiplication`, `tableaux-diagrammes`, `fluence`.
- Le rapport est **optimiste** : une compétence est « couverte par un exercice » dès qu'elle figure dans
  `COMPETENCES_ROUTES` (`src/data/activites.js`), même si l'exercice ne propose rien pour elle au CE1. Vérifié
  dans le code, **15 compétences** que le rapport colore en vert ou en jaune ne sont couvertes qu'en partie, ou
  pas du tout pour `comprendre-texte` (voir les tableaux).
- Il est aussi **pessimiste** sur un point : `src/impression/couverture.js` ne compte que les fiches par compétence
  (`fiches` de `exercices.js`), pas la fiche « bilan » d'une classe. La dictée CE1 a pourtant une fiche toute prête
  (`exercices-dictee-ce1`), et l'orthographe CE1 aussi (`exercices-orthographe-ce1`, thème « Accords »).

Au total, sur 55 : **33 sont bien couvertes**, **14 en partie** (`suites-nombres`, `doubles-moities`,
`fractions-inferieures-1`, `monnaie-centimes`, `durees`, `figures-planes`, `angle-droit`, `solides`,
`reperage-deplacements`, `decodage`, `synonymes-antonymes`, `familles-mots`, `accents-lettres`,
`radical-terminaison`) et **8 pas du tout** (les 7 rouges et `comprendre-texte`).

### Par compétence (CE1)

Légende : 🎯 exercice de l'app avec une option réelle au CE1 · 📄 fiche toute prête ou générateur · 📘 affiche.
« Manque » : écart entre ce que le texte attend au CE1 et ce que proposent les vues.

#### Nombres et calcul (24)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `numeration-1000` | 🎯 Les nombres (Décomposer, Représentation, Écrire en chiffres) · 📄 · 📘 numération ≤ 1 000, nombres en lettres | Collections « non canoniques » (17 unités, 8 dizaines, 2 centaines : p. 10) : à ajouter à « Décomposer », facultatif |
| `nombres-en-lettres` | 🎯 · 📄 · 📘 | — |
| `comparer-ranger` | 🎯 · 📄 | Pas d'affiche (pas nécessaire) |
| `droite-graduee` | 🎯 · 📄 · 📘 droite 0–1 000 | — |
| `ordinaux` | **rien** | Tout : rang dans une file, « combien avant le 48e ? », ordinaux jusqu'à cent, n-ième terme d'une suite répétitive (p. 11) |
| `suites-nombres` | 🎯 « Suivant / suites » · 📄 | `genSuites` (`NumerationView.vue`) ne fait que des suites à pas constant ; le CE1 cite des suites **évolutives** (1, 2, 4, 7, 11… ; 1, 2, 4, 8…) et **répétitives** de symboles (p. 11) |
| `parite-multiples` | **rien** | Pair / impair, « tous les nombres pairs entre 767 et 778 » (p. 14) |
| `fractions-unitaires` | 🎯 Les fractions · 📄 | Pas d'affiche |
| `fractions-inferieures-1` | 🎯 (bouton « Aussi 2/3, 3/4… », présent au CE1) | **Pas de fiche CE1** : la fiche `fractions-1` de `exercices.js` a `classes: ['ce2']` ; décomposition 3/8 = 1/8 + 1/8 + 1/8 et 5/5 = 1 (p. 12) absentes |
| `fractions-comparer` | **rien** | Même dénominateur, ou numérateur 1 (p. 13) |
| `fractions-additionner` | **rien** | Somme et différence de même dénominateur, total ≤ 1, complément à 1 (« 3/10 en bleu, le reste en rouge ? », p. 13) |
| `tables-addition` | 🎯 · 📄 · 📘 | — |
| `tables-multiplication` | 🎯 Calcul mental, Tables · 📄 · 📘 | Calcul mental CE1 : tables de 2, 3, 4, 5 et 10 seulement (`CalcuMentalView.vue`, `ce1.mul`) ; le texte (p. 14) vise A et B de 0 à 10, « étalé sur l'année » — voir décisions |
| `doubles-moities` | 🎯 · 📄 | `ce1.doubles` (`CalcuMentalView.vue`) n'a pas 100, 150, 200, 250, 300, 500 → ni ces doubles ni les moitiés de 200 à 1 000 ; multiples de 25 (1 × 25 … 4 × 25) absents ; moitié d'un nombre pair quelconque (470) absente (p. 14-16) |
| `complement-dizaine` | 🎯 · 📄 | — |
| `ajouter-dizaines` | 🎯 · 📄 | — |
| `ajouter-9` | 🎯 · 📄 | — |
| `multiplier-10-100` | 🎯 (× 10 d'un nombre < 100) · 📄 | — |
| `addition-posee` | 🎯 · 📄 | — |
| `soustraction-posee` | 🎯 · 📄 | — |
| `sens-multiplication` | **rien** | Symbole × lu « fois », 7 × 20 = 20 + 20 + … ; commutativité sur un quadrillage (8 × 4 = 4 × 8) (p. 13) |
| `problemes-additifs` | 🎯 · 📄 | — |
| `problemes-multiplicatifs` | 🎯 · 📄 | — |
| `problemes-etapes` | 🎯 · 📄 | — |

#### Grandeurs et mesures (7)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `longueurs` | 🎯 Mesures · 📄 | Encadrer une longueur entre deux entiers de cm (p. 27), facultatif |
| `masses` | 🎯 · 📄 | — |
| `monnaie-euros` | 🎯 · 📄 (deux fiches) · 📘 | — |
| `monnaie-centimes` | 🎯 « Avec centimes » · 📘 euros et centimes | Au CE1, `MonnaieView.vue` a `notation: 'ec'` (« 3 € 50 c »), `saisieDecimale: false` et pas le type `convertir` : **ni écriture à virgule ni conversions** (345 c = 3 € 45 c = 3,45 € ; 2,05 € / 2,50 €), alors que le CE1 les demande dès la période 3 (p. 27-28) et que `CONTRAINTES.ce1.monnaie.virgule` vaut `true`. Pas de fiche CE1 (`centimes` : `classes: ['ce2']`) |
| `heure-entiere` | 🎯 (précision « Heure » au CE1) | Pas de fiche ni d'affiche CE1 étiquetées (l'affiche « heures entières » est CP) ; acceptable, la fiche « demies et quarts » contient des heures entières |
| `heure-demi-quart` | 🎯 · 📄 · 📘 | — |
| `durees` | 🎯 · 📄 | 1 h = 60 min, ½ h = 30 min, ¼ h = 15 min, comparer 2 h et 130 min (p. 29) : le type `conversion` n'existe qu'au CE2 |

#### Espace et géométrie (5)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `figures-planes` | 🎯 Géométrie (« Figures ») · 📄 · 📘 « Formes planes » | L'affiche `plan-cycle2` (GS · CP · CE1) n'a **ni le cercle ni le triangle rectangle**, les deux figures du CE1 ; l'exercice « Propriétés » (rectangle : côtés opposés égaux, 4 angles droits — exigé p. 34) n'est proposé qu'au CE2 |
| `angle-droit` | 🎯 seulement la question « Cette figure a-t-elle au moins un angle droit ? » de `genFigure` | L'exercice « Angles droits » (`genAngles`) et la fiche `angles` sont **CE2 seulement** ; or équerre et codage de l'angle droit sont au CE1 (p. 34) |
| `tracer-figures` | 🎯 · 📄 | Tracés à l'équerre et au compas : hors d'une app, rien à faire de plus |
| `solides` | 🎯 · 📄 · 📘 | `ce1.solidesComptage: ['cube', 'pave']` : pas la pyramide, et **aucune question sur les arêtes** (`genSolide` : faces, sommets). Le CE1 décrit cube, pavé **et pyramide** avec face, sommet, arête (p. 33 ; `CONTRAINTES.ce1.solidesDecrits`) |
| `reperage-deplacements` | 🎯 « Repérage » · 📄 | `genReperage` ne fait que des coordonnées de case (B3). Le CE1 demande de **coder un déplacement** : avancer, pivoter d'un quart de tour, 15 instructions au plus dont 4 virages (p. 35). Les coordonnées de case n'apparaissent nulle part au cycle 2 |

#### Données (1)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `tableaux-diagrammes` | **rien** | Lire un diagramme en barres (axe gradué de 1 en 1, 2 à 5 valeurs, moins de 100 individus), un tableau à double entrée ; produire un diagramme (p. 38) |

#### Lecture (3)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `decodage` | 🎯 Lecture & Syllabes (compter les syllabes, reconstituer un mot) | Pseudo-mots avec CGP complexes (« doir, stag, choust, valin, cagnou », p. 78), lettres muettes en lecture ; pas de fiche (Lecture absente de `EXERCICES`) |
| `fluence` | **rien** | 70 mots par minute en fin d'année (p. 78) |
| `comprendre-texte` | 🎯 en apparence : le mode « Lecture de textes » affiche un texte et un bouton « J'ai lu », **sans aucune question** | Tout : qui, où, quand, ordre des événements, reprises (« il » = qui ?), titre, inférences simples (p. 78-79) |

#### Écriture (3)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `cursive` | 📄 Fiches d'écriture (minuscules et majuscules attachées) | L'affiche de l'alphabet (4 écritures, MS → CE1) n'est étiquetée que `nom-lettres`, alors que « reconnaître les lettres dans les quatre écritures » est un objectif du CE1 (p. 83) |
| `copie` | 📄 Fiches d'écriture (contenu « Phrases ») | Pas de fiche de copie toute prête (4-5 phrases, puis 5-6 lignes, p. 83) |
| `dictee` | 🎯 Dictée · 📄 fiche bilan `exercices-dictee-ce1` (non comptée par le rapport) | — |

#### Vocabulaire (5)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `ordre-alphabetique` | 🎯 · 📄 | — |
| `synonymes-antonymes` | 🎯 · 📄 | « Sens propre / figuré » (`sensFigure`) n'est proposé qu'au CE2, mais il est au CE1 (p. 89) ; niveaux de langue (familier, courant, soutenu, p. 89) absents |
| `familles-mots` | 🎯 · 📄 (deux fiches) | Suffixes (`suffixes`) CE2 seulement ; le CE1 cite -eur/-euse, -er (boulanger), préfixes para-, multi-, anti- (p. 89) |
| `orthographe-lexicale` | 🎯 Dictée, Orthographe · 📄 | La question « Il fa___ froid » (`fait`) est marquée `niv: 'ce1'` dans `OrthographeView.vue`, alors que l'interprétation de `programme.js` (même compétence) renvoie les formes irrégulières au CE2 |
| `accents-lettres` | 🎯 Orthographe, mais **aucun thème** ne travaille s/ss, c/ç, g/ge/gu, les accents ou la lettre muette finale | Tout le contenu (p. 90) |

#### Grammaire et conjugaison (7)

| Compétence | Ce qui couvre (vérifié) | Manque au CE1 |
|---|---|---|
| `phrase` | 🎯 · 📄 | — (manipulations de phrase : déplacement, suppression, substitution, p. 93 : facultatif) |
| `classes-mots` | 🎯 · 📄 | Nom commun / nom propre à nommer (p. 93) : vérifier que « Nature d'un mot » le demande au CE1 |
| `sujet-verbe` | 🎯 · 📄 | — |
| `accords-gn` | 🎯 · 📄 | — |
| `radical-terminaison` | 🎯 seulement en creux (Conjugaison, mode « lacunes » : le radical est donné) | Identifier radical et terminaison, **trouver l'infinitif** d'un verbe conjugué (« ils plieront, tu as plié → plier », p. 93) |
| `conjugaison-present-etre-avoir` | 🎯 · 📘 | — |
| `conjugaison-4-temps` | 🎯 · 📄 (4 fiches) · 📘 | — |

## 2. Propositions

Principes : ajouter des options aux vues existantes (`NIVEAUX`/`TYPES` de chaque vue, cadre `ConfigExercice`,
`htmlFiche()`, `ligneNomDate(langue)` et `<section class="corrige">` de `useOptionsFiche`), ne créer une vue que
pour un domaine sans aucun exercice (Données).

Deux règles valent pour chaque proposition :

- **Fiches publiées.** Un nouveau type proposé par défaut au CE1 change la fiche bilan de la classe
  (`exercices-<id>-ce1`) : c'est un changement voulu, à dire dans le message de commit et à vérifier avec
  `?graine=N` avant/après. En revanche, les fiches par compétence ne doivent pas changer : **ajouter le libellé du
  nouveau bouton à `choix`** de l'exercice dans `exercices.js` (sinon le build le laisse coché sur toutes les fiches
  par compétence). Les slugs existants ne changent pas ; les nouvelles fiches créent de nouveaux slugs
  `exercices-<id>-ce1-<fiche>`.
- **Breton.** Les consignes nouvelles vont dans `src/i18n/br/views/…` et `src/i18n/br/contenu/…` avec
  `// br: à relire`. Les exercices de français restent en `fr` (`enLangue('fr', …)`) : seuls les libellés
  d'interface sont traduits.

### P1. Corrections de données (petit, sans nouvelle vue)

1. `src/impression/exercices.js` :
   - fiche `fractions-1` (« les fractions jusqu'à 1 ») : `classes: ['ce1', 'ce2']` ;
   - fiche `angles` (Géométrie) : `classes: ['ce1', 'ce2']` (après P4) ;
   - fiche `centimes` (Monnaie) : `classes: ['ce1', 'ce2']` (après P6).
2. `src/views/maths/CalcuMentalView.vue`, `NIVEAUX.ce1.doubles` : ajouter `100, 150, 200, 250, 300, 500`
   (liste de `CONTRAINTES.ce1.doubles`), ce qui donne aussi les moitiés de 200 à 1 000. Le test
   `champ('calculMentalMax')` (≤ 1 000) reste vrai. Optionnel : « 3 × 25 », « 100 = 4 × … » dans « Doubles ».
3. `src/views/maths/GeometrieView.vue`, `NIVEAUX.ce1.solidesComptage: ['cube', 'pave', 'pyramide']`, et un
   sous-type `aretes` dans `genSolide` pour cube, pavé et pyramide (12, 12, 8 arêtes pour la pyramide à base
   carrée) ; clé de contenu `solideAretesQ` en fr et br (`// br: à relire`).
4. `src/data/activites.js`, `COMPETENCES_ROUTES['/imprimer/alphabet']` : ajouter `cursive` (l'affiche n'est que
   jusqu'au CE1 : la compétence `cursive` y est bien au programme).
5. `src/views/francais/OrthographeView.vue` : la question « Il fa___ froid » passe à `niv: 'ce2'` (ou est
   remplacée par un mot invariable), pour suivre l'interprétation de `orthographe-lexicale`. Ajouter le cas au
   test `programme-francais.test.mjs` (section Dictée : formes irrégulières, le motif `FORMES` y existe déjà).
6. `src/impression/couverture.js` : compter aussi la fiche bilan d'une classe (`ex.classes` sans `fiches` pour
   cette classe → les compétences de l'activité, `ACTIVITES.find(a => a.to === ex.route).competences`), pour que
   la dictée et l'orthographe CE1 apparaissent avec 📄. Et, pour que le rapport cesse d'être optimiste, une
   colonne « option au CE1 ? » : la compétence a-t-elle une fiche dans `fichesDe(ex, 'ce1')` (déjà affiché dans la
   partie « par exercice », à reporter dans le tableau par domaine).

Effort : une demi-journée, tests compris.

### P2. Les nombres : parité, ordinaux, suites évolutives (`NumerationView.vue`)

- `NIVEAUX` reçoit une liste `types` par niveau (aujourd'hui tous les types sont pour tous les niveaux), comme
  `FractionsView.vue` : `ordinaux` est CP-CE1 seulement (`programme.js`), donc absent du CE2.
  - CE1 : types actuels + `parite` + `ordinaux`. CE2 : types actuels + `parite`.
- `genParite(niv, max)` : « 347 est-il pair ou impair ? » (choix), « Entoure les nombres pairs » (fiche : 8
  nombres), « Écris tous les nombres pairs entre 767 et 778 » (saisie de la liste, fiche : ligne). Champ ≤ 1 000.
- `genOrdinaux(niv, max)` :
  - file dessinée (6 à 10 animaux en SVG ou emoji, déjà utilisés ailleurs) : « Quel est le 4e ? », « À quelle place
    est le chat ? » ;
  - « 167 coureurs. Combien sont arrivés avant le 48e ? » (réponse 47) ;
  - suite répétitive : « ABGFABGF… : quelle est la 17e lettre ? », « △ ▢ ○ △… : quel est le 60e symbole ? » ;
  - ordinal en lettres ↔ en chiffres jusqu'à cent (« quarante-huitième » ↔ « 48e »), fr seulement tant que le
    breton n'est pas vérifié (voir décisions).
- `genSuites` : un tirage « suite évolutive » (écarts +1, +2, +3… ou doublement) au CE1 et au CE2, en gardant le
  champ ≤ `max`. Ne touche pas les suites existantes (nouvelle branche, probabilité à part).
- Libellés `type_parite` (« Pair ou impair »), `type_ordinaux` (« Premier, deuxième… ») dans
  `src/i18n/fr|br/views/maths/NumerationView.js` ; ordinaux en chiffres dans `src/i18n/*/contenu/numeration.js`
  (le breton a déjà `ordinal` dans `contenu/fractions.js`, marqué à relire : le réutiliser ou le déplacer dans un
  module commun). « pair / impair » en breton (« par / ampar ») : `// br: à relire`.
- `exercices.js`, exercice `nombres` : `choix` += `'Pair ou impair'`, `'Premier, deuxième'` ;
  fiches `F('parite', 'pair ou impair', 'parite-multiples', ['Pair ou impair'])` et
  `F('ordinaux', 'les nombres ordinaux', 'ordinaux', ['Premier, deuxième'], { classes: ['ce1'] })`.
- Tests : `tests/programme-maths.test.mjs` garde `champ()` pour `/maths/numeration` CE1 (activer
  `tout:Exercices`) ; ajouter `sans(/premier|deuxième|\d+e\b/i, 'ordinaux')` au cas CE2 ; `tests/logique.test.mjs`
  vérifie déjà que chaque fiche par compétence est au programme de sa classe.
- Affiche (facultatif) : « Les nombres pairs et impairs » (bande 0-20 pairs en couleur) dans la famille `droite`
  (`affiches/droite.js` sait déjà dessiner une bande) — à valider.

Effort : 1 à 1,5 jour.

### P3. Fractions : comparer, additionner, décomposer (`FractionsView.vue`)

- Nouveaux types, CE1 et CE2 (`NIVEAUX.ce1.types`, `NIVEAUX.ce2.types`, `TYPES`, `GENERATEURS`) :
  - `comparer` : deux fractions dessinées sur deux barres de même longueur (réutiliser `formeBarre`), choix `<`,
    `=`, `>`. CE1 : même dénominateur, ou numérateur 1 (1/3 et 1/6) ; CE2 : idem plus `fractions-comparer` du CE2
    (fractions < 1, toujours dénominateurs de `niv.denominateurs`). Pas de « = » entre fractions différentes au
    CE1 (pas de fractions égales avant le CE2).
  - `additionner` : `a/d + b/d` et `a/d − b/d` avec résultat entre 0 et 1, dessin facultatif ; `2/5 + 3/5 = 1` ;
    complément à l'unité (« Lucie a colorié 3/10 en bleu, le reste en rouge… »). Réponse : numérateur à saisir
    (dénominateur affiché).
  - dans `lettres` (ou un type `decomposer`) : « 3/8 = 1/8 + … + … » et « 5/5 = 1 » pour
    `fractions-inferieures-1`.
- Fiche : `htmlFiche()` reçoit deux cas (`comparer` : deux barres et une case ; `additionner` : égalité à
  trou, comme `egales`).
- Libellés fr et br (`type_comparer` « ⚖️ Comparer », `type_additionner` « ➕ Additionner ») ; consignes
  nouvelles : `// br: à relire`. Les fractions en lettres existent déjà en breton (`C.t('enLettres')`).
- `exercices.js`, exercice `fractions` : `choix` += `'Comparer'`, `'Additionner'` ; fiches
  `F('comparer', 'comparer des fractions', 'fractions-comparer', ['Comparer'])` et
  `F('additionner', 'additionner des fractions', 'fractions-additionner', ['Additionner'])` (CE1 et CE2) ; la
  fiche `fractions-1` passe aux deux classes (P1).
- Tests : le contrôle `fractions` de `programme-maths.test.mjs` (dénominateurs, ≤ 1, pas de fraction d'une
  quantité) couvre déjà les nouveaux types si le cas CE1 active `tout:Exercices` en plus de `^Aussi 2/3`.
- Affiche (à valider, voir TODO « Nouvelles affiches ») : « Les fractions » CE1 — 1/2, 1/3, 1/4, 1/5, 1/6, 1/8,
  1/10 en barres, mots « numérateur » / « dénominateur ». Nouveau module `affiches/fractions.js` dans le cadre
  (`cadreAffiche`, `mesuresAffiche`), entrée dans `AFFICHES_PROGRAMME` et `competencesAffiche`
  (`fractions-unitaires`, `fractions-inferieures-1`), `DOMAINES_AFFICHES.fractions = 'nombres-calcul'`, une
  affiche toute prête `affiche-fractions-ce1`. Test `tests/affiches.test.mjs` (rien ne dépasse).

Effort : 1,5 jour (2,5 avec l'affiche).

### P4. Géométrie CE1 : angle droit, propriétés, déplacements codés (`GeometrieView.vue`)

- `NIVEAUX.ce1.exercices` += `'angles'`, `'proprietes'`, et `anglesFormes` pour le CE1 sans `trapeze_rectangle`
  (le nom n'est pas affiché, mais autant rester sur carré, rectangle, triangle rectangle, triangle, `un_angle`,
  `sans_angle`).
- `genPropriete(niv)` : filtrer `PROPRIETES` par niveau (au CE1 : retirer `q-losange` et `v-losange-ad`) et
  construire les choix à partir des noms du niveau (`niv.figures` via `nomFig`) au lieu de
  `C.t('choixFigures')`, qui contient « losange » : aucun texte breton nouveau. Le test `figures` (« losange »
  interdit au CE1) le garantit.
- Sous-type `deplacement` de `reperage` (CE1 et CE2) : une case de départ, une flèche d'orientation, un
  programme d'au plus 15 instructions dont 4 virages (« avancer de 2 », « pivoter d'un quart de tour à droite ») ;
  question « Sur quelle case arrive le robot ? » (clic sur la grille ; fiche : colorier la case), et l'inverse
  « Écris le programme » (fiche seulement, corrigé possible parmi d'autres : le dire dans le corrigé).
  Instructions dans `contenu/geometrie.js` fr et br (`// br: à relire`).
- `exercices.js`, exercice `geometrie` : `choix` contient déjà `'Angles droits'` et `'Propriétés'` ; fiche
  `angles` aux deux classes (P1) ; une fiche CE1 `figures` qui ajoute `'Propriétés'` (ou une fiche à part
  « les propriétés du carré et du rectangle », compétence `figures-planes`).
- Affiche : une variante `plan-ce1` dans `LOTS_FORMES` (`cercle`, carré, rectangle, triangle, triangle
  rectangle) et une variante `plan-ce2` (+ losange), étiquetées « CE1 » et « CE2 » ; `plan-cycle2` redevient
  « GS · CP ». Il faut un dessin `cercle` dans `FIGURES` de `affiches/formes.js` (contour, centre marqué ; le
  `disque` existe). Slug nouveau `affiche-figures-planes-ce1` ; le slug publié `affiche-formes-planes-cycle-1-2`
  garde son contenu, seules ses classes changent.

Effort : 1,5 jour (déplacements compris), 0,5 jour pour l'affiche.

### P5. Données : nouvel exercice `DonneesView` (domaine `donnees`)

Aucun exercice ne relève de ce domaine : une vue est justifiée.

- `src/views/maths/DonneesView.vue`, route `/maths/donnees` (`src/router/index.js`), cadre `ConfigExercice`,
  `useModeExercice`, `htmlFiche()`, réglages `chargerReglages('donnees_config', …)`.
- `NIVEAUX` : `ce1` (diagramme en barres à axe gradué de 1 en 1, 2 à 5 catégories, effectifs < 100 au total ;
  tableau simple ; tableau à double entrée avec totaux, nombres ≤ 1 000) ; `ce2` prévu (échelle adaptée, compléter
  un tableau, problèmes : p. 38) — le CE2 fera partie de son propre plan.
- Types : `lireDiagramme` (« Quelle couleur est la plus fréquente ? », « Combien d'élèves viennent à pied ? »,
  « Combien de plus ? »), `lireTableau` (double entrée : « Combien de garçons viennent en vélo ? »),
  `construire` (fiche : tracer les barres sur une grille à partir d'un tableau ; dans l'app : régler la hauteur
  des barres au clic).
- Données : thèmes (couleurs préférées, moyens de transport, fruits, animaux) dans
  `src/i18n/fr/contenu/donnees.js` et `src/i18n/br/contenu/donnees.js` (`// br: à relire`) ; libellés
  d'interface dans `src/i18n/fr|br/views/maths/DonneesView.js`. Dessins SVG en ligne (pas de dépendance).
- `src/data/activites.js` : carte `{ fiche: true, to: '/maths/donnees', matiere: 'maths', domaine: 'donnees',
  rubrique: 'Organisation et gestion de données' (nouvelle clé dans `DOMAINES_BR`, à relire), niveaux: ['ce1'] }`
  (puis `ce2`), `COMPETENCES_ROUTES['/maths/donnees'] = ['tableaux-diagrammes']`, ligne dans `BR`.
- `src/impression/exercices.js` : `{ id: 'donnees', route: '/maths/donnees', groupe: 'maths', classes:
  [C('ce1', '^CE1$')] }` — une seule compétence, pas de `fiches` (la fiche bilan suffit ; voir P1.6 pour qu'elle
  soit comptée).
- Tests : cas `['/maths/donnees', '^CE1$', 'ce1', [champ()], ['tout:Exercices']]` dans
  `programme-maths.test.mjs` ; la route est vue par `routes.test.mjs` (fr et br, libellés), `cadre.test.mjs`
  et `memorises.test.mjs` (réglages corrompus) si la vue suit le cadre.
- Affiche (TODO « Nouvelles affiches ») : « Lire un diagramme en barres et un tableau à double entrée »
  (nouvelle famille `affiches/donnees.js`, compétence `tableaux-diagrammes`, CP · CE1 · CE2).

Effort : 2 à 3 jours (vue, fiche, contenu, tests), +0,5 jour pour l'affiche.

### P6. Monnaie CE1 : écriture à virgule et conversions (`MonnaieView.vue`)

- `NIVEAUX.ce1.types` += `'convertir'` (le générateur `genConvertir` existe) avec un champ plus petit
  (`convertir: { min: 105, max: 995 }`, déjà la valeur par défaut) ; garder les sous-types `c2ec`, `ec2c` et
  ajouter `dec2c`, `ec2dec` (« 2 € 5 c = 2,05 € ») seulement si l'écriture à virgule est choisie.
- Réglage « Écriture à virgule (à partir de la période 3) » au CE1 (`notation: 'les2'`,
  `saisieDecimale: true` quand il est coché ; décoché par défaut pour ne pas changer la fiche bilan publiée).
- `exercices.js` : `choix` contient déjà `'1 € = 100 c'` ; la fiche `centimes` passe aux deux classes, avec
  `clics: ['Options › Avec centimes']` (et la virgule cochée).
- Test : le cas CE1 (`champ()`) reste vrai (centimes ≤ 99, euros ≤ 20).

Effort : une demi-journée.

### P7. Sens de la multiplication

Recommandation : une option « × en images » dans `CalcuMentalView.vue` (seule vue qui a des niveaux de CP à
CM2 et le mécanisme des fiches par compétence ; `TablesView.vue` n'a ni niveau ni entrée dans `exercices.js`).

- Questions : quadrillage de points (`svgJetons` de `FractionsView.vue` peut servir de modèle) « Combien de
  points ? Écris-le avec × » → deux réponses acceptées (4 × 6 ou 6 × 4) ; « 7 + 7 + 7 = … × … » ;
  « 3 fois 20 biscuits = … biscuits ». Facteurs dans les tables du niveau (`niv.mul.tables`), produits ≤ 1 000.
- `TOUTES_OPS` += `'× en images'`, `CLE_OP`, disponibilité CE1 → CM2 (`sens-multiplication` va de CP à CM2 :
  au CP, sans le signe × — à traiter dans le plan CP).
- `exercices.js`, exercice `calcul-mental` : `choix` += `'^× en images'`, fiche
  `F('sens-multiplication', 'le sens de la multiplication', 'sens-multiplication', ['^× en images'],
  { classes: ['ce1'] })`.
- Libellés fr/br (`op_images`, consignes) : `// br: à relire`.

Effort : 1 jour.

### P8. Lecture : compréhension, fluence, pseudo-mots (`LectureView.vue`)

Le plus gros manque du français. Contenu en français seulement ; textes écrits à la main (pas d'appel au service
externe de `genererTexteMistral`, que la règle « aucune requête vers un autre site » rend de toute façon douteux :
à signaler à l'utilisateur).

- **Compréhension** : un mode « Lire et répondre » avec une bibliothèque de textes CE1 (8 à 15 lignes,
  narratifs, documentaires, une recette ou une règle du jeu), chacun avec 4 à 6 questions à choix : personnage,
  lieu, moment, ordre de deux événements, reprise (« Dans la phrase 3, “il”, c'est qui ? »), titre, une inférence
  simple. Données dans un fichier à part `src/data/lecture-ce1.js` (pur, lu par node) ; CP et CE2 ensuite.
  Fiche : texte + questions + corrigé.
- **Fluence** : fiche « Lire en une minute » : un texte avec, en marge, le nombre cumulé de mots par ligne
  (format usuel des tests de fluence), cible 70 mots (`CONTRAINTES.ce1.lectureMotsParMinute`), et tableau de suivi
  (date, mots lus, erreurs). Dans l'app : chronomètre d'une minute, l'adulte touche le dernier mot lu → mots par
  minute. Le compte des mots doit suivre une règle écrite (« l'arbre » = 2 mots ?) : la mettre en commentaire et
  dans un test unitaire (`tests/logique.test.mjs`).
- **Décodage** : liste de pseudo-mots à lire (fiche), construits à partir des CGP (`doir, stag, choust, valin,
  cagnou`), et phrases avec lettres muettes (« ils chantent »).
- `exercices.js` : entrée `lecture` (`/lecture`) avec `classes: [C('cp', '^CP$'), C('ce1', '^CE1$')]`, `choix`
  sur les cartes de mode, fiches `comprendre` (`comprendre-texte`), `fluence` (`fluence`), `decodage`
  (`decodage`). Le build clique des boutons : les cartes de mode doivent être des boutons au texte stable.
- `activites.js` : `COMPETENCES_ROUTES['/lecture']` += `fluence`.
- Tests : `programme-francais.test.mjs` — la fiche CE1 contient des questions et un corrigé ; aucun texte ne
  dépasse 15 lignes au CE1.

Effort : 3 à 4 jours, dont l'essentiel en écriture et relecture des textes (à faire relire par un·e
enseignant·e, plan 07).

### P9. Français : infinitif, valeur des lettres, vocabulaire du CE1

1. **Radical, terminaison, infinitif** — `GrammaireView.vue`, groupe `accordSV` ou nouveau groupe `verbe` :
   types `infinitif` (« ils plieront, tu as plié, vous pliez → ? », choix parmi 3 infinitifs) et `radical`
   (« chant|ons » : cliquer la coupure, fiche : trait vertical), `niv: ['ce1', 'ce2', ...CM]`. Les formes viennent
   de `src/data/conjugaison.js` (`conjuguer`, verbes du 1er groupe et temps de `CONTRAINTES.ce1.conjugaison`).
   `exercices.js` : `choix` += les libellés, fiche `F('infinitif', "radical, terminaison et infinitif",
   'radical-terminaison', [...])`. Test : `RESERVE` de `programme-francais.test.mjs` n'a rien à ajouter (dès le
   CE1) ; vérifier que les verbes proposés au CE1 sont du 1er groupe.
2. **Valeur des lettres et accents** — `OrthographeView.vue`, nouveau thème `lettres-sons` (`niv: 'cp'`, questions
   CE1 marquées `niv: 'ce1'`) : c / ç / qu (garçon, glaçon, nous forçons), g / ge / gu (girafe, garder, guitare),
   s / ss (poison, poisson), m devant m, b, p, é / è / ê, lettre muette finale par un mot de la famille
   (blanc → blanche, chant → chanter). `exercices.js` : `choix` += `'Lettres et sons'`, fiche
   `F('lettres-sons', 'les lettres et les sons', 'accents-lettres', ['Lettres et sons'], { classes: ['cp', 'ce1', 'ce2'] })`.
3. **Vocabulaire CE1** — `VocabulaireView.vue` : `sensFigure` passe à `niv: ['ce1', 'ce2']` avec des données CE1
   (« avoir une peur bleue », « prendre ses jambes à son cou », p. 89) ; `suffixes` à `['ce1', 'ce2']` avec, au
   CE1, -eur/-euse et -er seulement ; nouveau type `niveauxLangue` (familier / courant / soutenu :
   « bagnole / voiture / automobile ») CE1-CE2. Fiches : `sens` reçoit `'Niveaux de langue'` ; `familles` est
   déjà définie pour les deux classes. Libellés d'interface fr/br (`// br: à relire`).

Effort : 1 + 1 + 1 jour.

### P10. Heure CE1 : 1 h = 60 min (`HeureView.vue`)

- `NIVEAUX.ce1.exercices` += `'conversion'` avec `conversions: ['h-min', 'hmin-min', 'min-hmin']` restreintes aux
  quarts d'heure (60, 30, 15, 45, 75, 90, 120 min…). Attention : l'exemple du programme « 2 heures et 130 minutes »
  échoue au test `heure` (130 n'est pas un multiple de 15) ; rester sur des multiples de 15 au CE1.
- `exercices.js` : la fiche `durees` a déjà `'h et min'` dans ses options ; vérifier que le libellé du bouton
  correspond.

Effort : une demi-journée.

### P11. Copie (facultatif)

Fiches toutes prêtes « Copier un texte » CE1 (4-5 phrases, puis 5-6 lignes) dans `src/impression/catalogue.js`
(entrées `ECRITURE` existantes), textes de `TEXTES_DEFAUT_CE1`, compétence `copie`. Effort : 0,5 jour.

## 3. Ordre conseillé et effort

| Étape | Contenu | Effort | Compétences qui passent au vert |
|---|---|---|---|
| 1 | P1 (données, rapport) + P6 (monnaie) | 1 j | `fractions-inferieures-1`, `monnaie-centimes`, `doubles-moities` complet, `solides` complet |
| 2 | P4 (géométrie : angles, propriétés, affiche CE1) | 1,5 j | `angle-droit`, `figures-planes` complet |
| 3 | P3 (fractions comparer / additionner) | 1,5 j | `fractions-comparer`, `fractions-additionner` |
| 4 | P2 (parité, ordinaux, suites évolutives) | 1,5 j | `parite-multiples`, `ordinaux`, `suites-nombres` complet |
| 5 | P7 (× en images) + P10 (heure) | 1,5 j | `sens-multiplication`, `durees` complet |
| 6 | P9 (infinitif, lettres et sons, vocabulaire) | 3 j | `radical-terminaison`, `accents-lettres` |
| 7 | P5 (Données) | 2,5-3 j | `tableaux-diagrammes` |
| 8 | P8 (lecture) | 3-4 j | `comprendre-texte`, `fluence`, `decodage` |
| 9 | P4 déplacements codés, affiches fractions et données, P11 | 2 j | `reperage-deplacements` complet |

Chaque étape est livrable seule : `npm test` (une seule exécution à la fois), `npm run i18n` à 0 problème,
`npm run couverture` relancé, comparaison des fiches bilan CE1 avant/après à graine fixe pour lister les
changements voulus.

## 4. Décisions à prendre (avec recommandation)

1. **Tables de multiplication au CE1** : le calcul mental et les problèmes CE1 s'arrêtent aux tables de 2, 3, 4,
   5 et 10 ; le texte (p. 14) vise A et B de 0 à 10, étalés sur l'année, mémorisation « encore imparfaite » en fin
   de CE1. *Recommandation* : garder 2, 3, 4, 5, 10 par défaut et ajouter « 6 à 9 (fin d'année) » en option non
   cochée.
2. **Fiches bilan qui changent** (nouveaux types cochés par défaut au CE1 en numération, fractions, géométrie,
   grammaire, vocabulaire) : *recommandation* : accepter, en le disant dans les commits ; ne pas cocher par
   défaut l'écriture à virgule de la monnaie (période 3).
3. **Ordinaux en breton** : les mots (kentañ, eil, trede, pevare, pempvet…) ne sont pas dans la liste des
   données vérifiées. *Recommandation* : en breton, ordinaux en chiffres seulement (`1añ, 2vet…`, à relire) tant
   qu'une source n'est pas citée comme pour les nombres ; les ordinaux en lettres restent en français.
4. **Sens de la multiplication** : dans `CalcuMentalView` (recommandé) ou dans `TablesView` (qui n'a pas de
   niveaux).
5. **Données** : nouvelle vue CE1 seule maintenant (recommandé), CE2 et CM dans leurs plans.
6. **Lecture** : écrire une bibliothèque de textes et de questions (recommandé ; relecture par un·e
   enseignant·e) ; et décider du sort de `genererTexteMistral` (requête vers un autre site si une clé est saisie).
7. **Repérage par coordonnées (B3)** au CE1 : absent du cycle 2 ; *recommandation* : le garder (sans dommage)
   mais ajouter les déplacements codés, et corriger la phrase de `savoirs.js` (« Je repère une case… (B3) »).

## 5. Ce qui manque ou paraît douteux dans `programme.js` pour le CE1

Sources : annexe 4 du BO n° 41 (maths, PDF de l'annexe) et PDF complet du BO n° 41 (français).

- **Manquent (attendus explicitement au CE1)**
  - Calcul mental : « Calculer le produit d'un nombre compris entre 11 et 19 par un nombre inférieur à 10 »
    (distributivité, 13 × 7 = 70 + 21), « soustraire un nombre inférieur à 9 » (523 − 7), « moitié d'un nombre
    pair » par décomposition (470), multiples de 25 — c2maths p. 14-16. Les deux premiers pourraient devenir
    une compétence `strategies-calcul` (ou entrer dans `ajouter-9` / `doubles-moities`).
  - Commutativité de la multiplication (c2maths p. 13) : à ajouter au libellé de `sens-multiplication`.
  - Fluence en calcul : « douze résultats en trois minutes » (p. 14), douze égalités en une minute pour les
    tables d'addition, huit pour les tables de multiplication et les doubles : rien dans `CONTRAINTES` (une clé
    `fluenceCalcul` permettrait un mode chronométré cohérent).
  - Grandeurs : longueurs et masses de référence, estimer, encadrer une longueur entre deux entiers de cm
    (p. 27) ; heure : relations 1 h = 60 min, ½ h, ¼ h et comparaison de durées (p. 29) — dans `durees`, mais
    à dire dans le libellé.
  - Géométrie : points alignés, milieu d'un segment (pliage), angle aigu / obtus, assemblages de cubes et de pavés
    (p. 34-35) ; propriétés du carré et du rectangle (p. 34) à mentionner dans `figures-planes`.
  - Problèmes : montants avec centimes dès le CE1 (« un pain à 1,20 € », p. 17-18) ; `CONTRAINTES.ce1` dit
    `decimalesMax: 0` hors monnaie, c'est cohérent, mais `problemes-*` ne le précisent pas.
  - Français, écriture : **« Produire des écrits »** (phrase à partir d'une phrase prototypique, texte de une à
    trois phrases, connecteurs : BO n° 41 p. 83) n'a aucune compétence ; **oral** : aucune compétence au cycle 2
    (domaine présent mais vide). Choix assumé (« compétences utiles à nos activités ») à confirmer.
  - Vocabulaire : termes génériques / spécifiques, niveaux de langue, sens propre / figuré, expressions
    (BO n° 41 p. 89) : aucune compétence ne les nomme (au plus `synonymes-antonymes`). Proposer
    `relations-mots` (CP → CM2) ou élargir le libellé.
  - Grammaire : constituants de la phrase « groupe sujet, verbe et compléments sans distinguer ces derniers »
    (p. 93), manipulations (déplacement, suppression, substitution), accord du verbe au pluriel en dictée
    (« marque de pluriel des verbes = nt », p. 83).
  - Lecture : pseudo-mots, lecture expressive (p. 78) — inclus dans `decodage` / `fluence`, mais sans contrainte.
- **Douteux**
  - `ordinaux` : le CE1 précise « jusqu'à cent » (c2maths p. 11) ; à reporter dans le libellé ou les contraintes.
  - `solides` : au CE1, le texte fait **nommer** cube, boule, pavé, cône, pyramide, mais seulement **reconnaître**
    le cylindre (nommé au CE2, c2maths p. 33 et 35) ; `CONTRAINTES.ce1.solides` les met au même rang. Le QCM
    de nom de `genSolide` (cylindre compris) reste acceptable (reconnaissance), à noter.
  - `reperage-deplacements` : le libellé parle de « se repérer sur un quadrillage » ; au cycle 2 le texte ne
    parle que de déplacements codés et de plans (p. 33-35), jamais de coordonnées de case. `savoirs.js` (« B3 »)
    suit l'exercice, pas le texte.
  - `phrase` : `savoirs.js` CE1 dit « phrases qui affirment, qui questionnent, qui s'exclament » ; le CE1 nomme
    déclarative, interrogative, **impérative**, et traite l'exclamative comme une forme (p. 93).
  - `tables-multiplication` au CE1 : voir décision 1 ; `CONTRAINTES.ce1.facteurMax: 10` est juste, mais
    les vues restreignent à 2, 3, 4, 5, 10 sans que `programme.js` le dise.
