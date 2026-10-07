# Plan 10 — Couvrir tout le programme du CE1

**But** : chaque compétence de `src/data/programme.ts` travaillée au CE1 a au moins un exercice, une fiche ou une affiche, sans sortir des `CONTRAINTES` du CE1.

**Couvre le point du TODO** « Couverture complète PS, MS, GS, CP, CE1 » (volet CE1).

## Reste à couvrir en CE1 (relevé du 2026-10-07, `npm run couverture`)

8 compétences du programme de CE1 n'ont aucune ressource (exercice, fiche ou affiche) :

- `ordinaux` (nombres-calcul) : Les nombres ordinaux (premier, deuxième…) et le rang dans une file
- `parite-multiples` (nombres-calcul) : Nombres pairs et impairs, puis multiples
- `fractions-comparer` (nombres-calcul) : Comparer des fractions
- `fractions-additionner` (nombres-calcul) : Additionner et soustraire des fractions
- `sens-multiplication` (nombres-calcul) : Comprendre le sens de la multiplication (puis le signe ×)
- `tableaux-diagrammes` (donnees) : Lire et remplir un tableau, un diagramme en barres
- `comprendre-texte` (lecture) : Comprendre un texte lu (personnages, informations, ordre des événements)
- `date-langue-regionale` (regionale-mots) : Dire la date du jour dans la langue régionale (« Peseurt deiz eo hiziv ? » en breton)

Les sections ci-dessous ne gardent que les propositions qui répondent à ces manques ; les autres sont faites (historique : `git log -- plans/10-couverture-ce1.md`). Les noms de fichiers cités (vues `.vue`, `activites.js`, `exercices.js`, `programme.ts`…) sont ceux de l'ancien monde, supprimé : le code d'un nouvel exercice est un module `src/exercices/<id>/` (`npm run nouveau`, voir `src/exercices/README.md`), le programme est `src/data/programme.ts`.
## Propositions encore à réaliser

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

### P2. Les nombres : parité, ordinaux, suites évolutives (`NumerationView.vue`)

- `NIVEAUX` reçoit une liste `types` par niveau (aujourd'hui tous les types sont pour tous les niveaux), comme
  `FractionsView.vue` : `ordinaux` est CP-CE1 seulement (`programme.ts`), donc absent du CE2.
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

### P11. Copie (facultatif)

Fiches toutes prêtes « Copier un texte » CE1 (4-5 phrases, puis 5-6 lignes) dans `src/impression/catalogue.js`
(entrées `ECRITURE` existantes), textes de `TEXTES_DEFAUT_CE1`, compétence `copie`. Effort : 0,5 jour.

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

## 5. Ce qui manque ou paraît douteux dans `programme.ts` pour le CE1

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
    les vues restreignent à 2, 3, 4, 5, 10 sans que `programme.ts` le dise.
