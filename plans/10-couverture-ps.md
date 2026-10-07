# Plan 10 — Ajouter la PS (petite section) et couvrir son programme

**But** : la PS (enfants de 3 ans, « avant 4 ans » dans les textes) devient une classe du site, au même titre que
la MS et la GS. Elle a ses compétences dans `src/data/programme.js`, ses contraintes, son filtre « Classe », ses
exercices et ses fiches. Les exercices sont adaptés à des enfants qui ne lisent pas : consignes dites à voix
haute, images, très gros boutons, peu d'éléments à l'écran.

**Couvre le point du TODO** : « Couverture complète PS, MS, GS, CP, CE1 : un plan par niveau
(`plans/10-couverture-<niveau>.md`) ; la PS n'existe pas encore dans `programme.js` ni dans le site »
(`docs/TODO.md`, l. 31). Touche aussi « Synthèse vocale : pas de voix bretonne » (l. 75).

Relevé fait le 2026-10-04, sans modifier le code. Aucun test lancé.

**Avancement (2026-10-04)** : étapes 1 à 5 livrées et déployées. Décisions prises en cours de route :
- Formes : PS « la même forme » seulement ; MS « même forme » + « trouver » ; GS nommer, compter les côtés. Le
  rectangle n'apparaît qu'en GS. Slug `exercices-formes-ms-gs` gardé (niveau MS), `-ps` et `-gs` ajoutés.
- Motifs (`src/utils/motifs.js`, fonctions pures testées) : PS AB ; MS AB, ABB, AAB, ABC ; GS + AABB, ABCD,
  évolutif. Modes « Et après ? » et « Il en manque un ». Le mode « reproduire » du plan MS n'est pas fait.
- Longueurs (« Plus long, plus court ») : crayons alignés sur le même bord ; comparer (2 crayons) ou ranger
  (PS 3, MS 4, GS 5). La comparaison indirecte (bande témoin, GS) n'est pas faite.
- `ConsigneParlee` relit la consigne à chaque question (`:key="idx"`), en français seulement.

---

## 0. Sources lues

| Clé (`SOURCES`) | Document | Lu pour ce plan |
|---|---|---|
| `bo41` | BO n° 41 du 31/10/2024, PDF complet (136 p.) | p. 45 à 71 (cycle 1, langage et maths), en entier pour les blocs « À aborder avant 4 ans » |
| `bo19` | BO n° 19 du 7/05/2026, PDF complet (42 p.) | p. 9 à 11 (principes), p. 12 à 33 (blocs « avant 4 ans » de tous les domaines) |
| `c1consolide` | Programme consolidé Éduscol (63 p.) | seulement pour retrouver les mêmes passages (pages indiquées entre crochets : [c1 p. 38]) |

Les pages sont celles **du PDF**, comme dans `programme.js`. Lien direct : `${SOURCES.bo41.url}#page=N`.

Le BO n° 19 renvoie au BO n° 41 pour le langage et les maths (p. 11). Il ajoute « Se repérer dans le temps et
l'espace » (p. 23-29), « Découvrir le monde du vivant, de la matière et des objets » (p. 29-33), les activités
physiques (p. 11-15) et les activités artistiques (p. 16-22).

Deux phrases générales comptent pour tout le plan :

- **BO n° 19, p. 9** [c1 p. 4] : les professeurs « veillent à diversifier les formes des exercices proposés en
  limitant le recours aux fiches ». Le jeu, la manipulation et la verbalisation passent avant la fiche.
- **BO n° 41, p. 59** : « Il est attendu de l'enseignant qu'il utilise un vocabulaire précis et consacré, même si
  celui-ci n'est pas exigible des élèves. » Il dit « disque » et non « rond ». **p. 68** : « on veillera à ne pas
  faire nommer les objets géométriques de manière prématurée ».

Conséquence pour le site : en PS, la voix peut dire « disque » ou « triangle », mais on ne demande jamais à
l'enfant de choisir un nom écrit. Il faut aussi peu de fiches, et du **matériel à découper** pour manipuler.

---

## 1. Le programme de PS, domaine par domaine

Légende : **[texte]** = écrit dans le BO ; **[interprétation]** = notre lecture, à marquer `interpretation:`
dans `programme.js`.

### 1.1 Nombres et calcul (BO n° 41)

- **Dénombrer** — p. 60 [c1 p. 38] **[texte]** : « Dénombrer une collection d'objets (jusqu'à trois, voire
  quatre) » ; « Percevoir globalement une petite quantité d'objets » ; « Utiliser ses doigts ou le nom d'un
  nombre pour indiquer la quantité […] ou celle figurant sur une représentation analogique (constellation de
  points) ». Exemple : « pour des nombres allant de un à trois […] Mets dans chaque boite autant de jetons qu'il
  y a de points ou de doigts ».
- **Constituer une collection** — p. 60-61 **[texte]** : « Constituer une collection (jusqu'à trois, voire quatre
  objets) d'un cardinal donné » ; « Donne-moi trois voitures ».
- **Un de plus** — p. 60 **[texte]** : « Réaliser une collection contenant un objet de plus qu'une collection
  donnée (passer de un à deux, puis de deux à trois, voire de trois à quatre) ».
- **Comparer** — p. 61 **[texte]** : « Comparer globalement (sans dénombrer) des cardinaux de deux collections
  dont les quantités d'objets diffèrent d'un facteur au moins égal à deux et utiliser les locutions « plus que »
  et « moins que ». Ne pas se limiter aux petites collections. » Exemple : 6 crayons contre 2. Puis « Comparer
  par correspondance terme à terme ». Voir aussi p. 59 : « dès trois ans, comparer par correspondance terme à
  terme des cardinaux de collections contenant plus d'objets que les nombres dont ils maitrisent déjà le sens ».
- **Composer, décomposer** — p. 61 **[texte]** : « Composer et décomposer des nombres (deux, trois, voire
  quatre) » ; « un et un font deux ; deux et un font trois » ; « avec les doigts des deux mains ».
- **Écriture chiffrée** — p. 61 **[texte]** : « Associer une quantité, le nom d'un nombre et une écriture
  chiffrée » ; « Nommer le nombre (inférieur ou égal à trois, voire quatre) correspondant à une quantité » ;
  « Représenter par une écriture chiffrée une quantité […] et vice versa ». Mais p. 60 : « ne pas aborder
  l'écriture chiffrée des nombres avant d'en avoir installé le sens en termes de quantité ». **[interprétation]**
  En PS, on peut montrer le chiffre (1 à 3) pour l'associer à une quantité, mais on ne le fait pas tracer. Le
  tracé n'est pas dans « geste d'écriture » avant 4 ans (p. 55-56).
- **Comptine** — p. 61 **[texte]** : « Connaitre la comptine numérique de un à six » ; « Réciter de façon ordonnée
  et segmentée la comptine jusqu'à six, en partant de un ».
