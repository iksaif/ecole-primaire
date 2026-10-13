# Plan 16 — La géométrie du cycle 2 (CP, CE1, CE2) : ce que dit le BO, ce qu'on a, ce qu'on fait

**État (2026-10-13)** : étapes 0, 1 et 2 faites. Décisions prises avec l'accord de l'utilisateur (« go, on peut faire changer les fiches si
pertinent ») : `relier-points` abandonné ; les adresses des fiches publiées sont gardées quand une fiche y correspond encore (le contenu de
`-reproduction` et `-ce1-reperage` change, refait d'après le BO) ; les bilans `exercices-geometrie-ce1` / `-ce2` et `-ce2-reperage` (hors
programme) disparaissent ; repérage : « coder un déplacement » d'abord, les positions relatives plus tard. Les regards critiques (enfant,
enseignant·e) sont passés ; leurs suites qui sont des choix sont dans `docs/TODO.md` (« Géométrie, suites des regards critiques »).

Demande du 2026-10-12 : faire le point sur les vrais domaines et compétences de géométrie du CP au CE2, puis un plan pour ajouter ou
modifier les exercices (l'exercice `geometrie` existe et a du contenu ; on veut sans doute le découper ; on veut un `tracer-regle`).

Source : annexe 4 du BO n° 41 du 31 octobre 2024, `docs/programmes/c2maths.md`, pages 31 à 36 (pages du PDF). Citations exactes ; les
« exemples de réussite » sont ce que l'élève doit savoir faire, ce sont eux qui font foi pour un exercice.

## 1. Ce que dit le BO

Le domaine s'appelle **« Espace et géométrie »**. Il a trois parties au CP et au CE1, **deux au CE2** (pas de « repérage dans l'espace »
au CE2 : le sommaire et le texte sautent de la géométrie plane du CE2 à « Organisation et gestion de données »).

### Les solides

