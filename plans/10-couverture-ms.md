# Plan 10 — Couvrir tout le programme de la MS

**But** : chaque compétence de `src/data/programme.ts` au niveau `ms` est travaillée sur le site par au moins un
exercice de l'app **et** une fiche ou une affiche, sans sortir des `CONTRAINTES` de la MS ; les exercices sont
utilisables par un enfant de 4 ans qui ne lit pas (consigne dite par `useTTS`, images, gros boutons, aucune
réponse à écrire au clavier).

**Couvre le point du TODO** « Couverture complète PS, MS, GS, CP, CE1 » (volet MS).

## Reste à couvrir en MS (relevé du 2026-10-07, `npm run couverture`)

13 compétences du programme de MS n'ont aucune ressource (exercice, fiche ou affiche) :

- `composer-decomposer` (nombres-calcul) : Composer et décomposer les petits nombres (« trois, c’est deux et un »)
- `problemes-maternelle` (nombres-calcul) : Résoudre de petits problèmes : réunir, ajouter, retirer, partager
- `comparer-masses-maternelle` (grandeurs-mesures) : Comparer la masse de deux objets (plus lourd, plus léger)
- `solides-maternelle` (espace-geometrie) : Reconnaître puis décrire cube, pavé, boule, pyramide, cylindre, cône
- `assemblages-maternelle` (espace-geometrie) : Reproduire un assemblage (puzzle, pavage, tour de cubes)
- `moments-journee` (temps-espace) : Les moments de la journée : matin, soir, jour, nuit ; avant, après, maintenant
- `chronologie-maternelle` (temps-espace) : Remettre dans l’ordre des moments vécus, puis les étapes d’une histoire
- `reperes-espace` (temps-espace) : Dans, sur, sous, devant, derrière, à côté : situer un objet
- `categories-mots` (oral) : Ranger des mots-images par catégorie, trouver l’intrus
- `syllabes-orales` (lecture) : Scander, compter et manipuler les syllabes d’un mot à l’oral
- `geste-ecriture-maternelle` (ecriture) : Tracer des formes de base (PS), les lettres capitales (MS), puis écrire en cursive (GS)
- `environnement-proche` (temps-espace) : Reconnaître l’école, le quartier ou le village et ses lieux (mairie, commerces, jardin)
- `nombres-jusqua-10-langue-regionale` (regionale-mots) : Compter et dire les nombres jusqu’à 10 dans la langue régionale (comptines : « Unan, daou, tri… » en breton)

Les sections ci-dessous ne gardent que les propositions qui répondent à ces manques ; les autres sont faites (historique : `git log -- plans/10-couverture-ms.md`). Les noms de fichiers cités (vues `.vue`, `activites.js`, `exercices.js`, `programme.ts`…) sont ceux de l'ancien monde, supprimé : le code d'un nouvel exercice est un module `src/exercices/<id>/` (`npm run nouveau`, voir `src/exercices/README.md`), le programme est `src/data/programme.ts`.

À ces manques s'ajoutent des compétences de la MS que ces propositions ne traitent pas : `moments-journee`, `chronologie-maternelle`, `reperes-espace`, `categories-mots`, `environnement-proche` (le plan PS, 3.2, les propose pour les trois niveaux) ; `solides-maternelle` et `nombres-jusqua-10-langue-regionale` n'ont pas encore de proposition.

## Propositions encore à réaliser

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

## Décisions à prendre (utilisateur)

1. **Slug `exercices-formes-ms-gs`** (publié, ne doit pas changer) : *recommandé* — le garder avec le contenu MS
   (3 formes, valable en MS comme en GS) et ajouter `exercices-formes-gs` (avec le rectangle). Autre choix : le
   garder tel quel et ajouter `exercices-formes-ms` (mais la page « MS · GS » resterait hors programme en MS).
2. **Solides et masses en MS** : le BO exclut la perspective en maternelle et la masse se compare en soupesant.
   *Recommandé* — ajouter à ces compétences un champ `support: 'manipulation'` dans `programme.ts` (avec la source
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
6. **Compléter `programme.ts`** (partie 4) avant de coder : *recommandé* — ajouter seulement `rang-maternelle`
   (sert à l'étape 2) ; garder le temps de la journée, l'espace et le vocabulaire pour un plan suivant après avis
   d'un enseignant (plan 07).

## 4. `programme.ts` pour la MS : manques et points douteux

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
- Correspondance âge → classe (« à partir de 4 ans » = MS) : déjà signalée comme interprétation dans `programme.ts`.
- La PS n'existe pas dans `NIVEAUX` (TODO) : plusieurs objectifs « avant 4 ans » (comptine jusqu'à 6, formes de
  base en graphisme) sont des prérequis de la MS que le site ne couvre pas.