- **Zéro** — p. 60 **[texte]** : « ne pas introduire prématurément le nombre zéro ». Et : « s'assurer d'une bonne
  compréhension des nombres deux, puis trois, avant d'aborder des collections de quatre objets ».
- **Rang, position, bande numérique** — p. 58 (sommaire) **[texte]** : « Exprimer un rang ou une position par un
  nombre » n'a **pas** de bloc « avant 4 ans ». Donc `bande-numerique` ne va pas en PS.
- **Problèmes** — p. 66 [c1 p. 45] **[texte]** : « Recherche du tout ou d'une partie dans un problème de
  parties-tout » ; « réalisant l'action décrite par l'énoncé avec du matériel figuratif » ; « Percevoir
  visuellement la solution quand les quantités mises en jeu sont petites ». Exemples : une valise contient deux
  peluches, on en ajoute une et on ferme la valise ; une boîte de quatre crayons, on en retire deux. Et p. 66 :
  « élèves de moins de quatre ans, l'enseignant commence par utiliser lui-même du matériel figuratif ».

### 1.2 Espace et géométrie (BO n° 41)

- p. 68 [c1 p. 47] **[texte]** : « Reconnaitre, trier et classer des objets selon leur forme » ; « Percevoir
  l'invariance de la forme d'un objet par rapport aux déplacements qu'il peut subir » ; « Reconnaitre
  visuellement et tactilement des objets de même forme qu'un objet donné » ; « Classer selon leur forme des
  objets qui diffèrent aussi par d'autres critères » ; « Encastrer des objets ».
- p. 69 **[texte]** : « À partir d'un modèle, reproduire un assemblage à l'échelle d'au plus quatre éléments
  (puzzle, pavage, assemblage de solides) ».
- **Aucune liste de formes** avant 4 ans. La liste triangle, carré, disque arrive « à partir de 4 ans » (p. 69).
  **[interprétation]** En PS, on manipule disque, carré et triangle comme des formes à apparier ou à trier, sans
  les faire nommer, avec des tailles, des couleurs et des orientations variées (p. 68, « Points de vigilance »).
  Les solides sont hors du site (la perspective n'est « pas abordée », p. 68).

### 1.3 Grandeurs et mesures (BO n° 41)

- Longueur, p. 69-70 [c1 p. 49] **[texte]** : « Reconnaitre un objet de même longueur qu'un objet donné » ;
  « Comparer des objets selon leur longueur » ; « Percevoir visuellement qu'un objet est plus long qu'un autre
  lorsque leurs longueurs sont très différentes ». Exemple : « superposer trois briques par ordre décroissant
  de longueur afin de construire un escalier ».
- Masse, p. 69 **[texte]** : « la masse n'est introduite qu'à partir de quatre ans ». Donc pas de masse en PS.

### 1.4 Motifs organisés (BO n° 41)

- p. 71 [c1 p. 50] **[texte]** : « Mémoriser un motif répétitif très simple » ; « Reproduire un motif répétitif
  à l'identique » ; « Compléter un motif ». Exemple : « ★⚫★⚫★⚫★ » ; « reproduire une partie du motif qui est
  cachée, d'anticiper les éléments cachés puis de vérifier en retirant le cache ». **[interprétation]** En PS,
  une alternance de deux éléments (AB AB). Les motifs évolutifs viennent seulement à partir de cinq ans (déjà
  dans `motifs-maternelle`).

### 1.5 Se repérer dans le temps et l'espace (BO n° 19)

- **Repères dans la journée** — p. 24 [c1 p. 53] **[texte]** : « Identifier les principaux moments d'une
  journée » ; « Différencier le matin et le soir, le jour et la nuit » ; « Comprendre et utiliser le vocabulaire
  associé : encore, avant, après, maintenant, tout à l'heure, tout de suite » ; « Aborder la notion de saison à
  partir de quelques faits observables ». Même page : « organisation de la journée avant quatre ans, de la
  semaine à partir de quatre ans et de l'année à partir de cinq ans ». À 4 ans : « Énoncer le moment de la
  journée où l'on se situe ».
- **Chronologie** — p. 25 **[texte]** : « Ordonner entre eux des moments rituels vécus » ; « Comprendre et
  restituer le déroulement d'évènements quotidiens au sein d'une histoire simple » ; « Nommer l'activité qui
  précède et identifier celle qui va suivre ». À 4 ans : chronologie d'une histoire simple (« au début, ensuite
  et pour finir »). À 5 ans : ordonner les étapes d'un processus.
- **Durée** — p. 26 **[texte]** : début et fin d'une activité ; « attendre, longtemps, déjà ». C'est un vécu de
  classe, à ne pas transformer en exercice.
- **Espace** — p. 26-27 **[texte]** : « Choisir et orienter une pièce pour l'insérer dans un puzzle à
  encastrement » ; « reproduire un modèle déjà construit avec trois ou quatre pièces » ; vocabulaire « ici,
  là-bas, grand, petit, au-dessus, en dessous, dans, dedans, dehors, à côté, au loin, tout près, devant,
  derrière, autour ». À 4 ans : « Situer des objets entre eux » (p. 27).
- **Représenter l'espace** — p. 28 **[texte]** : « ranger dans l'ordre chronologique trois ou quatre
  photographies des lieux » d'un parcours.

### 1.6 Langage oral (BO n° 41)

- **Vocabulaire** — p. 47 [c1 p. 8] **[texte]** : deux corpus de mots par période ; réseaux lexicaux de la vie
  familiale et de la classe ; « Trouver un objet présent nommé par le professeur » ; « Reconnaitre et nommer un
  objet présenté sous différentes formes » ; « Organiser les mots en catégorie et en réseau » : « Retrouver un
  intrus », « Attribuer un objet à une catégorie », « Ranger des jeux familiers par catégorie ». À 4 ans :
  « Trouver un intrus dans une catégorie ». À 5 ans : hyperonymes (véhicule, animal).
- **Syntaxe** — p. 48 : pronoms il/elle puis je ; présent, puis passé composé et futur proche ; « et puis ».
  C'est un objectif d'oral en classe, pas d'exercice.
- **Articuler** — p. 49 **[texte]** : « Articuler distinctement les couples de consonnes proches suivants : t/k,
  f/s, m/n » ; « À partir d'un imagier composé de paires distinctives, prononcer correctement : cour/tour,
  cube/tube, cassé/café, pouce/pouf, nain/main ». **[interprétation]** Un imagier de paires est possible (écouter
  et montrer la bonne image), mais pas en premier.
- **Discours** — p. 50 : comptine dite collectivement ; hors exercice.

### 1.7 Lecture : se préparer à lire (BO n° 41)

- **Sons** — p. 51 **[texte]** : « Discriminer et identifier des sons familiers, localiser le son (la source) » ;
  « Identifier un mot donné à l'oral dans une phrase ».