| | CP (p. 31-32) | CE1 (p. 33-34) | CE2 (p. 35) |
| --- | --- | --- | --- |
| Reconnaître | cube, boule, cône, cylindre, pavé | + pyramide | idem |
| Nommer | cube, pavé, boule | cube, boule, pavé, cône, pyramide | + cylindre |
| Décrire | cube, pavé avec « face » ; nombre et nature des faces | cube, pavé, pyramide : « face », « sommet », « arête » ; nombre d'arêtes et de sommets | + nature des faces d'une pyramide ; justifier par les faces |
| Construire | cubes et pavés (assembler les faces d'un modèle) | cube, pavé, pyramide | + **cube à partir d'un patron** ; dire si un assemblage est un patron du cube |
| Représentations | — | photos, perspective cavalière (associer, pas dessiner) | perspective : faces et arêtes cachées, pointillés |

Notes : « au CP […] le cube n'est pas considéré comme un pavé » ; activités suggérées : intrus, jeu de Kim, jeu du portrait.

### La géométrie plane

| | CP (p. 32) | CE1 (p. 34) | CE2 (p. 36) |
| --- | --- | --- | --- |
| Figures | reconnaître et nommer disque, carré, rectangle, triangle ; décrire carré, rectangle, triangle avec « sommet » et « côté » | + cercle, triangle rectangle ; nombre de sommets et de côtés d'un polygone | + losange ; polygone, quadrilatère, pentagone, hexagone |
| Propriétés | carré, rectangle : côtés égaux (pour justifier) | **angles et égalités de longueur des carrés et rectangles** ; « ce n'est pas un rectangle car… » | + losange ; « ce n'est pas un carré car… » |
| Alignement | **repérer visuellement des alignements ; utiliser la règle pour repérer ou vérifier des alignements** ; dire si trois points sont alignés (règle quand ce n'est pas évident) ; **tracer une droite passant par deux points** (horizontale, verticale, oblique) ; d'abord des objets réels, puis « des points (représentés par des petites croix) sur une feuille » | **repérer et tracer des points alignés** ; dire sans règle quand il n'y a aucun doute | — |
| Tracer, reproduire | règle comme instrument de tracé ; construire carré, rectangle, triangle ou un assemblage sur papier **quadrillé ou pointé** (côtés sur les lignes) ; **compléter un rectangle dont deux côtés consécutifs sont tracés, un carré dont un côté est tracé** ; gabarits et pochoirs | règle graduée, équerre, compas ; sur papier quadrillé, pointé ou uni, **compléter ou tracer** carré, rectangle, triangle, triangle rectangle ; **côtés obliques** possibles | + sur tout support, avec des **longueurs données** (rectangle 7 cm × 3 cm, carré de 6 cm et cercle de 4 cm de rayon…) ; codage des longueurs égales |
| Angle droit | — | **identifier et tracer** un angle droit (gabarit, puis équerre) ; aigu, obtus ; code de l'angle droit | dire si chaque angle d'un polygone est droit ; coder un rectangle |
| Cercle | — | tracer un cercle au compas, de centre donné, passant par un point ; centre | + rayon, diamètre |
| Milieu | — | trouver le milieu d'un segment (par pliage) | vocabulaire |
| Symétrie | — | — | **axe de symétrie** (pliage, calque, objets usuels, lettres) ; **compléter une figure** sur quadrillage ou papier pointé (axe vertical ou horizontal) |

### Le repérage dans l'espace (CP et CE1 seulement)

| | CP (p. 33) | CE1 (p. 34-35) |
| --- | --- | --- |
| Vocabulaire | gauche, droite ; sur, sous, entre, devant, derrière, au-dessus, en dessous | + à gauche, à droite ; près, loin |
| Plans | plan de la classe (positions des camarades, objet caché) ; choisir la photo qui correspond à une maquette | plan de l'école, du quartier ; itinéraire |
| Coder un déplacement | avancer, reculer, tourner à droite, à gauche, monter, descendre ; robot sur tapis quadrillé : « avancer d'une case », « pivoter d'un quart de tour à droite / à gauche » ; **au plus dix instructions, dont deux virages** | « avancer de… », pivoter ; **au plus quinze instructions, dont quatre virages** ; coder un déplacement qu'un autre trace sur un plan |
| Assemblages | assemblages de cubes et de pavés d'après un modèle 3D ou une photo | idem, ou d'après une perspective cavalière |

**Ce que le BO ne dit pas** : nommer une case par ses coordonnées (« B3 ») n'apparaît nulle part au cycle 2 (ni au cycle 3 : on y repère
des points sur une demi-droite graduée).

## 2. Ce qu'on a

### `src/data/programme.ts` (il fait foi : à corriger d'abord)

| Compétence | Classes | Écart avec le BO |
| --- | --- | --- |
| `figures-planes` | depuis CP | juste (listes `FIGURES_CP`, `_CE1`, `_CE2`) |
| `solides` | depuis CP | juste (`SOLIDES_CP`, `_CE1`) |
| `tracer-figures` | depuis CP | juste, mais son libellé (« sur quadrillage ») oublie le papier pointé et uni |
| `angle-droit` | depuis CE1 | juste |
| `symetrie` | depuis CE2 | juste |
| `patrons` | depuis CE2 | juste |
| `reperage-deplacements` | depuis CP | **inclut le CE2, que le BO n'a pas** ; libellé « coder un déplacement sur un quadrillage » juste |
| — | — | **manque : les alignements** (CP, CE1) |
| — | — | **manque : les positions relatives** (vocabulaire, plans), CP et CE1, si on veut les couvrir |

### Les exercices

- **Rien au CP**, en dehors des affiches : `geometrie` commence au CE1, `formes` s'arrête à la GS.
- **`geometrie`** (CE1, CE2 ; 1 594 lignes avec la vue) : neuf types de questions dans un seul exercice, sept compétences.

| Type | Classes | Ce qu'il fait | Rapport au BO |
| --- | --- | --- | --- |
| `figures` | CE1, CE2 | nommer, nombre de côtés, « a-t-il un angle droit ? » | juste ; manque le nombre de **sommets** |
| `solides` | CE1, CE2 | nommer, « roule ? », faces, sommets (cube, pavé ; + pyramide au CE2) | manque les **arêtes** (CE1) et la pyramide au CE1 ; « roule ? » est une bonne activité de tri |
| `reproduction` | CE1, CE2 | **colorier des cases** pour reproduire un assemblage de cases | le BO parle de **figures tracées** (segments) sur quadrillage ou papier pointé ; colorier des cases est plus proche de la maternelle (pavages) |
| `reperage` | CE1, CE2 | colorier la case « C4 », lire le nom d'une case | **hors programme** (coordonnées), et pas de repérage au CE2 ; le BO veut **coder un déplacement** (avancer, pivoter) |
| `angles` | CE2 | quels angles sont droits (lettres) | juste au CE2, **mais c'est aussi au CE1** |
| `proprietes` | CE2 | vrai ou faux sur carré, rectangle, losange, triangle rectangle | **aussi au CE1** pour carré et rectangle |
| `cercle` | CE2 | centre, rayon, diamètre | **le centre est au CE1** ; rayon, diamètre au CE2 : juste |
| `symetrie` | CE2 | compléter sur quadrillage (axe vertical ou horizontal) | juste |
| `patrons` | CE2 | est-ce un patron du cube ? | juste |

- Fiches publiées (`/telechargements/`) : `exercices-geometrie-ce1`, `-ce2` (bilans), et `-ce1-` / `-ce2-` suivis de `reproduction`, `reperage`,
  `solides`, `figures`, puis `-ce2-symetrie`, `-ce2-angles`, `-ce2-patrons`, chacune en `fr` et en `-br`.
- **`relier-points`** (non commité, cette session) : relier des nombres dans l'ordre. Ce n'est pas de la géométrie ; côté nombres, c'est un
  prétexte à « ordonner » et « compter de n en n », que `suites` et `ranger` couvrent déjà.

## 3. Le plan

Principe, comme pour la grammaire (`src/moteurs/grammaire/`, un exercice par compétence) : **d'abord découper sans rien changer** (les
fiches restent identiques, `npm run instantanes` le prouve), **ensuite corriger le contenu**, un exercice par commit, chaque écart
d'instantané justifié.