- **Syllabes** — p. 51 [c1 p. 13-14] **[texte]** : « Scander les syllabes d'un mot » ; « Frapper les syllabes d'un
  mot dans ses mains » ; « Prononcer son prénom, puis une comptine en scandant les syllabes ».
- **Lettres** — p. 51 [c1 p. 14] **[texte]** : « Reconnaitre et nommer certaines lettres de son prénom écrit en
  capitales » ; « Retrouver l'étiquette de son prénom (lettres capitales) parmi d'autres en prenant des indices
  sur les lettres ».
- **Diversité linguistique** — p. 53 **[texte]** : « Écouter des chants, des comptines, des histoires connues
  dans des versions en français et en langue étrangère ». C'est un argument pour le site breton.
- **Écrits** — p. 54 : supports de l'écrit, personnages des albums ; hors exercice.

### 1.8 Écriture : se préparer à écrire (BO n° 41 et n° 19)

- p. 55-56 [c1 p. 18] **[texte]** : « Guider son geste par le regard lorsqu'il trace » ; « Produire librement des
  tracés continus ou discontinus » ; « Tracer quelques formes de base : traits verticaux, traits horizontaux,
  points, boucles et cercles ».
- p. 56-57 **[texte]** : « comprendre que le dessin se distingue de l'écriture » ; « Tracer volontairement des
  signes abstraits ».
- BO n° 19, p. 17 (graphisme artistique) **[texte]** : « Tracer à deux des lignes verticales sur un support tel
  qu'une piste graphique » ; « Reproduire des motifs graphiques simples (cercles, boucles, lignes, croix, etc.) ».
  p. 16 : dessin « sur des papiers de grand format sur un plan vertical, en commençant par des gestes amples ».
  **[interprétation]** Les fiches de graphisme PS sont en grand (A4 paysage, un seul tracé par ligne, gros
  pointillés) et viennent en complément des pistes graphiques de la classe.

### 1.9 Hors des domaines actuels de `programme.js` (pour mémoire)

- Vivant, BO n° 19 p. 30 **[texte]** : « Associer des photographies représentant le petit et l'adulte d'une même
  espèce animale » ; « le chevreau, la chèvre et le bouc, le chiot, la chienne et le chien ». Parties du corps
  et des animaux (p. 30-31).
- Arts, p. 19-20 **[texte]** : « identifier un objet ou un animal représenté de différentes manières » ; « Jouer
  avec sa voix pour reproduire des bruits d'animaux […] à partir d'images » ; « Dire ou chanter au moins cinq
  comptines ».
- Matière, p. 32 : trier selon des propriétés perçues par les sens. Ce n'est pas faisable à l'écran.
- **Couleurs** : nommer les couleurs n'est un objectif dans **aucun** bloc « avant 4 ans » relu. Les couleurs
  n'apparaissent que comme « lexique approprié » en arts (p. 17) et comme critère à neutraliser en géométrie.
  **[interprétation]** Une fiche « colorie selon le modèle » (pastille de couleur, sans mot) est acceptable. Un
  exercice « nomme la couleur » irait dans `HORS_PROGRAMME`.

### 1.10 À recopier dans `programme.js`

**a) En-tête et conventions** : ajouter « avant 4 ans » = PS dans la convention du cycle 1 (en-tête, l. 28-30),
avec la même réserve d'interprétation. Ajouter aussi la date de relecture et les pages lues ci-dessus.

**b) Constantes**

```js
export const NIVEAUX = ['ps', 'ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2']
export const CYCLE_DE = { ps: 1, ms: 1, gs: 1, cp: 2, ce1: 2, ce2: 2, cm1: 3, cm2: 3 }
```

**c) Domaine `temps-espace`** : passer `court` de « Se repérer dans le temps » à « Se repérer dans le temps et
l'espace » (`id` inchangé), puisque des compétences d'espace arrivent. Il faut aussi changer
`src/i18n/fr/domaines.js` et `src/i18n/br/domaines.js` (breton : à relire). Domaine `oral` : il n'a aujourd'hui
**aucune** compétence. `categories-mots` sera la première.

**d) Compétences existantes : ajouter `'ps'`** (le `niveaux` commence par l'année d'introduction)

```js
c('comparer-quantites', 'nombres-calcul', 'Comparer deux quantités (plus, moins, autant)', ['ps', 'ms', 'gs'],
  src('bo41', 61, 'Avant 4 ans : comparer globalement (sans dénombrer) deux collections dont les quantités diffèrent d’un facteur au moins égal à deux, « plus que », « moins que » ; correspondance terme à terme ; repris à 4 et 5 ans (p. 62-63)')),
c('composer-decomposer', 'nombres-calcul', 'Composer et décomposer les petits nombres (« trois, c’est deux et un »)', ['ps', 'ms', 'gs'],
  src('bo41', 61, 'Avant 4 ans : deux, trois, voire quatre (« un et un font deux ») ; ≤ 6 à 4 ans (p. 62), ≤ 10 à 5 ans (p. 63)')),
c('problemes-maternelle', 'nombres-calcul', 'Résoudre de petits problèmes : réunir, ajouter, retirer, partager', ['ps', 'ms', 'gs'],
  src('bo41', 66, 'Avant 4 ans : parties-tout avec du matériel figuratif (la valise : deux peluches et encore une) ; puis ajout, retrait, groupement, partage (p. 66-67)')),
c('comparer-longueurs-maternelle', 'grandeurs-mesures', 'Comparer et ranger des objets selon leur longueur', ['ps', 'ms', 'gs'],
  src('bo41', 69, 'Avant 4 ans : même longueur, plus long quand les longueurs sont très différentes, escalier de trois briques (p. 69-70) ; 4 ans : comparer directement, ordonner ; 5 ans : bande témoin, cinq objets (p. 70)')),
c('formes-maternelle', 'espace-geometrie', 'Trier les objets selon leur forme (PS), reconnaître (MS) puis nommer (GS) carré, rectangle, triangle et disque', ['ps', 'ms', 'gs'],
  src('bo41', 68, 'Avant 4 ans : reconnaitre, trier et classer des objets selon leur forme, invariance par déplacement, encastrer ; 4 ans (p. 69) : reconnaitre et classer triangle, carré, disque ; 5 ans : décrire et nommer carré, rectangle, triangle, disque'),
  { interpretation: 'PS : aucune liste de formes dans le texte ; nous utilisons disque, carré, triangle (liste de 4 ans) sans les faire nommer (p. 68 : « ne pas faire nommer […] de manière prématurée »)' }),
c('assemblages-maternelle', 'espace-geometrie', 'Reproduire un assemblage (puzzle, pavage, tour de cubes)', ['ps', 'ms', 'gs'],
  src('bo41', 69, 'Au plus quatre éléments avant 4 ans, cinq à 4 ans, huit formes planes à 5 ans')),
c('motifs-maternelle', 'motifs', 'Reproduire et continuer un motif (rouge, bleu, rouge, bleu…)', ['ps', 'ms', 'gs'],
  src('bo41', 71, 'Avant 4 ans : mémoriser, reproduire, compléter un motif répétitif très simple (★⚫★⚫) ; motifs évolutifs seulement à partir de cinq ans (p. 70)')),
c('syllabes-orales', 'lecture', 'Scander, compter et manipuler les syllabes d’un mot à l’oral', ['ps', 'ms', 'gs'],
  src('bo41', 51, 'Avant 4 ans : scander les syllabes, frapper les syllabes d’un mot, son prénom ; 4 ans (p. 52) : manipuler ; 5 ans : rimes, phonèmes')),
c('nom-lettres', 'lecture', 'Connaître le nom des lettres et associer capitale, script et cursive', ['ps', 'ms', 'gs', 'cp'],
  src('bo41', 51, 'Avant 4 ans : reconnaitre et nommer certaines lettres de son prénom en capitales, retrouver l’étiquette de son prénom ; 4 ans (p. 52) : lettres du prénom, correspondances ; 5 ans : toutes les lettres')),
c('geste-ecriture-maternelle', 'ecriture', 'Tracer des formes de base (PS), les lettres capitales (MS), puis écrire en cursive (GS)', ['ps', 'ms', 'gs'],
  src('bo41', 56, 'Avant 4 ans (p. 55-56) : traits verticaux, horizontaux, points, boucles, cercles ; 4 ans : capitales, initiation à la cursive ; 5 ans : cursive')),
```

Attention : les libellés modifiés (`formes-maternelle`, `geste-ecriture-maternelle`) s'affichent dans
`/programme` et dans le rapport. Aucun slug n'en dépend.

**e) Nouvelles compétences**

```js
// Nombres et calcul — cycle 1
c('denombrer-3', 'nombres-calcul', 'Compter une petite collection jusqu’à 3 (voire 4), la montrer avec ses doigts, réciter la comptine jusqu’à 6', ['ps'],
  src('bo41', 60, 'Avant 4 ans : dénombrer et constituer une collection jusqu’à trois, voire quatre ; doigts, constellations ; un de plus ; nommer le nombre ≤ 3 voire 4 ; comptine de un à six (p. 61)')),
// Se repérer dans le temps et l'espace — cycle 1 (BO n° 19)
c('moments-journee', 'temps-espace', 'Les moments de la journée : matin, soir, jour, nuit ; avant, après, maintenant', ['ps', 'ms'],
  src('bo19', 24, 'Avant 4 ans : principaux moments d’une journée, matin et soir, jour et nuit, encore, avant, après, maintenant ; 4 ans : énoncer le moment de la journée où l’on se situe')),
c('chronologie-maternelle', 'temps-espace', 'Remettre dans l’ordre des moments vécus, puis les étapes d’une histoire', ['ps', 'ms', 'gs'],
  src('bo19', 25, 'Avant 4 ans : ordonner des moments rituels vécus ; 4 ans : chronologie d’une histoire simple (au début, ensuite, pour finir) ; 5 ans : étapes d’un processus, d’abord, ensuite, enfin')),
c('reperes-espace', 'temps-espace', 'Dans, sur, sous, devant, derrière, à côté : situer un objet', ['ps', 'ms', 'gs'],
  src('bo19', 27, 'Avant 4 ans (p. 26-27) : au-dessus, en dessous, dans, dehors, à côté, devant, derrière ; 4 ans : situer des objets entre eux ; 5 ans (p. 28) : à relire avant de recopier')),
// Oral — cycle 1 (première compétence de ce domaine)
c('categories-mots', 'oral', 'Ranger des mots-images par catégorie, trouver l’intrus', ['ps', 'ms', 'gs'],
  src('bo41', 47, 'Avant 4 ans : retrouver un intrus, attribuer un objet à une catégorie ; 4 ans : intrus dans une catégorie ; 5 ans : hyperonymes (véhicule, animal)')),
```

Pour plus tard (pas dans la première vague, faute de contenu audio) : `sons-familiers` (lecture, `['ps']`, bo41
p. 51) et `paires-sons` (oral, `['ps']`, bo41 p. 49).

À ne **pas** étendre à la PS : `denombrer-6`, `bande-numerique` (pas de rang avant 4 ans, p. 58),
`comparer-masses-maternelle` (p. 69), `solides-maternelle` (aucun solide nommé, et pas de perspective), `jours-mois`
(la semaine arrive à 4 ans, p. 24), `son-lettres`.

**f) Contraintes PS** (en tête de `CONTRAINTES`)

```js
{
  niveau: 'ps', nombreMax: 3, comptineMax: 6, ecritureChiffresMax: 3,
  comparaisonGlobale: { rapportMin: 2, max: 10 },
  figures: [], formesTriees: ['disque', 'carre', 'triangle'], solides: [],
  assemblageMax: 4, motifs: 'alternance', masse: false, zero: false,
  lettres: 'prenom-capitales', cursive: null,
  graphisme: ['vertical', 'horizontal', 'point', 'boucle', 'cercle'],
  temps: 'journee',
  sources: {
    nombreMax: src('bo41', 60, 'Avant 4 ans : dénombrer, constituer une collection jusqu’à trois, voire quatre ; deux puis trois avant quatre'),
    comptineMax: src('bo41', 61, 'Réciter la comptine jusqu’à six, en partant de un'),
    ecritureChiffresMax: src('bo41', 61, 'Associer une quantité, le nom d’un nombre et une écriture chiffrée (≤ 3, voire 4) ; p. 60 : pas d’écriture chiffrée avant le sens'),
    comparaisonGlobale: src('bo41', 61, 'Comparer globalement des collections qui diffèrent d’un facteur au moins égal à deux ; ne pas se limiter aux petites collections'),
    figures: src('bo41', 68, 'Reconnaitre, trier et classer des objets selon leur forme ; ne pas faire nommer prématurément'),
    assemblageMax: src('bo41', 69, 'Reproduire un assemblage d’au plus quatre éléments'),
    motifs: src('bo41', 71, 'Motif répétitif très simple : ★⚫★⚫'),
    masse: src('bo41', 69, 'la masse n’est introduite qu’à partir de quatre ans'),
    zero: src('bo41', 60, 'ne pas introduire prématurément le nombre zéro'),
    lettres: src('bo41', 51, 'Certaines lettres de son prénom écrit en capitales'),
    graphisme: src('bo41', 56, 'Traits verticaux, traits horizontaux, points, boucles et cercles'),
    temps: src('bo19', 24, 'Organisation de la journée avant quatre ans, de la semaine à partir de quatre ans'),
  },
  interpretation: 'nombreMax 3 : « voire quatre » n’est pas systématique (même lecture que « voire au-delà » en GS) ; ecritureChiffresMax 3 = chiffre montré pour être associé à une quantité, jamais à tracer ; comparaisonGlobale.max 10 : le texte dit seulement « ne pas se limiter aux petites collections » ; formesTriees : liste de 4 ans utilisée sans la faire nommer',
},
```