### Étape 0 — Le programme (`src/data/programme.ts`, puis `node scripts/generer/ids.mjs`)

1. Ajouter `alignements` : « Repérer et vérifier des alignements à la règle ; tracer la droite qui passe par deux points », `['cp', 'ce1']`,
   sources p. 32 et p. 34.
2. `reperage-deplacements` : retirer le CE2 (CP, CE1, puis cycle 3), avec la raison écrite.
3. `tracer-figures` : libellé « sur papier quadrillé, pointé ou uni ».
4. (si on les couvre) `positions-relatives` : CP, CE1.

### Étape 1 — Découper `geometrie` sans rien changer

Le code commun passe dans `src/moteurs/geometrie/` (générateur, fiche, données, dessins) ; chaque exercice est une définition mince :

| Exercice | Route | Compétences | Types repris | Fiches (slugs gardés) |
| --- | --- | --- | --- | --- |
| `figures` | `/maths/figures` | `figures-planes`, `angle-droit` | figures, proprietes, angles, cercle | `-ce1-figures`, `-ce2-figures`, `-ce2-angles` |
| `solides` | `/maths/solides` | `solides`, `patrons` | solides, patrons | `-ce1-solides`, `-ce2-solides`, `-ce2-patrons` |
| `symetrie` | `/maths/symetrie` | `symetrie` | symetrie | `-ce2-symetrie` |
| `reperage` | `/maths/reperage` | `reperage-deplacements` | reperage (en attendant l'étape 2) | `-ce1-reperage`, `-ce2-reperage` |
| `reproduction` va dans `tracer-regle` (étape 2) | | | | `-ce1-reproduction`, `-ce2-reproduction` |

`/maths/geometrie` renvoie vers `/maths` (comme `/francais/grammaire`). Les bilans `exercices-geometrie-ce1` et `-ce2` : à décider (voir
les questions).

Critère de fin : `npm run instantanes` sans `--maj`, mêmes PDF pour les slugs gardés.

### Étape 2 — Le contenu, exercice par exercice

1. **`tracer-regle`** (nouveau ; CP, CE1, CE2 ; `alignements`, `tracer-figures`). À l'écran, on touche des points ; sur la fiche, on trace
   à la règle.
   - **Alignés ?** (CP, CE1) : A, B et trois croix ; laquelle est alignée avec A et B ? Après la réponse, la droite (AB) se trace. CP :
     des écarts visibles ; CE1 : plus fins (« sans règle quand il n'y a aucun doute », sinon la règle). Fiche : « Trace à la règle la
     droite qui passe par A et B, entoure les points alignés. »
   - **Compléter** (CP : côtés sur les lignes ; CE1 : obliques possibles) : un rectangle dont deux côtés consécutifs sont tracés, un
     carré dont un côté est tracé, sur papier pointé ; on touche le ou les sommets qui manquent. Fiche : « Termine à la règle. »
   - **Reproduire** (CP, CE1, CE2) : un modèle sur papier pointé ou quadrillé, une grille vide ; on relie les points pour reproduire
     (carré, rectangle, triangle, triangle rectangle, un assemblage) ; remplace le coloriage de cases (slugs `-reproduction` gardés,
     contenu changé et justifié).
   - **Longueurs données** (CE2, fiche seulement) : « Trace un rectangle de 7 cm sur 3 cm » sur papier uni, à la règle graduée.
2. **`reperage`** : remplacer les coordonnées par **coder un déplacement** sur un quadrillage (avancer d'une case, pivoter d'un quart
   de tour) : lire un programme et trouver la case d'arrivée, ou écrire le programme d'un trajet. CP : au plus 10 instructions dont 2 virages ;
   CE1 : 15 dont 4 ; plus de CE2. Option : positions relatives (sur, sous, entre, à gauche de…) avec des images. Le slug
   `-ce2-reperage` n'a plus de contenu au programme : à décider.
3. **`figures`** : ouvrir le **CP** (disque, carré, rectangle, triangle : nommer, côtés, sommets) ; au **CE1**, ajouter `proprietes`
   (carré, rectangle), `angles` (angle droit, aigu, obtus) et le centre du cercle ; partout, le nombre de **sommets**.
4. **`solides`** : ouvrir le **CP** (reconnaître cube, boule, cône, cylindre, pavé ; nommer cube, pavé, boule ; faces) ; au CE1, les
   **arêtes** et la pyramide ; au CE2, la perspective (faces cachées).
5. **`symetrie`** : rien à changer pour le BO.

À chaque exercice créé ou reporté : les deux regards critiques (`docs/critiques/`), avec des captures.

### Ce qui reste hors des exercices à l'écran

Construire des solides, plier pour trouver un milieu, tracer au compas : des **fiches** (ou rien), pas de jeu à l'écran. Le plan de la
classe, de l'école : en classe, pas ici.

## 4. Questions pour l'utilisateur

1. **`relier-points`** : recommandation : **le supprimer** (pas de compétence propre ; `suites` et `ranger` font déjà le travail). Ou le
   garder comme fiche « pour le plaisir » de `suites` (compter de n en n pour relier), sans exercice propre.
2. **Les adresses** : garder les slugs publiés (`exercices-geometrie-ce1-figures`…) en les servant depuis les nouveaux exercices, ou les
   libérer comme pour la grammaire (« adresses publiées libres », redirections plus tard) ?
3. **Les bilans** `exercices-geometrie-ce1` et `-ce2` : les supprimer (comme la grammaire, pas de bilan) ou garder une fiche « bilan de
   géométrie » ?
4. **Repérage** : seulement « coder un déplacement », ou aussi les positions relatives (sur, sous, entre…) ?
5. **L'ordre** : je propose étape 0, étape 1, puis `tracer-regle` (la demande d'origine), puis `reperage` (le seul hors programme
   aujourd'hui), puis l'ouverture du CP.