Les nouvelles clés (`comparaisonGlobale`, `formesTriees`, `assemblageMax`, `motifs`, `masse`, `zero`, `graphisme`,
`temps`) sont à documenter dans le commentaire « Clés » (l. 474-502). Aucune vue ne lit `lettres` ni `cursive` :
`null` ne casse rien.

**g) Phrases « Ce que je sais faire »** (`src/data/savoirs.js`, obligatoires : `tests/logique.test.mjs` exige une
phrase par compétence et par niveau)

| Compétence | `ps` (et `ms` si nouvelle) |
|---|---|
| `denombrer-3` | ps : « Je compte jusqu’à 3 et je montre le nombre avec mes doigts. » |
| `comparer-quantites` | ps : « Je montre où il y en a beaucoup plus. » |
| `composer-decomposer` | ps : « Je sais que deux et encore un, ça fait trois. » |
| `problemes-maternelle` | ps : « Je trouve combien il y en a quand on en ajoute un. » |
| `comparer-longueurs-maternelle` | ps : « Je montre le plus long et le plus court. » |
| `formes-maternelle` | ps : « Je trouve les objets qui ont la même forme. » |
| `assemblages-maternelle` | ps : « Je refais un puzzle de 4 pièces. » |
| `motifs-maternelle` | ps : « Je continue un motif : un rond, une étoile, un rond… » |
| `moments-journee` | ps : « Je sais si c’est le jour ou la nuit, le matin ou le soir. » ; ms : « Je dis à quel moment de la journée on est. » |
| `chronologie-maternelle` | ps : « Je remets dans l’ordre ce qu’on fait dans la journée. » ; ms : « Je raconte une histoire dans l’ordre. » ; gs : « Je range les étapes d’une recette ou d’une histoire. » |
| `reperes-espace` | ps : « Je dis si c’est dans, sur, sous, devant ou derrière. » ; ms : « Je dis où est un objet par rapport à un autre. » ; gs : « Je décris où sont les objets avec les bons mots. » |
| `categories-mots` | ps : « Je range les images : les animaux, les fruits… » ; ms : « Je trouve l’intrus. » ; gs : « Je trouve le mot qui les regroupe : animal, véhicule. » |
| `syllabes-orales` | ps : « Je frappe les syllabes de mon prénom. » |
| `nom-lettres` | ps : « Je reconnais mon prénom écrit en capitales. » |
| `geste-ecriture-maternelle` | ps : « Je trace des traits, des points, des ronds et des boucles. » |

Les affiches « Ce que je sais faire » restent cachées (`RESUMES_VISIBLES = false`). Quand elles seront
visibles, les couples PS × domaine qui ont au moins deux phrases apparaîtront tout seuls (`RESUMES` parcourt
`NIVEAUX`).

---

## 2. Ajouter la PS au site : tous les endroits

### 2.1 Les listes de classes (quatre copies aujourd'hui)

| Fichier | Aujourd'hui | À faire |
|---|---|---|
| `src/data/programme.js` l. 36-37 | `NIVEAUX`, `CYCLE_DE` | voir 1.10 b. Sans `ps: 1`, `nomOfficiel()` et `lienProgramme()` renvoient `null` (le lien « Programme officiel » des pages statiques disparaît) et `tests/logique.test.mjs` l. 69 rejette l'activité (« hors cycle ») |
| `src/data/activites.js` l. 4-12 | `CLASSES` | ajouter `{ id: 'ps', label: 'PS' }` **en premier**. `AppNav.vue` (sélecteur du haut), `ImprimerView.vue`, `ProgrammeView.vue` et `HomeView.vue` le parcourent : rien d'autre à changer chez eux |
| `src/impression/exercices.js` l. 184 | `ORDRE` | ajouter `'ps'` ; mieux, `import { NIVEAUX } from '../data/programme.js'` (les deux fichiers sont des données pures, lus par node) |
| `scripts/telechargements.mjs` l. 54 | `CLASSES` | ajouter `'ps'` ou importer `NIVEAUX` (le script importe déjà `programme.js`). Le sélecteur `#classe-nav` (l. 318) et le filtre « Classe » de l'index (l. 749-759, seulement les classes présentes) suivent |

Ordre : `ps` **avant** `ms` partout. `depuis()` et `entre()` (programme.js), `de()` (activites.js) et
`classesDe()` (exercices.js) découpent par position. Insérer en tête ne change aucun intervalle existant.

### 2.2 Pièges

- **`de('ms', …)` dans activites.js** : `de('ms', 'ce1')` (affiche de l'alphabet) ne prend pas la PS, et c'est
  voulu. On ne remplace pas `'ms'` par `'ps'` en bloc. On ajoute la PS activité par activité, quand la vue a un
  vrai niveau PS. Même chose pour les tableaux écrits à la main (`['ms', 'gs']` de Compter, Comparer, Ordonner,
  Formes).
- **Slugs publiés** : `exercices-${ex.id}-${c.classe}` (telechargements.mjs l. 489-505). Formes publie
  `exercices-formes-ms-gs` (`C('ms-gs', null)`). Il ne faut **pas** le renommer en `ps-gs`. On ajoute
  `C('ps', '\\bPS\\b')` à côté, ce qui donne les nouveaux slugs `exercices-formes-ps` et
  `exercices-formes-ps-brezhoneg`. Compter et Comparer gagnent de même `exercices-compter-ps` et
  `exercices-comparer-ps`. Aucun slug existant ne change.
- **`classesDepuisTexte`** (telechargements.mjs l. 108) ne lit pas les flèches : « PS → GS » donnerait `ps, gs`
  sans `ms`. `classesDuTexte` (couverture.js l. 12) les lit. Dans `catalogue.js`, il faut écrire les niveaux PS
  avec « · » (« PS · MS »), comme partout aujourd'hui.
- **« en » / « au »** : `enClasse` (`src/impression/affiches/resume.js` l. 10) et la copie dans
  `affiches/catalogue.js` l. 140 testent `['ms', 'gs']`. Il faut ajouter `'ps'` (« en PS »), et de préférence
  importer `enClasse` dans catalogue.js plutôt que garder deux copies.
- **Boucle infinie dans CompterView** : `generer()` (l. 124-136) tire 3 distracteurs distincts dans
  `[max(1, nb-3), min(max, nb+3)]`. Avec `max = 3`, il n'en existe que 2, et `while (mauvais.size < 3)` ne se
  termine jamais. Il faut changer la génération avant d'ajouter un bouton PS (voir 3.1).
- **Comparer en PS dépasse `nombreMax`** : la comparaison globale doit aller au-delà de 3 (6 contre 2). Le test
  `champ('nombreMax')` de `tests/programme-maths.test.mjs` échouerait. Pour la PS, il faut vérifier
  `comparaisonGlobale.max` et le rapport ≥ 2.
- **Bouton de niveau dans les tests** : `programme-maths.test.mjs` clique `hasText: new RegExp('MS')`. Le
  libellé PS doit contenir « PS » en mot entier, et exercices.js doit utiliser `'\\bPS\\b'`.
- **Synthèse vocale en breton** : `useTTS.js` force `u.lang = 'fr-FR'`. Lire un texte breton avec une voix
  française serait faux. En interface bretonne, il faut couper la lecture automatique (voir 3.4).
- **Les vues de maternelle ne lisent pas `useClasse()`** : le niveau choisi en haut ne présélectionne pas le
  bouton MS ou GS. Pour la PS, c'est utile : choisir PS en haut, puis ouvrir Compter, devrait arriver sur PS. À
  faire dans les vues qui ont un niveau PS, avec `chargerReglages` et un défaut qui vient de `useClasse()`.
- **Pages qui se vident** : avec PS choisi, `HomeView` cache les matières sans activité (l. 37). Les pages
  Français et Lecture n'ont aucune carte PS tant que Lettres n'a pas de niveau PS. Il faut vérifier
  `GrilleActivites.vue` (l. 42) et ajouter un message « Rien pour la PS ici pour l'instant » si besoin.
  `HomeView.vue`, `MathsView.vue` et `FrancaisView.vue` sont **en cours de modification par un autre agent**
  (git status) : ne pas y toucher en même temps.

### 2.3 Autres fichiers

- `src/impression/exercices.js` l. 161-170 : `C('ps', '\\bPS\\b')` pour compter et comparer, et pour formes
  quand la vue aura des boutons de niveau. Les nouvelles vues (3.2) auront leurs entrées.
- `src/data/activites.js` : `niveaux` des activités qui gagnent la PS ; `COMPETENCES_ROUTES` (l. 134-159) :
  `'/maternelle/compter': ['denombrer-3', 'denombrer-6', 'denombrer-10']`, plus les nouvelles routes. Il faut
  aussi les traductions `BR` des nouvelles activités (`// br: à relire`).
- `src/views/AboutView.vue` l. 75, 81 et 131 : « (MS, GS) », « MS/GS → CP » et « Cycle 1 — Maternelle (MS /
  GS) » deviennent PS, MS, GS. Dans `src/views/maternelle/MaternelleView.vue` l. 3, 9, 15, 21 et 33, les
  étiquettes « MS / GS » sont écrites à la main : les remplacer par `etiquetteNiveaux(a.niveaux)`.
- `src/impression/couverture.js`, `scripts/couverture.mjs`, `ProgrammeView.vue` : ils lisent `NIVEAUX`, donc la
  colonne PS apparaît toute seule. Elle sera rouge au début, et le pourcentage « avec un exercice » baissera.
  C'est attendu.
- `src/impression/affiches/catalogue.js` : `RESUMES` suit tout seul (voir 1.10 g).
- `src/i18n/{fr,br}/views/maternelle/*.js` : libellés des boutons PS (la clé `jusqua: '{niv} — jusqu'à {n}'`
  existe déjà) et nouvelles consignes.
- Tests :
  - `tests/programme-maths.test.mjs` `CAS` : ajouter `['/maternelle/compter', '\\bPS\\b', 'ps', [champ('nombreMax', corrige)]]`
    et une vérification propre à Comparer PS (rapport ≥ 2, maximum ≤ `comparaisonGlobale.max`).
    Formes PS : `sans(/rectangle|losange|cercle|ovale/i)` et pas de nom de forme à choisir.
  - `tests/outils.mjs` l. 50 et 59 : ajouter les nouvelles routes.
  - `tests/logique.test.mjs` : rien à changer. Il vérifiera tout seul le cycle, une compétence du domaine à
    chaque niveau, les phrases de savoirs.js et la compétence de chaque fiche par classe.
  - `tests/memorises.test.mjs` : il couvre tout seul les nouveaux réglages s'ils passent par `chargerReglages`.
- Rien à changer dans `useClasse.js` : il garde l'identifiant (`ep_classe`) et les anciennes valeurs restent
  valables.

**Effort de l'étape « PS dans le site »** : environ une demi-journée (listes, `CYCLE_DE`, en/au, AboutView,
MaternelleView, tests). Avec programme.js et savoirs.js : environ 1 jour.

---

## 3. Couvrir la PS

### 3.0 Règles d'interface pour la PS (toutes les vues PS)

- **Consigne dite** à chaque nouvelle question (`useTTS().lire`), avec un gros bouton 🔊 pour la réécouter. Le
  texte reste affiché pour l'adulte, en petit.
- **2 à 4 choix au plus**, boutons d'au moins 96 px, images (emoji ou SVG) plutôt que du texte. Pas de chiffre
  comme seule réponse : constellations ou doigts d'abord, chiffre en option.
- **5 questions** par défaut. Pas de « Question 3 / 10 » écrit, juste des points de progression. Retour visuel et
  sonore immédiat, sans compte de fautes 💔 ni chronomètre.
- Une classe CSS commune (par exemple `.mode-ps` sur `.container`, dans `src/style.css`) plutôt que du CSS par
  vue.
- Un composant `ConsigneParlee.vue` (texte, bouton 🔊, lecture automatique désactivable, rien en breton tant
  qu'il n'y a pas de voix) : environ 0,5 jour, partagé par toutes les vues PS.

### 3.1 Exercices existants

| Exercice | PS ? | Comment |
|---|---|---|
| **Compter** `/maternelle/compter` | oui | Bouton « PS — jusqu'à 3 ». La génération change : choix = toutes les valeurs de 1 à 3 (3 boutons), sans distracteurs tirés (corrige la boucle infinie). Réponses en constellations de points ou en doigts, chiffre en option (`ecritureChiffresMax` 3). Objets disposés de façons variées, tailles mélangées (p. 60, points de vigilance). Consigne parlée « Combien de chats ? ». Fiche PS : seulement « entourer » (pas « écrire le nombre »), 6 cases en grand. Compétence `denombrer-3`. |
| **Comparer** `/maternelle/comparer` | oui | Mode PS « Où y en a-t-il le plus ? » : deux groupes avec un rapport ≥ 2 (2 contre 5, 3 contre 8…), jusqu'à 10 objets, sans égalité, on touche le groupe. Variante « le moins ». La fiche existe déjà (« entoure le groupe qui a le plus ») : il suffit de lui passer les contraintes PS. Compétence `comparer-quantites`. |
| **Ranger** `/maternelle/ordonner` | non | Il travaille rang et position, qui n'ont pas de bloc avant 4 ans (p. 58), avec des chiffres et des signes < >. Il reste MS et GS. |
| **Formes** `/maternelle/formes` | oui | La vue n'a **pas** de bouton de niveau aujourd'hui (une seule fiche `ms-gs`, le rectangle compris). Il faut ajouter PS / MS / GS : MS sans rectangle (`figures` MS), GS avec. Nouveau mode PS « Trouve la même forme » : un modèle et 3 formes de tailles, de couleurs et d'orientations différentes ; on touche celle qui a la même forme (p. 68). Les modes « reconnaître » (choisir un nom) et « compter les côtés » ne vont pas en PS. Fiche PS : « Colorie toutes les formes comme celle-ci » (un seul modèle, sans légende à lire). Garder `C('ms-gs', null)` pour le slug publié et ajouter `C('ps', '\\bPS\\b')`. |
| **Lettres** `/maternelle/lettres` | oui, à part | Les niveaux sont `['gs', 'cp']` alors que `nom-lettres` commence en MS : c'est un écart à noter pour le plan MS. Nouveau mode PS « Mon prénom » : l'adulte tape le prénom (gardé dans le navigateur seulement, `chargerReglages`) ; l'enfant retrouve l'étiquette de son prénom en capitales parmi 3 autres prénoms, puis les lettres de son prénom parmi d'autres (p. 51). Fiche : étiquettes du prénom à découper et « entoure les lettres de ton prénom ». |

### 3.2 Nouveaux exercices (classés par intérêt ; chacun sert aussi la MS et la GS, où le rapport est rouge aujourd'hui)

Le rapport `couverture.html` du 04/10/2026 donne « rien » en MS et en GS pour : composer et décomposer,
problèmes, longueurs, masses, solides, assemblages, motifs, jours et mois, syllabes. Les exercices ci-dessous
ont trois niveaux dès le départ.

1. **Les motifs** `/maternelle/motifs` (domaine `motifs`). PS : alternance AB (🔴⭐🔴⭐…), « Qu'est-ce qui vient
   après ? » parmi 2 choix ; variante « cache » : une case cachée à retrouver (p. 71). MS : ABC, AAB. GS : motifs
   évolutifs. Fiche : continuer le motif en coloriant ou avec des gommettes (cases vides en grand). Effort :
   environ 1 jour.
2. **Plus long, plus court** `/maternelle/longueurs` (domaine `grandeurs-mesures`, `comparer-longueurs-maternelle`).
   PS : 2 objets très différents (crayons, serpents, trains en SVG), « Montre le plus long » ; puis
   l'escalier : ranger 3 objets (p. 69-70). MS : différences plus petites, ranger 3 ou 4. GS : 5 objets, bande
   témoin. Fiche : entourer le plus long, colorier le plus court. Effort : environ 1 jour.
3. **La valise** `/maternelle/probleme` (`problemes-maternelle`, avec `composer-decomposer`). Courte animation :
   2 peluches dans la valise, on en ajoute 1, la valise se ferme, « Combien maintenant ? » (exemple exact de la
   p. 66). PS : total ≤ 3, ajout d'un seul objet. MS : ajout et retrait jusqu'à 6. GS : jusqu'à 10, partage. En
   papier, ce n'est pas un bon support : pas de fiche, mais des cartes à découper pour rejouer en classe.
   Effort : 1 à 1,5 jour.
4. **Range les images** `/maternelle/categories` (domaine `oral`, `categories-mots`). PS : deux boîtes (animaux /
   fruits) et 6 images, on touche une image puis sa boîte ; la voix nomme chaque image au toucher (vocabulaire,
   p. 47). MS : l'intrus parmi 4. GS : trouver le mot qui regroupe. Les emoji suffisent. Le contenu va dans
   `src/i18n/{fr,br}/contenu/categories.js` (breton à relire). Effort : environ 1 jour.
5. **Le jour, la nuit** `/maternelle/journee` (`moments-journee`, `chronologie-maternelle`). PS : « C'est le jour
   ou la nuit ? » (scènes 🌞 / 🌙), puis « Remets dans l'ordre » 3 images de la journée (se lever, manger,
   dormir), p. 24-25. MS : énoncer le moment, ordre d'une histoire en 3 ou 4 images. GS : 4 ou 5 étapes. Fiche :
   3 images à découper et à coller dans l'ordre. Effort : environ 1 jour (images SVG simples à dessiner).
6. **Où est le chat ?** `/maternelle/espace` (`reperes-espace`). PS : « Montre le chat **dans** la boîte » (sur,
   sous, devant, derrière), 3 images au choix (p. 26-27). Il faut des SVG composés (boîte, table, chat), car les
   emoji ne se superposent pas proprement. Effort : 1,5 jour, surtout pour les dessins.
7. **Frappe les syllabes** (`syllabes-orales`, dans `/maternelle/lettres` ou à part). PS : une image, la voix dit le
   mot, l'enfant touche un tambour autant de fois qu'il y a de syllabes (1 à 3) ; prénom en premier (p. 51).
   Réserve : la synthèse vocale découpe mal les syllabes. On s'appuie sur une liste de mots avec leur découpage
   écrit (« ba-teau »), affichée en ronds. Pas de version bretonne au début (le découpage breton est à faire
   valider). Effort : environ 1 jour.

Plus tard, avec du son enregistré : loto sonore (`sons-familiers`, p. 51), imagier de paires cour/tour (p. 49),
« le petit et l'adulte » des animaux (BO n° 19 p. 30, domaine absent de `programme.js`).

### 3.3 Fiches à imprimer et affiches

Rappel BO n° 19 p. 9 : on limite les fiches. On privilégie donc le **matériel à manipuler**, et les fiches
restent courtes : une consigne, de 4 à 6 items, en grand.

- **Graphisme PS** (nouveau générateur `/imprimer/graphisme`, domaine `ecriture`, `geste-ecriture-maternelle`) :
  - une page par tracé de base (traits verticaux : la pluie ; horizontaux : les chemins ; points : les
    confettis ; ronds : les bulles ; boucles : la fumée), d'après la p. 56 et BO n° 19 p. 17 ;
  - gros pointillés à repasser puis espace libre, A4 paysage ;
  - MS : ponts, vagues, croix ; GS : enchaînements avant la cursive ;
  - fiches toutes prêtes dans `catalogue.js` (niveaux « PS · MS ») ;
  - le pointillé SVG simple de `src/impression/ecriture.js` ne convient pas (lignage Seyès) : il faut un
    dessin à part ;
  - effort : environ 1,5 jour.
- **Matériel à découper** (nouveau, `genre: 'fiche'` dans les domaines concernés) :
  - cartes constellations et doigts de 1 à 3, puis 1 à 6 (`denombrer-3`, `composer-decomposer`) ;
  - cartes formes de toutes tailles, couleurs et orientations, pour trier (p. 68) ;
  - cartes images par catégorie (p. 47) ;
  - 3 images de la journée à remettre dans l'ordre ;
  - étiquettes prénom en capitales.
  - Un générateur commun « planche de cartes » (grille 3 × 4, traits de coupe) ; effort : environ 1 jour.
- **Coloriage, gommettes** : variantes « colorie » ou « colle une gommette » des fiches Motifs, Formes PS et
  Longueurs. Les cases sont de la taille d'une gommette (environ 15 mm) et ne demandent aucune lecture.
- **Affiches** :
  - « Les nombres de 1 à 3 / 1 à 6 / 1 à 10 » (quantité, doigts, constellation, chiffre), une variante par
    classe, dans `AFFICHES_PROGRAMME`. Il faut une branche dans `respecte()` de `tests/logique.test.mjs`
    (`v <= c.nombreMax`).
  - « Les moments de la journée » (matin, midi, après-midi, soir, nuit ; p. 24).
  - L'affiche de l'alphabet reste en MS et après. Le texte PS ne parle que des lettres du prénom.
  - La fiche « Ce que je sais faire » PS sort toute seule quand les affiches résumé seront visibles.

### 3.4 Breton

- Pas de voix bretonne (TODO l. 75). En interface `br` : pas de lecture automatique. On affiche la consigne en
  breton en gros, pour que l'adulte la lise. Le bouton 🔊 est caché, ou réservé aux fichiers audio enregistrés
  quand il y en aura.
- Les nombres 1 à 6 sont vérifiés (`src/utils/nombres.js` l. 79, formes masculines). Les formes féminines
  (*div*, *teir*, *peder*) et les mutations après le nombre passent par `regles()`. À relire pour chaque nouvelle
  consigne avec un nom.

---

## 4. Ordre conseillé, effort, décisions

### 4.1 Étapes livrables

| # | Étape | Fichiers | Effort | Livrable | État |
|---|---|---|---|---|---|
| 1 | Référentiel PS | `programme.js`, `savoirs.js`, `i18n/*/domaines.js` | 0,5 j + relecture enseignante (plan 07) | colonne PS dans `/programme` et dans le rapport | ✓ fait (b8c22ef) |
| 2 | La PS dans le site | `activites.js`, `exercices.js`, `telechargements.mjs`, `resume.js`, `affiches/catalogue.js`, `AboutView`, `MaternelleView`, tests | 0,5 j | filtre « Classe » PS (rien n'est encore marqué PS : la sortir seulement avec l'étape 3) | ✓ fait (b8c22ef, 99b5f6a) |
| 3 | `ConsigneParlee` + Compter PS + Comparer PS | composant, 2 vues, i18n, `programme-maths.test.mjs` | 1 j | premières cartes PS, fiches `exercices-compter-ps`, `exercices-comparer-ps` | ✓ fait (b8c22ef) |
| 4 | Formes : niveaux PS / MS / GS + mode « même forme » | `FormesView`, exercices.js (`C('ps')`, garder `ms-gs`) | 1 j | corrige aussi le rectangle montré en MS | ✓ fait (012a2e7) |
| 5 | Motifs, puis Longueurs | 2 nouvelles vues, routes, `outils.mjs` | 2 j | ferme 2 lignes rouges en PS, MS et GS | ✓ fait (012a2e7) |
| 6 | Graphisme PS + matériel à découper | 2 générateurs, catalogue | 2,5 j | premières fiches et affiches PS | à faire |
| 7 | Catégories, Journée, La valise | 3 vues | 3 à 3,5 j | domaine `oral` couvert pour la première fois | à faire |
| 8 | Lettres « Mon prénom », Espace, Syllabes | 2 ou 3 vues | 3 j | — | à faire |

Il faut livrer les étapes 1 à 3 ensemble : la PS ne doit pas apparaître dans le filtre sans au moins deux
exercices. Total pour une PS honnête (étapes 1 à 6) : environ 7,5 jours. Avec 7 et 8 : environ 14 jours.

### 4.2 Décisions à prendre (avec recommandation)

1. **« voire quatre »** : `nombreMax` 3 ou 4 ? *Recommandation* : 3 par défaut, avec une option « jusqu'à 4 »
   marquée « pour aller plus loin ». C'est la même lecture que le « voire au-delà » de la GS.
2. **Chiffres en PS** : les montrer ? *Recommandation* : en option, désactivée par défaut. Par défaut, on
   montre des constellations et des doigts, et on ne fait jamais tracer de chiffre.
3. **Étendre ou créer des compétences** : `formes-maternelle` et `geste-ecriture-maternelle` reçoivent la PS
   (libellé changé), ou on crée `formes-ps` et `graphisme-ps` ? *Recommandation* : étendre. C'est le même titre
   d'objectif dans le BO, et le tableau reste compact.
4. **Breton sans voix** : PS en breton avec la consigne lue par l'adulte, ou attendre des enregistrements ?
   *Recommandation* : publier avec la consigne écrite et lue par l'adulte, et prévoir les enregistrements dans
   le TODO.
5. **Renommer le domaine `temps-espace`** en « Se repérer dans le temps et l'espace » ? *Recommandation* : oui
   (l'`id` ne change pas, aucun slug ne change).
6. **Fiches PS** : combien ? *Recommandation* : peu, à cause du BO n° 19 p. 9. Graphisme et matériel à
   découper d'abord, une seule fiche par exercice PS, et 2 variantes prégénérées au lieu de 4.

### 4.3 Textes bretons à produire (tous `// br: à relire`)

- `CLASSES` : garder « PS », comme « MS » et « GS » qui ne sont pas traduits aujourd'hui.
- `src/i18n/br/domaines.js` : nouveau nom court de `temps-espace` si le domaine est renommé.
- `activites.js` `BR` : titre et description de Motifs, Longueurs, La valise, Catégories, Journée, Espace,
  Graphisme et matériel à découper.
- `src/i18n/br/views/maternelle/*.js` :
  - boutons PS ;
  - consignes PS (« Pet … a zo ? » existe déjà dans CompterView, avec la mutation à vérifier) ;
  - « Où y en a-t-il le plus ? », « Trouve la même forme », « Qu'est-ce qui vient après ? », « Montre le plus
    long », « C'est le jour ou la nuit ? ».
- `src/i18n/br/contenu/` : noms des images des catégories (beaucoup existent déjà dans `compter.js`, à
  réutiliser) et moments de la journée.
- Titres des fiches toutes prêtes en breton (`exercices.js`, `titre.br`) pour les nouvelles routes.
- Ne pas traduire : savoirs.js (affiches en français seulement), syllabes (le découpage breton est à valider
  d'abord).

### 4.4 Vérification (quand le code sera écrit)

- `npm test` (un seul à la fois), en particulier `logique` (cycle, savoirs, fiches par classe) et
  `programme-maths` (PS : maximum 3, rapport ≥ 2 en Comparer, aucune forme nommée).
- Liste des slugs avant et après : aucun ne disparaît, seuls des `-ps` apparaissent.
- Captures d'écran de chaque vue PS sur tablette (768 px) et sur téléphone, en fr et en br : boutons de 96 px ou
  plus, 4 choix au plus, consigne entendue.
- `npm run i18n` à 0 problème, puis `npm run i18n:relecture` pour la liste des textes bretons.
